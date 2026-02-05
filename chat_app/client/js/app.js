// Main Application Entry Point
import './effects.js'; // Initialize visual effects immediately
import * as UI from './ui.js';
import * as Network from './network.js';
import * as Crypto from './crypto.js';
import * as State from './state.js';

console.log('Secure Local Messenger Initializing...');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    UI.init();

    // Bind Event Listeners
    document.getElementById('btn-create-identity').addEventListener('click', async () => {
        const username = document.getElementById('username-input').value;
        const avatar = UI.getSelectedAvatar();

        if (!username) {
            alert('Please enter a username.');
            return;
        }

        try {
            // 1. Generate Identity & Keys
            const keyPair = await Crypto.generateKeyPair();
            const user = {
                username,
                avatar,
                publicKey: keyPair.publicKey // Exported public key not needed here, stored in KeyPair
            };

            // 2. Initialize State
            State.setUser(user);
            State.setKeyPair(keyPair);

            // 3. Connect to Server
            Network.connect();

            // 4. Switch to Chat UI
            UI.showChatInterface();
        } catch (err) {
            console.error('Initialization failed:', err);
            alert('Failed to initialize secure identity. This browser may not support the required cryptography features.');
        }
    });
});
