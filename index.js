import express from 'express';
import { Server } from 'socket.io';
import { createClient } from "@retconned/kick-js";
import { WebcastPushConnection } from 'tiktok-live-connector';
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

// Mapa para guardar las instancias de kickLivecontrol por sala
const LiveEvents = ['ready', 'ChatMessage', 'Subscription', 'disconnected', 'login','close'];
const tiktokLiveEvents = [
    'chat', 'gift', 'connected', 'disconnected',
    'websocketConnected', 'error', 'member', 'roomUser',
    'like', 'social', 'emote', 'envelope', 'questionNew',
    'subscribe', 'follow', 'share', 'streamEnd'
];
// Enum para los tipos de plataforma
const PlatformType = {
    TIKTOK: 'tiktok',
    KICK: 'kick'
};

// Clase base para el manejo de plataformas
class PlatformConnection {
    constructor(uniqueId, options = {}) {
        this.uniqueId = uniqueId;
        this.options = options;
        this.isConnected = false;
        this.state = {};
        this.eventHandlersInitialized = false;
    }

    normalizeUniqueId(uniqueId) {
        return uniqueId.trim();
    }

    getState() {
        return this.state;
    }

    disconnect() {
        this.isConnected = false;
    }
}

// Clase específica para TikTok que extiende de PlatformConnection
class TiktokConnection extends PlatformConnection {
    constructor(uniqueId, options) {
        super(uniqueId, options);
        this.tiktokLiveConnection = new WebcastPushConnection(this.normalizeUniqueId(uniqueId), {
            processInitialData: true,
            enableExtendedGiftInfo: true,
            enableWebsocketUpgrade: true,
            requestPollingIntervalMs: 2000,
            requestOptions: { timeout: 10000 },
            websocketOptions: { timeout: 10000 },
        });
    }

    normalizeUniqueId(uniqueId) {
        uniqueId = uniqueId.trim();
        return uniqueId.startsWith('@') ? uniqueId : '@' + uniqueId;
    }

    async connect(socket) {
        try {
            const state = await this.tiktokLiveConnection.connect();
            this.isConnected = true;
            this.state = state;
            this.initializeEventHandlers(socket);
            if (socket) {
                socket.emit('connected', this.getState());
            }
            return state;
        } catch (err) {
            console.error('Failed to connect to TikTok:', err);
            if (socket) {
                socket.emit('streamEnd', err.message);
            }
            throw err;
        }
    }

    initializeEventHandlers(socket) {
        if (this.eventHandlersInitialized) return;

        tiktokLiveEvents.forEach(event => {
            this.tiktokLiveConnection.on(event, (data) => {
                io.to(this.uniqueId).emit(event, data);
                if (event === 'disconnected') {
                    console.log(`TikTok ${event} event for ${this.uniqueId}`);
                    this.isConnected = false;
                }
            });
        });

        this.eventHandlersInitialized = true;
    }

    disconnect() {
        if (this.tiktokLiveConnection) {
            this.tiktokLiveConnection.disconnect();
            super.disconnect();
        }
    }
}

// Clase específica para Kick que extiende de PlatformConnection
class KickConnection extends PlatformConnection {
    constructor(uniqueId, options) {
        super(uniqueId, options);
        this.kickliveconnector = createClient(uniqueId, { logger: true });
    }

    normalizeUniqueId(uniqueId) {
        return uniqueId.trim();
    }

    async connect(socket) {
        try {
            this.isConnected = true;
            this.initializeEventHandlers(socket);
            if (socket) {
                socket.emit('connected', this.getState());
            }
            return this.state;
        } catch (err) {
            console.error('Failed to connect to Kick:', err);
            throw err;
        }
    }

    initializeEventHandlers(socket) {
        if (this.eventHandlersInitialized) return;

        LiveEvents.forEach(event => {
            this.kickliveconnector.on(event, (data) => {
                io.to(this.uniqueId).emit(event, data);
                if (event === 'disconnected') {
                    console.log(`Kick ${event} event for ${this.uniqueId}`);
                    this.isConnected = false;
                }
            });
        });

        this.eventHandlersInitialized = true;
    }

    disconnect() {
        if (this.kickliveconnector) {
            this.kickliveconnector = null;
            super.disconnect();
        }
    }
}

// Mapa para mantener las conexiones activas por plataforma
const platformConnections = {
    [PlatformType.TIKTOK]: new Map(),
    [PlatformType.KICK]: new Map()
};

// Función unificada para obtener o crear conexiones
async function getOrCreatePlatformConnection(platform, uniqueId, socket) {
    const connections = platformConnections[platform];
    const normalizedId = platform === PlatformType.TIKTOK ? 
        (uniqueId.startsWith('@') ? uniqueId : '@' + uniqueId) : 
        uniqueId.trim();
    console.log(`getOrCreatePlatformConnection: ${platform} ${normalizedId}`);
    // Verificar conexión existente
    let connection = connections.get(normalizedId);
    if (connection) {
        if (!connection.isConnected) {
            try {
                await connection.connect(socket);
            } catch (err) {
                throw new Error(`Failed to reconnect to ${platform} ${normalizedId}: ${err.message}`);
            }
        }
        if (socket && connection.isConnected) {
            socket.emit('connected', connection.getState());
        }
        return connection;
    }

    // Crear nueva conexión según la plataforma
    try {
        connection = platform === PlatformType.TIKTOK ?
            new TiktokConnection(normalizedId, { socketId: socket.id }) :
            new KickConnection(normalizedId, { socketId: socket.id });
        console.log(`conexión: ${platform} ${normalizedId}`);
        await connection.connect(socket);
        connections.set(normalizedId, connection);
        return connection;
    } catch (err) {
        throw new Error(`Failed to create new ${platform} connection for ${normalizedId}: ${err.message}`);
    }
}

// Función para obtener información de todas las conexiones activas
function getAllConnectionsInfo() {
    const allConnections = [];
    
    Object.entries(platformConnections).forEach(([platform, connections]) => {
        connections.forEach((connection, uniqueId) => {
            allConnections.push({
                platform,
                uniqueId: connection.uniqueId,
                isConnected: connection.isConnected,
                state: connection.getState()
            });
        });
    });
    
    return allConnections;
}

// Actualización del manejador de conexiones Socket.IO
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    socket.emit('allConnections', getAllConnectionsInfo());

    socket.on('joinRoom', async ({ platform, uniqueId }) => {
        try {
            if (!Object.values(PlatformType).includes(platform)) {
                throw new Error('Invalid platform specified');
            }

            const connection = await getOrCreatePlatformConnection(platform, uniqueId, socket);
            socket.join(connection.uniqueId);
            
            console.log(`User ${socket.id} joined ${platform} room: ${connection.uniqueId}`);
            
            socket.emit('message', {
                type: 'success',
                message: `Connected to ${platform} live room: ${connection.uniqueId}`
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
