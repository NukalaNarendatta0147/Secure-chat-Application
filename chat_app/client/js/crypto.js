/**
 * Cryptography Module
 * Uses Web Crypto API for military-grade security
 * - ECDH (P-256) for Key Exchange
 * - AES-GCM (256-bit) for Message Encryption
 */

// Utils
const enc = new TextEncoder();
const dec = new TextDecoder();

// Convert ArrayBuffer to Base64 String
function ab2str(buf) {
    return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

// Convert Base64 String to ArrayBuffer
function str2ab(str) {
    const binaryString = atob(str);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

// 1. Generate Key Pair (ECDH P-256)
export async function generateKeyPair() {
    return await window.crypto.subtle.generateKey(
        {
            name: "ECDH",
            namedCurve: "P-256"
        },
        true, // extractable
        ["deriveKey"]
    );
}

// 2. Export Public Key (to send to other user)
// Returns JWK object
export async function exportPublicKey(key) {
    return await window.crypto.subtle.exportKey("jwk", key);
}

// 3. Import Public Key (received from other user)
export async function importPublicKey(jwkData) {
    return await window.crypto.subtle.importKey(
        "jwk",
        jwkData,
        {
            name: "ECDH",
            namedCurve: "P-256"
        },
        true,
        []
    );
}

// 4. Derive Shared Secret (AES-GCM Key)
export async function deriveSharedKey(privateKey, remotePublicKey) {
    return await window.crypto.subtle.deriveKey(
        {
            name: "ECDH",
            public: remotePublicKey
        },
        privateKey,
        {
            name: "AES-GCM",
            length: 256
        },
        true,
        ["encrypt", "decrypt"]
    );
}

// 5. Encrypt Message
export async function encryptMessage(data, sharedKey) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV

    let encoded;
    if (typeof data === 'string') {
        encoded = enc.encode(data);
    } else {
        encoded = data; // Assume BufferSource
    }

    const ciphertext = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        sharedKey,
        encoded
    );

    return {
        iv: ab2str(iv),
        data: ab2str(ciphertext)
    };
}

// 6. Decrypt Message
export async function decryptMessage(encryptedData, sharedKey) {
    const iv = str2ab(encryptedData.iv);
    const data = str2ab(encryptedData.data);

    try {
        const decrypted = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            sharedKey,
            data
        );
        return dec.decode(decrypted);
    } catch (e) {
        console.error("Decryption failed:", e);
        return null; // Could happen if keys don't match or data tampered
    }
}
