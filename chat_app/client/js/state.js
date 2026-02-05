/**
 * State Management Module
 * Stores current user, active sessions, and application state
 */

const state = {
    // My Identity
    user: {
        username: null,
        avatar: null,
        publicKey: null,  // CryptoKey (Private)
        keyPair: null     // { publicKey, privateKey }
    },

    // Session
    socket: null,
    connected: false,

    // Data
    users: [],        // List of other users connected
    messages: {},     // Map: userId -> [Message objects]

    // Active Context
    activeChatUser: null, // userId of current chat

    // Security Contexts
    sharedKeys: new Map() // userId -> CryptoKey (AES-GCM Shared Secret)
};

// --- Getters & Setters ---

export function getUser() {
    return state.user;
}

export function setUser(userData) {
    state.user = { ...state.user, ...userData };
}

export function setKeyPair(keyPair) {
    state.user.keyPair = keyPair;
}

export function getSocket() {
    return state.socket;
}

export function setSocket(socket) {
    state.socket = socket;
    state.connected = !!socket;
}

export function getUsers() {
    return state.users;
}

export function setUsers(usersList) {
    state.users = usersList;
}

export function getActiveChat() {
    return state.activeChatUser;
}

export function setActiveChat(userId) {
    state.activeChatUser = userId;
}

export function addMessage(userId, message) {
    if (!state.messages[userId]) {
        state.messages[userId] = [];
    }
    state.messages[userId].push(message);
}

export function getMessages(userId) {
    return state.messages[userId] || [];
}

export function getSharedKey(userId) {
    return state.sharedKeys.get(userId);
}

export function setSharedKey(userId, key) {
    state.sharedKeys.set(userId, key);
}
