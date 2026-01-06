import React, { useState, useMemo } from 'react';
import { Search, MoreVertical, MessageSquare, LogOut, Loader2, UserPlus } from 'lucide-react';
import { Contact, User } from '../types';
import { searchUserByPhone, getCurrentUser, logoutUser } from '../services/dbService';

interface SidebarProps {
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
  selectedContactId?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ contacts, onSelectContact, selectedContactId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChatInput, setShowNewChatInput] = useState(false);
  const [newChatPhone, setNewChatPhone] = useState('');
  const [isSearchingUser, setIsSearchingUser] = useState(false);
  const currentUser = getCurrentUser();

  const filteredContacts = useMemo(() => {
    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      contact.phone.includes(searchTerm)
    );
  }, [contacts, searchTerm]);

  const handleStartNewChat = async () => {
    if (!newChatPhone.trim()) return;
    setIsSearchingUser(true);
    
    // 1. Check if user exists in DB
    const user = await searchUserByPhone(newChatPhone);
    
    if (user) {
        // Create a temporary contact object to start the chat immediately
        const newContact: Contact = {
            ...user,
            lastMessage: '',
            lastMessageTime: '',
            unreadCount: 0
        };
        onSelectContact(newContact);
        setNewChatPhone('');
        setShowNewChatInput(false);
    } else {
        alert("User not found with that phone number.");
    }
    setIsSearchingUser(false);
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-[#e9edef] w-full md:w-[350px] lg:w-[450px] flex-shrink-0">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#f0f2f5] border-b border-[#d1d7db]">
        <div className="flex items-center gap-2 cursor-pointer" title="Your Profile">
            <div className="w-10 h-10 rounded-full overflow-hidden">
                <img src={currentUser?.avatar} alt="Me" className="w-full h-full object-cover" />
            </div>
            <span className="text-sm font-semibold text-[#41525d] hidden sm:block">{currentUser?.name}</span>
        </div>
        <div className="flex gap-3 text-[#54656f]">
          <button title="New Chat" onClick={() => setShowNewChatInput(!showNewChatInput)}>
            <MessageSquare size={20} />
          </button>
          <button title="Logout" onClick={logoutUser}>
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* New Chat Input (Conditional) */}
      {showNewChatInput && (
          <div className="p-3 bg-[#00a884] animate-in slide-in-from-top-2">
              <div className="flex gap-2">
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="Enter phone number..."
                    className="flex-1 rounded-md px-3 py-1.5 text-sm outline-none"
                    value={newChatPhone}
                    onChange={(e) => setNewChatPhone(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleStartNewChat()}
                  />
                  <button 
                    onClick={handleStartNewChat}
                    disabled={isSearchingUser}
                    className="bg-white/20 text-white p-1.5 rounded-md hover:bg-white/30"
                  >
                      {isSearchingUser ? <Loader2 className="animate-spin" size={20}/> : <UserPlus size={20}/>}
                  </button>
              </div>
          </div>
      )}

      {/* Search Bar */}
      <div className="p-2 border-b border-[#f0f2f5] bg-white">
        <div className="relative flex items-center bg-[#f0f2f5] rounded-lg px-3 py-1.5">
          <button className="text-[#54656f] mr-4">
            <Search size={18} />
          </button>
          <input
            type="text"
            placeholder="Search contacts"
            className="flex-1 bg-transparent border-none outline-none text-sm text-[#3b4a54] placeholder-[#54656f] h-6"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-white">
        {filteredContacts.map((contact) => (
          <div
            key={contact.phone}
            onClick={() => onSelectContact(contact)}
            className={`flex items-center px-3 py-3 cursor-pointer border-b border-[#f0f2f5] hover:bg-[#f5f6f6] transition-colors ${
              selectedContactId === contact.phone ? 'bg-[#f0f2f5]' : ''
            }`}
          >
            {/* Avatar */}
            <div className="relative w-12 h-12 flex-shrink-0 mr-3">
              <img
                src={contact.avatar}
                alt={contact.name}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            
            {/* Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex justify-between items-baseline mb-0.5">
                <h3 className="text-[#111b21] text-[17px] font-normal truncate">{contact.name}</h3>
                <span className="text-xs text-[#667781] whitespace-nowrap ml-2">
                  {contact.lastMessageTime || ''}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-[#667781] truncate pr-2">
                  {contact.lastMessage || 'Tap to chat'}
                </p>
              </div>
            </div>
          </div>
        ))}
        {contacts.length === 0 && !showNewChatInput && (
          <div className="p-8 text-center text-[#667781] text-sm flex flex-col items-center">
            <p className="mb-2">No chats yet.</p>
            <p className="text-xs">Click the <MessageSquare className="inline w-3 h-3"/> icon to start a new chat by phone number.</p>
          </div>
        )}
      </div>
    </div>
  );
};