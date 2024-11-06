import express from 'express';
import { Server } from 'socket.io';
import { createClient } from "@retconned/kick-js";
import http from 'http';
import cors from 'cors';

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// app.get('/', (req, res) => {
//     res.sendFile(__dirname + '/public/index.html');
// });

// Mapa para guardar las instancias de TikTokLiveControl por sala
const Livescreated = new Map();
const LiveEvents = ['ready', 'ChatMessage', 'Subscription', 'disconnected', 'login','close'];

class TiktokLiveControl {
    constructor(uniqueId, options) {
        this.uniqueId = this.normalizeUniqueId(uniqueId);
        this.kickliveconnector = createClient(uniqueId, { logger: true });
        this.isConnected = false;
        this.options = options;
        this.state = this.kickliveconnector || {};
        this.emiteduser = new Map();
        this.eventHandlersInitialized = false; // Nuevo indicador
    }

    normalizeUniqueId(uniqueId) {
        return uniqueId.trim();
    }

    static isValidUniqueId(uniqueId) {
        if (!uniqueId) return false;
        uniqueId = uniqueId.trim();
        return uniqueId.length >= 2 && /^[a-zA-Z0-9._]+$/.test(uniqueId);
    }

    getState() {
        if (this.emiteduser.has(this.uniqueId)) {
            this.initializeEventHandlers();
        }
        return this.state;
    }

    initializeEventHandlers() {
        if (this.eventHandlersInitialized) return; // Evitar re-inicialización

        LiveEvents.forEach(event => {
            this.kickliveconnector.on(event, (data) => {
                io.to(this.uniqueId).emit(event, data);
                if (event === 'disconnected') {
                    console.log(`${event} event for ${this.uniqueId}`);
                    this.isConnected = false;
                }
            });
        });
        
        this.eventHandlersInitialized = true; // Marcar como inicializado
    }

    disconnect() {
        if (this.kickliveconnector) {
            this.isConnected = false;
            this.kickliveconnector = null;
        }
    }
}

async function getOrCreateLiveConnection(uniqueId, socket) {
    const normalizedId = uniqueId.trim();
    let existingConnection = Livescreated.get(normalizedId);

    if (existingConnection) {
        if (socket && existingConnection.isConnected) {
            socket.emit('connected', existingConnection.getState());
        }
        return existingConnection;
    }

    if (!TiktokLiveControl.isValidUniqueId(normalizedId)) {
        throw new Error('Invalid TikTok username format');
    }

    const newConnection = new TiktokLiveControl(normalizedId, socket.id);
    try {
        Livescreated.set(normalizedId, newConnection);
        newConnection.isConnected = true;
        newConnection.initializeEventHandlers(); // Inicializar eventos solo una vez
        return newConnection;
    } catch (err) {
        throw new Error(`Failed to create new connection for ${normalizedId}: ${err.message}`);
    }
}

function getLivesInfo(livesMap) {
    return Array.from(livesMap).map(([uniqueId, liveControl]) => ({
        uniqueId: liveControl.uniqueId,
        isConnected: liveControl.isConnected,
        state: liveControl.state
    }));
}

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id, "available connections", Livescreated);
    socket.emit('allromuser', getLivesInfo(Livescreated));

    socket.on('joinRoom', async ({ uniqueId }) => {
        try {
            const connection = await getOrCreateLiveConnection(uniqueId, socket);

            socket.join(connection.uniqueId);
            console.log(`User ${socket.id} joined room: ${connection.uniqueId}`);
            
            socket.emit('message', {
                type: 'success',
                message: `Connected to TikTok live room: ${connection.uniqueId}`
            });
        } catch (error) {
            socket.emit('message', {
                type: 'error',
                message: error.message
            });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const port = parseInt(process.env.PORT) || 9000;
server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});