# Secure Local Messenger

A professional-grade, end-to-end encrypted messaging application associated with a Mystical Waterfall theme. Designed for secure communication within local networks.

## 🌟 Features

- **Zero-Knowledge Architecture**: server relays messages without decryption.
- **End-to-End Encryption**: Military-grade AES-GCM + ECDH.
- **Mystical Waterfall Theme**: Beautiful particles and glassmorphism UI.
- **Self-Destructing Messages**: Set timers for message deletion.
- **Real-time Communication**: Instant messaging with typing indicators.
- **Room Management**: Join public lobbies or private rooms.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)

### Installation

1.  Navigate to the server directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Project

1.  Start the WebSocket Relay Server:
    ```bash
    node server.js
    ```
    *The server will start on port 3000.*

2.  **Launch the Client**:
    Open your web browser and go to:
    **[http://localhost:3000](http://localhost:3000)**

### Verification

To verify the secure messaging:
1.  Open the link in two separate browser windows/tabs.
2.  Log in with different usernames (e.g., "Alice" and "Bob").
3.  Send a message from one to the other.
4.  Try the **Self-Destruct Timer** by clicking the stopwatch icon.

## 🛠️ Technology Stack

- **Client**: Vanilla JavaScript, Web Crypto API, Hyper-Optimized CSS.
- **Server**: Node.js, `ws` (WebSocket) library.
