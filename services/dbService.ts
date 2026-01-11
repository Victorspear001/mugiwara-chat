
import { Contact, Message, User, MessageType } from '../types';
import { db, isDbConfigured } from '../lib/db';
import { encryptMessage, decryptMessage } from '../lib/crypto';

const CURRENT_USER_KEY = 'mugiwara_user';

export const initializeSchema = async () => {
  if (!isDbConfigured()) return;
  try {
    // Users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        phone TEXT PRIMARY KEY,
        name TEXT,
        avatar TEXT,
        about TEXT
      )
    `);
    // Try adding 'about' column if it doesn't exist (Migration)
    try { await db.execute("ALTER TABLE users ADD COLUMN about TEXT"); } catch (e) {}

    // Messages table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        sender_phone TEXT,
        receiver_phone TEXT,
        text TEXT,
        type TEXT DEFAULT 'text',
        timestamp INTEGER,
        status TEXT
      )
    `);
    // Try adding 'type' column if it doesn't exist (Migration)
    try { await db.execute("ALTER TABLE messages ADD COLUMN type TEXT DEFAULT 'text'"); } catch (e) {}

  } catch (e) {
    console.error("Database schema error:", e);
  }
};

export const getCurrentUser = (): User | null => {
  try {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    return null;
  }
};

export const updateUserProfile = async (updates: Partial<User>) => {
  const current = getCurrentUser();
  if (!current) return;
  const updatedUser = { ...current, ...updates };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
  
  if (isDbConfigured()) {
    try {
      await db.execute({
        sql: "UPDATE users SET name = ?, avatar = ?, about = ? WHERE phone = ?",
        args: [updatedUser.name, updatedUser.avatar, updatedUser.about || '', updatedUser.phone]
      });
    } catch (e) {
      console.error("Failed to sync profile update", e);
    }
  }
};

export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const loginOrRegister = async (phone: string, name: string): Promise<User> => {
  const defaultUser: User = { 
    phone, 
    name, 
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
    about: "Hey there! I am using Mugiwara Chat."
  };

  if (!isDbConfigured()) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(defaultUser));
    return defaultUser;
  }

  try {
    await initializeSchema();
    const result = await db.execute({
      sql: "SELECT * FROM users WHERE phone = ?",
      args: [phone]
    });

    if (result.rows.length > 0) {
      const user = {
        phone: result.rows[0].phone as string,
        name: result.rows[0].name as string,
        avatar: result.rows[0].avatar as string,
        about: (result.rows[0].about as string) || "Ahoy!",
      };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    } else {
      await db.execute({
        sql: "INSERT INTO users (phone, name, avatar, about) VALUES (?, ?, ?, ?)",
        args: [phone, name, defaultUser.avatar, defaultUser.about]
      });
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(defaultUser));
      return defaultUser;
    }
  } catch (e) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(defaultUser));
    return defaultUser;
  }
};

export const searchUserByPhone = async (phone: string): Promise<User | null> => {
    if (!isDbConfigured()) return null;
    try {
        const result = await db.execute({
            sql: "SELECT * FROM users WHERE phone = ?",
            args: [phone]
        });
        if (result.rows.length > 0) {
           const r = result.rows[0];
           return {
             phone: r.phone as string,
             name: r.name as string,
             avatar: r.avatar as string,
             about: (r.about as string) || ''
           };
        }
    } catch(e) {}
    return null;
}

export const getConversations = async (myPhone: string): Promise<Contact[]> => {
  if (!isDbConfigured()) return [];

  try {
    const result = await db.execute({
      sql: `
        SELECT * FROM messages 
        WHERE sender_phone = ? OR receiver_phone = ? 
        ORDER BY timestamp DESC
      `,
      args: [myPhone, myPhone]
    });

    const contactsMap = new Map<string, Contact>();

    for (const row of result.rows) {
      const sender = row.sender_phone as string;
      const receiver = row.receiver_phone as string;
      const otherPhone = sender === myPhone ? receiver : sender;

      if (!contactsMap.has(otherPhone)) {
        let name = otherPhone;
        let avatar = `https://ui-avatars.com/api/?name=${otherPhone}`;
        let about = '';

        try {
            const userRes = await db.execute({
                sql: "SELECT name, avatar, about FROM users WHERE phone = ?",
                args: [otherPhone]
            });
            if (userRes.rows.length) {
                name = userRes.rows[0].name as string;
                avatar = userRes.rows[0].avatar as string;
                about = (userRes.rows[0].about as string) || '';
            }
        } catch (innerErr) {
            console.warn("Failed to fetch user details for", otherPhone);
        }

        const rawText = row.text as string;
        const msgType = (row.type as MessageType) || 'text';
        
        let decryptedText = "Shared Media";
        if (msgType === 'text') {
             decryptedText = await decryptMessage(rawText, myPhone, otherPhone);
        } else if (msgType === 'image') {
             decryptedText = "📷 Image";
        } else if (msgType === 'video') {
             decryptedText = "🎥 Video";
        } else if (msgType === 'audio') {
             decryptedText = "🎤 Voice Message";
        }

        contactsMap.set(otherPhone, {
          phone: otherPhone,
          name: name,
          avatar: avatar,
          about: about,
          lastMessage: decryptedText,
          timestamp: Number(row.timestamp),
          lastMessageTime: new Date(Number(row.timestamp)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          unreadCount: 0 
        });
      }
    }

    return Array.from(contactsMap.values());
  } catch (e) {
    console.error("Fetch Chats Error", e);
    return [];
  }
};

export const getMessages = async (myPhone: string, otherPhone: string): Promise<Message[]> => {
  if (!isDbConfigured()) return [];

  try {
    const result = await db.execute({
      sql: `
        SELECT * FROM messages 
        WHERE (sender_phone = ? AND receiver_phone = ?) 
           OR (sender_phone = ? AND receiver_phone = ?)
        ORDER BY timestamp ASC
      `,
      args: [myPhone, otherPhone, otherPhone, myPhone]
    });

    const messages = await Promise.all(result.rows.map(async (row) => {
        const rawText = row.text as string;
        const msgType = (row.type as MessageType) || 'text';
        
        // Decrypt text, leave base64 media as is (assuming media is also encrypted in a real app, 
        // but here we stored it directly. If we encrypted media, we'd decrypt here too).
        // For this implementation, we will assume media was encrypted using same logic if it's stored in 'text' field.
        
        const decryptedContent = await decryptMessage(rawText, myPhone, otherPhone);

        return {
            id: row.id as string,
            senderPhone: row.sender_phone as string,
            receiverPhone: row.receiver_phone as string,
            text: decryptedContent,
            type: msgType,
            timestamp: Number(row.timestamp),
            status: row.status as 'sent' | 'delivered' | 'read',
            isMe: row.sender_phone === myPhone
        };
    }));

    return messages;
  } catch (e) {
    console.error("Get Messages Error", e);
    return [];
  }
};

export const sendMessage = async (
    myPhone: string, 
    otherPhone: string, 
    content: string, 
    type: MessageType = 'text'
): Promise<Message> => {
  
  // Encrypt content (whether text or base64)
  const encryptedContent = await encryptMessage(content, myPhone, otherPhone);

  const newMessage: Message = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    senderPhone: myPhone,
    receiverPhone: otherPhone,
    text: content, // Optimistic update uses plain content
    type: type,
    timestamp: Date.now(),
    status: 'sent',
    isMe: true
  };

  if (isDbConfigured()) {
    try {
      await db.execute({
        sql: "INSERT INTO messages (id, sender_phone, receiver_phone, text, type, timestamp, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
        args: [newMessage.id, newMessage.senderPhone, newMessage.receiverPhone, encryptedContent, type, newMessage.timestamp, newMessage.status]
      });
    } catch (e) {
      console.error("Send Error:", e);
    }
  }
  return newMessage;
};
