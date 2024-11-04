import { WebcastPushConnection, signatureProvider } from 'tiktok-live-connector';
import { join } from 'path';
// Configura el API Key de TikTok (asegúrate de que esta clave es válida)
signatureProvider.config.extraParams.apiKey = "NmYzMGMwNmMzODQ5YmUxYjkzNTI0OTIyMzBlOGZlMjgwNTJhY2JhMWQ0MzhhNWVmMGZmMjgy";

// Map para almacenar las conexiones de TikTok Live
const Livescreated = new Map();

import { readdirSync, statSync } from 'fs';

const PORT = process.env.PORT || 3000;
const publicPath = join(process.cwd(), "public"); // Carpeta pública

// Función para servir el contenido de la carpeta pública
const server = Bun.serve({
    port: PORT,
    fetch(req) {
        let urlPath = new URL(req.url).pathname;
        let filePath = join(publicPath, urlPath);
        if (server.upgrade(req)) {
            return;
        }
        try {
            const fileStat = statSync(filePath);

            // Si es un directorio, busca "index.html"
            if (fileStat.isDirectory()) {
                filePath = join(filePath, "index.html");
            }

            // Sirve el archivo encontrado
            return new Response(Bun.file(filePath));
        } catch (error) {
            return new Response("File not found", { status: 404 });
        }
    },
    websocket: {
        idleTimeout: 60, // 60 seconds
        open(ws) {
            console.log("New WebSocket connection");
        },
        message(ws, message) {
            const { action, uniqueId } = JSON.parse(message);
            console.log("message", action, uniqueId);
            if (action === "joinRoom" && uniqueId) {
                getOrCreateLiveConnection(uniqueId, ws).then(connection => {
                    ws.send(JSON.stringify({
                        type: 'success',
                        message: `Connected to TikTok live room: ${connection.uniqueId}`
                    }));
                }).catch(err => {
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: err.message
                    }));
                });
            }
        },
        close(ws) {
            console.log("WebSocket connection closed");
        }
    }
});
server.publish("the-group-chat", "Hello world");
console.log(`Server running at http://localhost:${PORT}`);

// Define la clase y métodos para gestionar la conexión con TikTok
class TiktokLiveControl {
    constructor(uniqueId) {
        this.uniqueId = this.normalizeUniqueId(uniqueId);
        this.tiktokLiveConnection = new WebcastPushConnection(this.uniqueId, {
            processInitialData: true,
            enableExtendedGiftInfo: true,
            enableWebsocketUpgrade: false,
            requestPollingIntervalMs: 2000,
            requestOptions: { timeout: 10000 },
            websocketOptions: { timeout: 10000 },
        });
        this.isConnected = false;
        this.state = {};
    }

    normalizeUniqueId(uniqueId) {
        uniqueId = uniqueId.trim();
        return uniqueId.startsWith('@') ? uniqueId : '@' + uniqueId;
    }

    static isValidUniqueId(uniqueId) {
        if (!uniqueId) return false;
        uniqueId = uniqueId.trim();
        if (uniqueId.startsWith('@')) uniqueId = uniqueId.substring(1);
        return uniqueId.length >= 2 && /^[a-zA-Z0-9._]+$/.test(uniqueId);
    }

    async connect(ws) {
        try {
            const state = await this.tiktokLiveConnection.connect();
            console.log(`Connected to roomId ${state.roomId}`);
            this.isConnected = true;
            this.state = state;
            if (ws) ws.send(JSON.stringify({ type: 'connected', state: this.state }));
        } catch (err) {
            this.isConnected = false;
            console.error('Failed to connect:', err);
            if (ws) ws.send(JSON.stringify({ type: 'error', message: err.message }));
        }
    }
}

// Función para obtener o crear una instancia de TiktokLiveControl
async function getOrCreateLiveConnection(uniqueId, ws) {
    const normalizedId = uniqueId.startsWith('@') ? uniqueId : '@' + uniqueId;
    let existingConnection = Livescreated.get(normalizedId);

    if (existingConnection) {
        if (!existingConnection.isConnected) await existingConnection.connect(ws);
        return existingConnection;
    }

    if (!TiktokLiveControl.isValidUniqueId(normalizedId)) {
        throw new Error("Invalid TikTok username format");
    }

    const newConnection = new TiktokLiveControl(normalizedId);
    await newConnection.connect(ws);
    Livescreated.set(normalizedId, newConnection);
    return newConnection;
}
