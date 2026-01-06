import { Contact, Message } from '../types';
import { db, isDbConfigured } from '../lib/db';

// Initial Mock Data (Contacts are hardcoded for this demo)
const INITIAL_CONTACTS: Contact[] = [
  { id: '1', name: 'Monkey D. Luffy', avatar: 'https://i.pravatar.cc/150?u=luffy', lastMessage: 'I am going to be King of the Pirates!', lastMessageTime: '12:30 PM' },
  { id: '2', name: 'Roronoa Zoro', avatar: 'https://i.pravatar.cc/150?u=zoro', lastMessage: 'Where is the booze?', lastMessageTime: '12:25 PM' },
  { id: '3', name: 'Nami', avatar: 'https://i.pravatar.cc/150?u=nami', lastMessage: 'You owe me 100,000 berries.', lastMessageTime: 'Yesterday' },
  { id: '4', name: 'Sanji', avatar: 'https://i.pravatar.cc/150?u=sanji', lastMessage: 'Nami-swan! Robin-chwan! 😍', lastMessageTime: 'Yesterday' },
  { id: '5', name: 'Nico Robin', avatar: 'https://i.pravatar.cc/150?u=robin', lastMessage: 'History is always written by the victors.', lastMessageTime: 'Tuesday' },
  { id: '6', name: 'Usopp', avatar: 'https://i.pravatar.cc/150?u=usopp', lastMessage: 'I have 8,000 followers!', lastMessageTime: 'Tuesday' },
  { id: '7', name: 'Tony Tony Chopper', avatar: 'https://i.pravatar.cc/150?u=chopper', lastMessage: 'Cotton candy?', lastMessageTime: 'Monday' },
  { id: '8', name: 'Franky', avatar: 'https://i.pravatar.cc/150?u=franky', lastMessage: 'SUUUUUPER!', lastMessageTime: 'Monday' },
  { id: '9', name: 'Brook', avatar: 'https://i.pravatar.cc/150?u=brook', lastMessage: 'May I see your panties?', lastMessageTime: 'Sunday' },
  { id: '10', name: 'Jinbe', avatar: 'https://i.pravatar.cc/150?u=jinbe', lastMessage: 'I will protect the captain.', lastMessageTime: 'Sunday' },
];

const STORAGE_KEY_MESSAGES = 'mugiwara_chat_messages';

export const getContacts = async (): Promise<Contact[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return INITIAL_CONTACTS;
};

export const getMessages = async (contactId: string): Promise<Message[]> => {
  if (isDbConfigured()) {
    try {
      const result = await db.execute({
        sql: "SELECT * FROM messages WHERE contact_id = ? ORDER BY timestamp ASC",
        args: [contactId]
      });
      
      // Map database rows to Message type
      return result.rows.map(row => ({
        id: row.id as string,
        contactId: row.contact_id as string,
        text: row.text as string,
        sender: row.sender as 'me' | 'them',
        timestamp: Number(row.timestamp),
        status: row.status as 'sent' | 'delivered' | 'read'
      }));
    } catch (e) {
      console.error("Turso Error:", e);
      return [];
    }
  }

  // Fallback to LocalStorage
  const stored = localStorage.getItem(STORAGE_KEY_MESSAGES);
  const allMessages: Message[] = stored ? JSON.parse(stored) : [];
  return allMessages.filter(m => m.contactId === contactId).sort((a, b) => a.timestamp - b.timestamp);
};

export const sendMessage = async (contactId: string, text: string): Promise<Message> => {
  const newMessage: Message = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    contactId,
    text,
    sender: 'me',
    timestamp: Date.now(),
    status: 'sent'
  };

  if (isDbConfigured()) {
    try {
      await db.execute({
        sql: "INSERT INTO messages (id, contact_id, text, sender, timestamp, status) VALUES (?, ?, ?, ?, ?, ?)",
        args: [newMessage.id, newMessage.contactId, newMessage.text, newMessage.sender, newMessage.timestamp, newMessage.status]
      });
      return newMessage;
    } catch (e) {
      console.error("Turso Error:", e);
      throw e;
    }
  }

  // Fallback to LocalStorage
  const stored = localStorage.getItem(STORAGE_KEY_MESSAGES);
  const allMessages: Message[] = stored ? JSON.parse(stored) : [];
  allMessages.push(newMessage);
  localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(allMessages));
  
  await new Promise(resolve => setTimeout(resolve, 200));
  return newMessage;
};

export const simulateReply = async (contactId: string): Promise<Message> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const replies = [
        "That's interesting!",
        "Can we eat meat now?",
        "I'm lost...",
        "Super!!!",
        "Yohohoho!",
        "Navigate to the next island!",
        "I need more sake.",
        "Whatever you say, Captain."
    ];
    const randomReply = replies[Math.floor(Math.random() * replies.length)];

    const replyMessage: Message = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        contactId,
        text: randomReply,
        sender: 'them',
        timestamp: Date.now(),
        status: 'read'
    };

    if (isDbConfigured()) {
      try {
        await db.execute({
          sql: "INSERT INTO messages (id, contact_id, text, sender, timestamp, status) VALUES (?, ?, ?, ?, ?, ?)",
          args: [replyMessage.id, replyMessage.contactId, replyMessage.text, replyMessage.sender, replyMessage.timestamp, replyMessage.status]
        });
        return replyMessage;
      } catch (e) {
        console.error("Turso Error:", e);
        // Continue to return message so UI updates even if DB write fails (optimistic)
      }
    } else {
       const stored = localStorage.getItem(STORAGE_KEY_MESSAGES);
       const allMessages: Message[] = stored ? JSON.parse(stored) : [];
       allMessages.push(replyMessage);
       localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(allMessages));
    }

    return replyMessage;
}