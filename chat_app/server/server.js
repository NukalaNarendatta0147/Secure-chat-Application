const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const fs = require('fs');

// Configuration
const PORT = 3000;

// Create HTTP server to serve static files
const server = http.createServer((req, res) => {
    const safeSuffix = path.normalize(req.url).replace(/^(\.\.[\/\\])+/, '');

    let filePath = path.join(__dirname, '../client', safeSuffix);
    if (req.url === '/') filePath = path.join(__dirname, '../client/index.html');

    const extname = path.extname(filePath);
    let contentType = 'text/html';
    switch (extname) {
        case '.js': contentType = 'text/javascript'; break;
        case '.css': contentType = 'text/css'; break;
        case '.json': contentType = 'application/json'; break;
        case '.png': contentType = 'image/png'; break;
        case '.jpg': contentType = 'image/jpg'; break;
        case '.wav': contentType = 'audio/wav'; break;
    }

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code == 'ENOENT') {
                res.writeHead(404);
                res.end('404 Not Found');
            } else {
                res.writeHead(500);
                res.end('500 Internal Server Error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// Create WebSocket Server
const wss = new WebSocket.Server({ server });

// State
const clients = new Map(); // ws -> metadata

function broadcast(type, payload, excludeWs = null, room = null) {
    const message = JSON.stringify({ type, payload });
    wss.clients.forEach(client => {
        const clientData = clients.get(client);
        // If room is specified, only send to clients in that room
        if (room && clientData?.room !== room) return;

        if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// Handle Connections
wss.on('connection', (ws) => {
    console.log('New connection established');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            const user = clients.get(ws);

            switch (data.type) {
                case 'JOIN':
                    // User is announcing their identity
                    const newUser = {
                        ...data.payload,
                        id: Math.random().toString(36).substr(2, 9),
                        status: 'online',
                        room: 'Lobby' // Default room
                    };
                    clients.set(ws, newUser);

                    // Notify Lobby
                    // Send list of users in Lobby to the new user
                    // And notify others in Lobby
                    broadcast('USER_LIST', Array.from(clients.values()).filter(c => c.room === 'Lobby'), null, 'Lobby');
                    broadcast('SYSTEM_MESSAGE', { text: `${newUser.username} has joined.` }, null, 'Lobby');
                    break;

                case 'JOIN_ROOM':
                    if (user) {
                        const oldRoom = user.room;
                        const newRoom = data.payload.roomName;
                        user.room = newRoom;

                        // Notify old room
                        broadcast('USER_LIST', Array.from(clients.values()).filter(c => c.room === oldRoom), null, oldRoom);

                        // Notify new room
                        broadcast('USER_LIST', Array.from(clients.values()).filter(c => c.room === user.room), null, user.room);
                        broadcast('SYSTEM_MESSAGE', { text: `${user.username} joined room ${user.room}` }, null, user.room);
                    }
                    break;

                case 'OFFER':
                case 'ANSWER':
                case 'CANDIDATE':
                case 'ENCRYPTED_MESSAGE':
                    if (data.to) {
                        // Direct Message
                        let targetWs = null;
                        for (let [client, metadata] of clients.entries()) {
                            if (metadata.id === data.to) {
                                targetWs = client;
                                break;
                            }
                        }
                        if (targetWs && targetWs.readyState === WebSocket.OPEN) {
                            // Inject 'from' ID so receiver knows who sent it!
                            const relayed = { ...data };
                            if (user) relayed.payload.from = user.id;
                            targetWs.send(JSON.stringify(relayed));
                        }
                    } else {
                        // Broadcast to Room
                        if (user) {
                            // Inject 'from'
                            const relayed = { ...data };
                            relayed.payload.from = user.id;
                            broadcast(data.type, relayed.payload, ws, user.room);
                        }
                    }
                    break;

                case 'TYPING':
                    if (user) {
                        const payload = { ...data.payload, from: user.id };
                        if (data.to) {
                            // DM Typing
                            for (let [client, metadata] of clients.entries()) {
                                if (metadata.id === data.to) {
                                    client.send(JSON.stringify({ type: 'TYPING', payload }));
                                    break;
                                }
                            }
                        } else {
                            // Room Typing
                            broadcast('TYPING', payload, ws, user.room);
                        }
                    }
                    break;
            }
        } catch (e) {
            console.error('Failed to parse message:', e);
        }
    });

    ws.on('close', () => {
        const user = clients.get(ws);
        if (user) {
            console.log(`${user.username} disconnected`);
            clients.delete(ws);
            broadcast('USER_LIST', Array.from(clients.values()).filter(c => c.room === user.room), null, user.room);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Secure Messenger Node running on http://localhost:${PORT}`);
});
