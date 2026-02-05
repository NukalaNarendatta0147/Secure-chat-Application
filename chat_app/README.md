# Secure Local Messenger 🛡️

![Status](https://img.shields.io/badge/Status-Active-success)
![Security](https://img.shields.io/badge/Security-End%20to%20End%20Encrypted-blue)
![Architecture](https://img.shields.io/badge/Architecture-Zero%20Knowledge-purple)

A professional-grade, **Zero-Knowledge** messaging platform built with Vanilla JavaScript and Node.js. Designed for secure, private communication within local networks (LAN) without relying on external cloud providers.

## 🚀 Key Features

*   **🔒 Zero-Knowledge Architecture**: The server acts as a blind relay. It routes encrypted packets between users but **cannot** decrypt or read them.
*   **🔑 End-to-End Encryption (E2EE)**: Implementation of **AES-GCM (256-bit)** for message confidentiality and integrity, with **ECDH (P-256)** for secure key exchange.
*   **⏱️ Self-Destructing Messages**: Digital privacy features including ephemeral messages (TTL) that vanish from both devices after a set time.
*   **🌊 Mystical Waterfall UI**: A custom-built, high-performance UI featuring glassmorphism, responsive design, and 60fps canvas particle animations.
*   **📁 Secure File Sharing**: Encrypted file transfer support (in progress).
*   **👥 Real-time Communication**: Instant messaging with live typing indicators and presence detection.

## 🛠️ Technical Stack

*   **Client**: Vanilla JavaScript (ES6+), Web Crypto API (SubtleCrypto), HTML5 Canvas.
*   **Server**: Node.js, WebSocket (`ws`) library.
*   **Styling**: Modern CSS3 (Variables, Flexbox/Grid, Animations).

## ⚙️ Installation & Run

### Prerequisites
*   [Node.js](https://nodejs.org/) (v14+) installed.

### Quick Start

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/yourusername/secure-local-messenger.git
    ```

2.  **Install Server Dependencies**
    ```bash
    cd server
    npm install
    ```

3.  **Start the Server**
    ```bash
    node server.js
    ```
    *Server will start on port 3000.*

4.  **Launch the App**
    *   Open your browser and navigate to: `http://localhost:3000`
    *   Open a second tab to simulate another user.

## 🛡️ Security Verification

You can verify the security model yourself:
1.  **Network Inspection**: Open Browser DevTools -> Network -> WS. You will see that all message payloads are strictly **binary ciphertext**, not plain text.
2.  **Code Audit**: Check `client/js/crypto.js` to see the native Web Crypto API implementation.
3.  **Server Logs**: The server logs only show connection metadata, proving zero visibility into message content.

## 📸 Screenshots

*(Add screenshots of your login screen and chat interface here)*

---
*Built with ❤️ for Privacy and Security.*
