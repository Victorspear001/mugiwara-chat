export interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

export interface Message {
  id: string;
  contactId: string;
  text: string;
  sender: 'me' | 'them';
  timestamp: number; // Unix timestamp
  status: 'sent' | 'delivered' | 'read';
}
