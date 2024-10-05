import express from 'express';
import { WebcastPushConnection } from 'tiktok-live-connector';
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Mapa para guardar las instancias de TikTokLiveControl por sala
const Livescreated = new Map();
const LiveEvents = [
  'chat', 'gift', 'connected', 'disconnected',
  'websocketConnected', 'error', 'member', 'roomUser',
  'like', 'social', 'emote', 'envelope', 'questionNew',
  'subscribe', 'follow', 'share'
];

class TiktokLiveControl {
  constructor(uniqueId, options) {
    this.uniqueId = uniqueId;
    this.tiktokLiveConnection = new WebcastPushConnection(this.uniqueId);
    this.isConnected = null;
    this.options = options;
  }

  async connect() {
    try {
      const state = await this.tiktokLiveConnection.connect();
      console.log(`Connected to roomId ${state.roomId}`, state);
      Livescreated.set(this.uniqueId, this); // Guardar en el mapa la instancia
      this.initializeEventHandlers(); // Inicializar los eventos
    } catch (err) {
      console.error('Failed to connect', this.uniqueId, err);
    }
  }

  initializeEventHandlers() {
    LiveEvents.forEach(event => {
      this.tiktokLiveConnection.on(event, (data) => {
        // Emitir el evento a todos los usuarios en la sala (room)
        io.to(this.uniqueId).emit(event, data); // Envía el evento a todos en la sala
        if (event === 'disconnected') {
          console.log(event, this.uniqueId);
        }
      });
    });
  }
}


// Conexión con Socket.IO
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Unirse a una sala (conectar a un live de TikTok)
  socket.on('joinRoom', async ({ uniqueId }) => {
    if (!Livescreated.has(uniqueId)) {
      // Crear una nueva instancia si no existe
      const tiktokLive = new TiktokLiveControl(uniqueId);
      await tiktokLive.connect(); // Conectar al live de TikTok
      Livescreated.set(uniqueId, tiktokLive); // Guardar la instancia
    }

    // Unir al usuario a la sala específica
    socket.join(uniqueId);
    console.log(`User ${socket.id} joined room: ${uniqueId}`);

    // Enviar un mensaje de bienvenida a la sala
    socket.emit('message', `Welcome to the TikTok live room: ${uniqueId}`);
  });

  // Al desconectarse el usuario
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Configurar el servidor para escuchar en el puerto
const port = parseInt(process.env.PORT) || 3000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
