/**
 * Network Module
 * Handles WebSocket connection and message routing
 */
import * as State from './state.js';
import * as UI from './ui.js';
import * as Crypto from './crypto.js';

// Configuration
const SERVER_URL = 'ws://' + window.location.host;

export function connect() {
    const ws = new WebSocket(SERVER_URL);

    ws.onopen = async () => {
        console.log('Connected to Signaling Server');
        State.setSocket(ws);

        // Announce Presence
        const user = State.getUser();

        // Export Public Key to JWK to send over network
        const pubKeyJwk = await Crypto.exportPublicKey(user.publicKey);

        sendMessage({
            type: 'JOIN',
            payload: {
                username: user.username,
                avatar: user.avatar,
                publicKey: pubKeyJwk
            }
        });
    };

    ws.onmessage = async (event) => {
        try {
            const data = JSON.parse(event.data);
            handleMessage(data);
        } catch (e) {
            console.error('Invalid message received:', e);
        }
    };

    ws.onclose = () => {
        console.log('Disconnected from server');
        State.setSocket(null);
        UI.updateConnectionStatus(false);
    };

    ws.onerror = (err) => {
        console.error('WebSocket error:', err);
    };
}

export function sendMessage(message) {
    const socket = State.getSocket();
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
    } else {
        console.error('Cannot send message, socket not open');
    }
}

async function handleMessage(data) {
    switch (data.type) {
        case 'USER_LIST':
            State.setUsers(data.payload);
            UI.renderUserList(data.payload);
            break;

        case 'ENCRYPTED_MESSAGE':
            // payload: { from: userId, ciphertext: { iv, data } }
            const fromUser = State.getUsers().find(u => u.id === data.payload.from);
            // Note: If server doesn't send 'from', we can't identify sender. 
            // Assumption: Server is handling it or we patched it.
            // If fromUser is null, we can't decrypt meaningfully without shared key context.
            if (!fromUser) return;

            // 1. Get/Derive Shared Key
            let sharedKey = State.getSharedKey(fromUser.id);
            if (!sharedKey) {
                if (fromUser.publicKey) {
                    const remoteKey = await Crypto.importPublicKey(fromUser.publicKey);
                    const myKeyPair = State.getUser().keyPair;
                    sharedKey = await Crypto.deriveSharedKey(myKeyPair.privateKey, remoteKey);
                    State.setSharedKey(fromUser.id, sharedKey);
                } else {
                    console.error('Cannot decrypt: No public key for user', fromUser.username);
                    return;
                }
            }

            // 2. Decrypt
            const plaintextJSON = await Crypto.decryptMessage(data.payload.body, sharedKey);

            if (plaintextJSON) {
                let text, ttl;
                try {
                    const parsed = JSON.parse(plaintextJSON);
                    text = parsed.text;
                    ttl = parsed.ttl;
                } catch (e) {
                    // Fallback for backward compatibility
                    text = plaintextJSON;
                    ttl = 0;
                }

                const msgObj = {
                    senderId: fromUser.id,
                    text: text,
                    timestamp: Date.now(),
                    ttl: ttl
                };
                State.addMessage(fromUser.id, msgObj);
                UI.appendMessageIfActive(fromUser.id, msgObj);
                UI.notifyNewMessage(fromUser.id);
            }
            break;

        case 'TYPING':
            // Assuming server logic: needs 'from' in payload or wrapping
            // For now, if we get TYPING, check if it has a specific user associated or we just know "someone" is typing
            // Ideally: UI.handleTyping(data.from);
            if (data.from) UI.handleTyping(data.from);
            break;

        case 'SYSTEM_MESSAGE':
            console.log('System:', data.payload.text);
            break;
    }
}

// Helper to send encrypted message
export async function sendEncryptedMessage(targetUserId, text, ttl = 0) {
    const targetUser = State.getUsers().find(u => u.id === targetUserId);
    if (!targetUser) return;

    // 1. Get/Derive Shared Key
    let sharedKey = State.getSharedKey(targetUserId);
    if (!sharedKey) {
        const remoteKey = await Crypto.importPublicKey(targetUser.publicKey);
        const myKeyPair = State.getUser().keyPair;
        sharedKey = await Crypto.deriveSharedKey(myKeyPair.privateKey, remoteKey);
        State.setSharedKey(targetUserId, sharedKey);
    }

    // 2. Encrypt
    // Payload is JSON string { text: "...", ttl: 10000 }
    const payloadContent = JSON.stringify({ text, ttl });
    const encryptedData = await Crypto.encryptMessage(payloadContent, sharedKey);

    // 3. Send
    sendMessage({
        type: 'ENCRYPTED_MESSAGE',
        to: targetUserId,
        payload: {
            from: 'ME', // Server must overwrite this with real ID
            body: encryptedData // { iv, data }
        }
    });

    // 4. Local Display
    const msgObj = {
        senderId: 'ME', // Special ID for self
        text: text,
        timestamp: Date.now(),
        ttl: ttl
    };
    State.addMessage(targetUserId, msgObj);
    UI.appendMessageIfActive(targetUserId, msgObj);
}

export function sendTyping(targetUserId) {
    if (!targetUserId) return;
    sendMessage({
        type: 'TYPING',
        to: targetUserId,
        payload: { isTyping: true }
    });
}
