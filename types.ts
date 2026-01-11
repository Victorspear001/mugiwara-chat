
export interface User {
  phone: string;
  name: string;
  avatar: string;
  about?: string;
}

export interface Contact extends User {
  lastMessage?: string;
  lastMessageTime?: string; 
  timestamp?: number; 
  unreadCount?: number;
}

export type MessageType = 'text' | 'image' | 'video' | 'audio';

export interface Message {
  id: string;
  senderPhone: string;
  receiverPhone: string;
  text: string; // Used for content (text or base64 data)
  type: MessageType;
  timestamp: number;
  status: 'sent' | 'delivered' | 'read';
  isMe: boolean; 
}
