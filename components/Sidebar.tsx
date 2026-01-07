import React, { useState, useMemo } from 'react';
import { Search, MoreVertical, LogOut, Loader2, UserPlus, Sword, Scroll, Map as MapIcon, Menu } from 'lucide-react';
import { Contact } from '../types';
import { searchUserByPhone, getCurrentUser } from '../services/dbService';

interface SidebarProps {
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
  onLogout: () => void;
  selectedContactId?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ contacts, onSelectContact, onLogout, selectedContactId }) => {
  const [activeTab, setActiveTab] = useState<'chats' | 'crew'>('chats');
  const [searchTerm, setSearchTerm] = useState('');
  const [newChatPhone, setNewChatPhone] = useState('');
  const [isSearchingUser, setIsSearchingUser] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
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
        const newContact: Contact = {
            ...user,
            lastMessage: 'Ahoy!',
            lastMessageTime: '',
            unreadCount: 0
        };
        onSelectContact(newContact);
        setNewChatPhone('');
        setActiveTab('chats');
    } else {
        alert("No pirate found with that frequency!");
    }
    setIsSearchingUser(false);
  };

  const handleLogoutClick = () => {
      if (window.confirm("Abandon ship?")) {
          onLogout();
      }
      setShowMenu(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#3e3226] border-r-4 border-[#2c241b] w-full md:w-[350px] lg:w-[450px] flex-shrink-0 text-[#d4c5a9]">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-[#2c241b] border-b border-[#5c4d3c] shadow-md relative z-20">
        <div className="flex items-center gap-3" title="Captain's Profile">
            <div className="w-12 h-12 rounded-full border-2 border-[#bf9b30] overflow-hidden bg-[#1a1a1a]">
                {currentUser?.avatar ? (
                    <img src={currentUser.avatar} alt="Me" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#bf9b30] font-bold">?</div>
                )}
            </div>
            <div>
                 <span className="text-lg pirate-font text-[#bf9b30] block">{currentUser?.name}</span>
                 <span className="text-xs text-[#8c7a6b] uppercase tracking-wider">Captain</span>
            </div>
        </div>
        
        <div className="relative">
            <button 
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-[#bf9b30] hover:bg-[#3e3226] rounded-full transition-colors"
            >
                <MoreVertical size={24} />
            </button>
             {/* Dropdown Menu */}
             {showMenu && (
                <>
                    <div className="fixed inset-0 z-10 cursor-default" onClick={() => setShowMenu(false)}></div>
                    <div className="absolute top-full right-0 mt-2 w-48 bg-parchment rounded border-2 border-[#3e3226] shadow-xl z-30 py-1">
                        <button 
                            className="w-full text-left px-4 py-3 hover:bg-[#c4b599] text-[#3e3226] font-bold font-serif flex items-center gap-2"
                            onClick={handleLogoutClick}
                        >
                            <LogOut size={16} />
                            Abandon Ship
                        </button>
                    </div>
                </>
            )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#2c241b]">
          <button 
            onClick={() => setActiveTab('chats')}
            className={`flex-1 py-3 text-center font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-colors ${activeTab === 'chats' ? 'bg-[#3e3226] text-[#bf9b30] border-t-2 border-[#bf9b30]' : 'text-[#8c7a6b] hover:bg-[#332b22]'}`}
          >
              <Scroll size={16}/> Current Logs
          </button>
          <button 
            onClick={() => setActiveTab('crew')}
            className={`flex-1 py-3 text-center font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-colors ${activeTab === 'crew' ? 'bg-[#3e3226] text-[#bf9b30] border-t-2 border-[#bf9b30]' : 'text-[#8c7a6b] hover:bg-[#332b22]'}`}
          >
              <UserPlus size={16}/> Recruit
          </button>
      </div>

      {/* Content based on Tab */}
      <div className="flex-1 overflow-hidden flex flex-col relative bg-[#3e3226] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]">
        
        {activeTab === 'chats' && (
            <>
                {/* Search */}
                <div className="p-3">
                    <div className="relative flex items-center bg-[#2c241b] border border-[#5c4d3c] rounded px-3 py-2 shadow-inner">
                    <Search size={18} className="text-[#8c7a6b] mr-3" />
                    <input
                        type="text"
                        placeholder="Search logs..."
                        className="flex-1 bg-transparent border-none outline-none text-sm text-[#d4c5a9] placeholder-[#5c4d3c]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-2">
                    {filteredContacts.map((contact) => (
                    <div
                        key={contact.phone}
                        onClick={() => onSelectContact(contact)}
                        className={`group flex items-center px-3 py-4 mb-2 cursor-pointer rounded border border-transparent hover:border-[#bf9b30]/30 transition-all ${
                        selectedContactId === contact.phone 
                            ? 'bg-[#2c241b] border-[#bf9b30]/50 shadow-lg' 
                            : 'hover:bg-[#2c241b]/50'
                        }`}
                    >
                        <div className="relative w-14 h-14 flex-shrink-0 mr-4">
                        <img
                            src={contact.avatar}
                            alt={contact.name}
                            className={`w-full h-full rounded-full object-cover border-2 ${selectedContactId === contact.phone ? 'border-[#bf9b30]' : 'border-[#5c4d3c] group-hover:border-[#8c7a6b]'}`}
                        />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                            <h3 className={`pirate-font text-lg truncate ${selectedContactId === contact.phone ? 'text-[#bf9b30]' : 'text-[#d4c5a9]'}`}>
                                {contact.name}
                            </h3>
                            <span className="text-xs text-[#8c7a6b] whitespace-nowrap ml-2 font-mono opacity-70">
                                {contact.lastMessageTime || ''}
                            </span>
                        </div>
                        <p className="text-sm text-[#8c7a6b] truncate pr-2 italic font-serif">
                            {contact.lastMessage && contact.lastMessage.startsWith('data:image') 
                                ? '📷 A painted canvas' 
                                : (contact.lastMessage || 'Start a parley...')}
                        </p>
                        </div>
                    </div>
                    ))}
                    
                    {contacts.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-48 opacity-50">
                            <MapIcon size={48} className="text-[#5c4d3c] mb-2"/>
                            <p className="pirate-font text-[#5c4d3c]">No voyages recorded.</p>
                        </div>
                    )}
                </div>
            </>
        )}

        {activeTab === 'crew' && (
            <div className="p-6 flex flex-col items-center">
                 <h2 className="pirate-font text-2xl text-[#bf9b30] mb-6 text-center">Add to Manifest</h2>
                 <div className="w-full bg-parchment p-4 rounded text-[#2c241b] shadow-lg transform -rotate-1">
                     <label className="block text-xs font-bold uppercase mb-2">Den Den Mushi (Phone)</label>
                     <input 
                        type="text" 
                        autoFocus
                        placeholder="e.g. 555-999"
                        className="w-full bg-[#eaddcf] p-2 border border-[#8c7a6b] rounded mb-4 font-mono"
                        value={newChatPhone}
                        onChange={(e) => setNewChatPhone(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleStartNewChat()}
                      />
                      <button 
                        onClick={handleStartNewChat}
                        disabled={isSearchingUser}
                        className="w-full bg-[#1a3c40] text-[#d4c5a9] py-2 rounded font-bold hover:bg-[#122b2e] flex items-center justify-center gap-2"
                      >
                          {isSearchingUser ? <Loader2 className="animate-spin"/> : <Sword size={18}/>}
                          Recruit Pirate
                      </button>
                 </div>
                 <div className="mt-8 text-center px-4">
                     <p className="text-[#8c7a6b] text-sm italic">"Friends are the greatest treasure of the sea."</p>
                 </div>
            </div>
        )}

      </div>
    </div>
  );
};