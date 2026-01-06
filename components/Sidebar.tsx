import React, { useState, useMemo } from 'react';
import { Search, MoreVertical, MessageSquare, Donut, Users } from 'lucide-react';
import { Contact } from '../types';

interface SidebarProps {
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
  selectedContactId?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ contacts, onSelectContact, selectedContactId }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContacts = useMemo(() => {
    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [contacts, searchTerm]);

  return (
    <div className="flex flex-col h-full bg-white border-r border-[#e9edef] w-full md:w-[350px] lg:w-[450px] flex-shrink-0">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#f0f2f5] border-b border-[#d1d7db]">
        <div className="w-10 h-10 rounded-full overflow-hidden cursor-pointer">
           <img src="https://ui-avatars.com/api/?name=You&background=00a884&color=fff" alt="My Profile" className="w-full h-full object-cover" />
        </div>
        <div className="flex gap-4 text-[#54656f]">
          <button title="Communities"><Users size={20} /></button>
          <button title="Status"><Donut size={20} /></button>
          <button title="New Chat"><MessageSquare size={20} /></button>
          <button title="Menu"><MoreVertical size={20} /></button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-2 border-b border-[#f0f2f5] bg-white">
        <div className="relative flex items-center bg-[#f0f2f5] rounded-lg px-3 py-1.5">
          <button className="text-[#54656f] mr-4">
            <Search size={18} />
          </button>
          <input
            type="text"
            placeholder="Search or start new chat"
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
            key={contact.id}
            onClick={() => onSelectContact(contact)}
            className={`flex items-center px-3 py-3 cursor-pointer border-b border-[#f0f2f5] hover:bg-[#f5f6f6] transition-colors ${
              selectedContactId === contact.id ? 'bg-[#f0f2f5]' : ''
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
                  {contact.lastMessage || 'Click to start chatting'}
                </p>
                {contact.unreadCount && contact.unreadCount > 0 ? (
                  <span className="bg-[#25d366] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.2rem] text-center">
                    {contact.unreadCount}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        ))}
        {filteredContacts.length === 0 && (
          <div className="p-8 text-center text-[#667781] text-sm">
            No contacts found
          </div>
        )}
      </div>
    </div>
  );
};
