import { Contact, Message, User } from '../types';
import { db, isDbConfigured } from '../lib/db';

const CURRENT_USER_KEY = 'mugiwara_user';

// --- AUTHENTICATION ---

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
  window.location.reload();
};

export const loginOrRegister = async (phone: string, name: string): Promise<User> => {
  if (!isDbConfigured()) {
    const user = { phone, name, avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random` };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  }

  try {
    const result = await db.execute({
      sql: "SELECT * FROM users WHERE phone = ?",
      args: [phone]
    });

    if (result.rows.length > 0) {
      const user = {
        phone: result.rows[0].phone as string,
        name: result.rows[0].name as string,
        avatar: result.rows[0].avatar as string,
      };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    } else {
      const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
      await db.execute({
        sql: "INSERT INTO users (phone, name, avatar) VALUES (?, ?, ?)",
        args: [phone, name, avatar]
      });
      const newUser = { phone, name, avatar };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
      return newUser;
    }
  } catch (e) {
    console.error("Auth Error:", e);
    // Fallback to local if DB fails
    const user = { phone, name, avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random` };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
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
            return {
                phone: result.rows[0].phone as string,
                name: result.rows[0].name as string,
                avatar: result.rows[0].avatar as string,
            };
        }
        return null;
    } catch (e) {
        console.error("Search Error:", e);
        return null;
    }
}

// --- MESSAGING ---

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
        const userRes = await db.execute({
            sql: "SELECT name, avatar FROM users WHERE phone = ?",
            args: [otherPhone]
        });
        
        const name = userRes.rows.length ? (userRes.rows[0].name as string) : otherPhone;
        const avatar = userRes.rows.length ? (userRes.rows[0].avatar as string) : `https://ui-avatars.com/api/?name=${otherPhone}`;

        contactsMap.set(otherPhone, {
          phone: otherPhone,
          name: name,
          avatar: avatar,
          lastMessage: row.text as string,
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

    return result.rows.map(row => ({
      id: row.id as string,
      senderPhone: row.sender_phone as string,
      receiverPhone: row.receiver_phone as string,
      text: row.text as string,
      timestamp: Number(row.timestamp),
      status: row.status as 'sent' | 'delivered' | 'read',
      isMe: row.sender_phone === myPhone
    }));
  } catch (e) {
    console.error("Get Messages Error", e);
    return [];
  }
};

export const sendMessage = async (myPhone: string, otherPhone: string, text: string): Promise<Message> => {
  const newMessage: Message = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    senderPhone: myPhone,
    receiverPhone: otherPhone,
    text,
    timestamp: Date.now(),
    status: 'sent',
    isMe: true
  };

  if (isDbConfigured()) {
    try {
      await db.execute({
        sql: "INSERT INTO messages (id, sender_phone, receiver_phone, text, timestamp, status) VALUES (?, ?, ?, ?, ?, ?)",
        args: [newMessage.id, newMessage.senderPhone, newMessage.receiverPhone, newMessage.text, newMessage.timestamp, newMessage.status]
      });
    } catch (e) {
      console.error("Send Error:", e);
      // Even if DB fails, we return the message object so the UI can show it (optimistically)
    }
  }
  return newMessage;
};