// Simple End-to-End Encryption Logic using Web Crypto API
// We use a deterministic key derivation based on the participants' phone numbers.
// This allows users to recover their chat history upon re-login without managing complex private keys for this demo.

const ENC_PREFIX = 'enc::';
const SALT_STRING = 'MUGIWARA_GRAND_LINE_SECRET_SALT_V1'; 

// Helper: Derive a shared key for two users
async function getConversationKey(phone1: string, phone2: string): Promise<CryptoKey> {
    // 1. Sort phones to ensure both users generate the exact same key for their conversation
    const sortedIds = [phone1, phone2].sort().join('_');
    
    // 2. Create Key Material from IDs
    const encoder = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        'raw', 
        encoder.encode(sortedIds + SALT_STRING), 
        { name: 'PBKDF2' }, 
        false, 
        ['deriveKey']
    );

    // 3. Derive AES-GCM Key using PBKDF2
    // In a real app, salt should be random and stored, but fixed salt allows deterministic recovery here.
    return window.crypto.subtle.deriveKey(
        { 
            name: 'PBKDF2', 
            salt: encoder.encode(SALT_STRING), 
            iterations: 100000, 
            hash: 'SHA-256' 
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

export async function encryptMessage(text: string, senderPhone: string, receiverPhone: string): Promise<string> {
    try {
        const key = await getConversationKey(senderPhone, receiverPhone);
        const iv = window.crypto.getRandomValues(new Uint8Array(12)); // Unique IV for every message
        const encodedText = new TextEncoder().encode(text);

        const encryptedBuffer = await window.crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            encodedText
        );

        // Serialize IV and Ciphertext to JSON then Base64
        const payload = {
            iv: Array.from(iv),
            data: Array.from(new Uint8Array(encryptedBuffer))
        };
        
        return ENC_PREFIX + btoa(JSON.stringify(payload));
    } catch (e) {
        console.error("Encryption failed:", e);
        return text; // Fallback to plain text if crypto fails (should not happen)
    }
}

export async function decryptMessage(ciphertext: string, userPhone: string, otherPhone: string): Promise<string> {
    // 1. Check for encryption prefix. If not present, it's an old plain-text message.
    if (!ciphertext || !ciphertext.startsWith(ENC_PREFIX)) {
        return ciphertext;
    }

    try {
        // 2. Decode payload
        const raw = atob(ciphertext.slice(ENC_PREFIX.length));
        const { iv, data } = JSON.parse(raw);
        
        // 3. Re-derive key
        const key = await getConversationKey(userPhone, otherPhone);

        // 4. Decrypt
        const decryptedBuffer = await window.crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: new Uint8Array(iv) },
            key,
            new Uint8Array(data)
        );

        return new TextDecoder().decode(decryptedBuffer);
    } catch (e) {
        console.error("Decryption failed:", e);
        return "☠️ [Unreadable Message]";
    }
}