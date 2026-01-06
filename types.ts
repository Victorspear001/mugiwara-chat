export interface User {
  phone: string;
  name: string;
  avatar: string;
  about?: string;
}

export interface Contact extends User {
  lastMessage?: string;
  lastMessageTime?: string; // Formatted string
  timestamp?: number; // Raw timestamp for sorting
  unreadCount?: number;
}

export interface Message {
  id: string;
  senderPhone: string;
  receiverPhone: string;
  text: string;
  timestamp: number;
  status: 'sent' | 'delivered' | 'read';
  isMe: boolean; // Helper for UI
}