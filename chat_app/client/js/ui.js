/**
 * UI Controller
 * Handles DOM manipulation and View rendering
 */
import * as State from './state.js';
import * as Network from './network.js';

// DOM Elements
const screens = {
    login: document.getElementById('login-screen'),
    chat: document.getElementById('chat-interface')
};

const elements = {
    avatarGrid: document.getElementById('avatar-grid'),
    usersList: document.getElementById('users-list'),
    chatHeaderName: document.getElementById('current-chat-name'),
    messagesContainer: document.getElementById('messages-container'),
    messageInput: document.getElementById('message-input'),
    btnSend: document.getElementById('btn-send'),
    myAvatar: document.getElementById('my-avatar-display'),
    myUsername: document.getElementById('my-username-display')
};

// Avatars
const AVATARS = ['👤', '🧑💻', '👩💼', '🧙♂️', '🦸♀️', '🐺', '🦉', '🌟'];
let selectedAvatar = AVATARS[0];

export function init() {
    renderAvatarSelection();

    // Chat Input Listeners
    elements.btnSend.addEventListener('click', handleSend);
    elements.messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });

    elements.messageInput.addEventListener('input', () => {
        Network.sendTyping(State.getActiveChat());
    });

    elements.btnSelfDestruct = document.getElementById('btn-self-destruct');
    elements.btnSelfDestruct.addEventListener('click', toggleSelfDestruct);
}

// Feature State
let selfDestructTime = 0; // 0 = off, 10000 = 10s

function toggleSelfDestruct() {
    // Cycle: Off -> 10s -> 30s -> Off
    if (selfDestructTime === 0) {
        selfDestructTime = 10000;
        elements.btnSelfDestruct.style.color = '#ef4444'; // Red
        elements.btnSelfDestruct.title = "Self Destruct: 10s";
    } else if (selfDestructTime === 10000) {
        selfDestructTime = 30000;
        elements.btnSelfDestruct.title = "Self Destruct: 30s";
    } else {
        selfDestructTime = 0;
        elements.btnSelfDestruct.style.color = 'inherit';
        elements.btnSelfDestruct.title = "Self Destruct: Off";
    }
}

function renderAvatarSelection() {
    elements.avatarGrid.innerHTML = '';
    AVATARS.forEach(avatar => {
        const div = document.createElement('div');
        div.className = `avatar-option ${avatar === selectedAvatar ? 'selected' : ''}`;
        div.textContent = avatar;
        div.onclick = () => selectAvatar(avatar);
        elements.avatarGrid.appendChild(div);
    });
}

function selectAvatar(avatar) {
    selectedAvatar = avatar;
    renderAvatarSelection();
    // Animation/Sound effect here?
}

export function getSelectedAvatar() {
    return selectedAvatar;
}

export function showChatInterface() {
    screens.login.classList.add('hidden-screen');
    screens.chat.classList.remove('hidden-screen');

    const user = State.getUser();
    elements.myAvatar.textContent = user.avatar;
    elements.myUsername.textContent = user.username;
}

export function renderUserList(users) {
    elements.usersList.innerHTML = '';
    const myUsername = State.getUser().username;

    users.forEach(user => {
        // TEMPORARY: Display all
        const li = document.createElement('li');
        li.id = `user-row-${user.id}`; // Add ID for easy access
        li.className = 'contact-item';
        li.style.padding = '10px';
        li.style.cursor = 'pointer';
        li.style.borderRadius = '8px';
        li.style.display = 'flex';
        li.style.alignItems = 'center';
        li.style.gap = '10px';
        li.style.marginBottom = '5px';
        li.style.transition = 'background 0.2s';

        // Highlight active
        if (State.getActiveChat() === user.id) {
            li.style.background = 'rgba(56, 189, 248, 0.2)';
        }

        li.onmouseover = () => { if (State.getActiveChat() !== user.id) li.style.background = 'rgba(255,255,255,0.05)'; };
        li.onmouseout = () => { if (State.getActiveChat() !== user.id) li.style.background = 'transparent'; };

        // Avatar + Name
        li.innerHTML = `
            <span style="font-size: 1.5rem">${user.avatar}</span>
            <div style="flex: 1">
                <div style="font-weight: 500">${user.username}</div>
                <div style="font-size: 0.8rem; color: #94a3b8; display: flex; align-items: center; gap: 5px;">
                     <span style="width: 6px; height: 6px; background: #4ade80; border-radius: 50%; display: inline-block;"></span> Online
                </div>
            </div>
        `;

        li.onclick = () => openChat(user);
        elements.usersList.appendChild(li);
    });
}

function openChat(user) {
    State.setActiveChat(user.id);
    elements.chatHeaderName.textContent = `Chat with ${user.username}`;

    // Clear unread badge
    const li = document.getElementById(`user-row-${user.id}`);
    if (li) {
        const badge = li.querySelector('.unread-badge');
        if (badge) badge.remove();
    }

    renderMessages(user.id);
    renderUserList(State.getUsers()); // Re-render to update highlights
}

function renderMessages(userId) {
    const messages = State.getMessages(userId);
    elements.messagesContainer.innerHTML = ''; // Clear (optimized: use diffing later)

    // Add spacer
    const spacer = document.createElement('div');
    spacer.style.flex = '1';
    elements.messagesContainer.appendChild(spacer);

    messages.forEach(msg => {
        appendMessageElement(msg);
    });

    scrollToBottom();
}

// Factored out for reuse
function appendMessageElement(msg) {
    const div = document.createElement('div');
    const isMe = msg.senderId === 'ME';
    div.className = `message ${isMe ? 'sent' : 'received'}`;
    div.textContent = msg.text;

    const meta = document.createElement('div');
    meta.style.fontSize = '0.7rem';
    meta.style.opacity = '0.7';
    meta.style.marginTop = '4px';
    meta.style.textAlign = 'right';
    meta.textContent = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Self Destruct UI
    if (msg.ttl) {
        const timerIcon = document.createElement('span');
        timerIcon.textContent = ' ⏱️';
        meta.appendChild(timerIcon);

        // Set deletion timer
        setTimeout(() => {
            div.style.transition = 'opacity 1s, transform 1s';
            div.style.opacity = '0';
            div.style.transform = 'scale(0.8)';
            setTimeout(() => div.remove(), 1000);
        }, msg.ttl);
    }

    div.appendChild(meta);

    elements.messagesContainer.appendChild(div);
}

export function appendMessageIfActive(senderId, msg) {
    if (State.getActiveChat() === senderId || (msg.senderId === 'ME' && State.getActiveChat() === senderId)) {
        appendMessageElement(msg);
        scrollToBottom();
    }
}

function scrollToBottom() {
    elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
}

async function handleSend() {
    const text = elements.messageInput.value;
    const activeUserId = State.getActiveChat();

    if (!text || !activeUserId) return;

    // Send via Network
    await Network.sendEncryptedMessage(activeUserId, text, selfDestructTime);

    // Clear input
    elements.messageInput.value = '';
    elements.messageInput.focus();
}

export function handleTyping(userId) {
    if (State.getActiveChat() === userId) {
        const indicator = document.getElementById('typing-indicator');
        indicator.textContent = 'is typing...';
        clearTimeout(indicator.timeout);
        indicator.timeout = setTimeout(() => {
            indicator.textContent = '';
        }, 1000); // Clear after 1s of no events
    }
}


export function notifyNewMessage(senderId) {
    // Play sound? Show red dot?
    if (State.getActiveChat() !== senderId) {
        const li = document.getElementById(`user-row-${senderId}`);
        if (li) {
            let badge = li.querySelector('.unread-badge');
            if (!badge) {
                badge = document.createElement('div');
                badge.className = 'unread-badge';
                badge.textContent = '1'; // Start count
                li.querySelector('div[style*="flex: 1"]').appendChild(badge);
            } else {
                // Increment count
                let count = parseInt(badge.textContent) || 0;
                badge.textContent = count + 1;
            }
        }
    }
}

export function updateConnectionStatus(connected) {
    // ...
}
