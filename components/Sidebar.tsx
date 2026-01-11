
import React, { useState, useMemo, useEffect } from 'react';
import { Search, MoreVertical, LogOut, Loader2, UserPlus, Sword, Scroll, Map as MapIcon, UserCog, Camera, Save, X } from 'lucide-react';
import { Contact, User } from '../types';
import { searchUserByPhone, getCurrentUser, updateUserProfile } from '../services/dbService';

interface SidebarProps {
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
  onLogout: () => void;
  selectedContactId?: string;
}

// Levenshtein distance algorithm for fuzzy matching
const getLevenshteinDistance = (a: string, b: string): number => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  // increment along the first column of each row
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  // increment each column in the first row
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

export const Sidebar: React.FC<SidebarProps> = ({ contacts, onSelectContact, onLogout, selectedContactId }) => {
  const [activeTab, setActiveTab] = useState<'chats' | 'crew' | 'profile'>('chats');
  const [searchTerm, setSearchTerm] = useState('');
  const [newChatPhone, setNewChatPhone] = useState('');
  const [isSearchingUser, setIsSearchingUser] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(getCurrentUser());
  
  // Profile Edit State
  const [editName, setEditName] = useState('');
  const [editAbout, setEditAbout] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  useEffect(() => {
    // Refresh user state when component mounts or active tab changes
    const user = getCurrentUser();
    setCurrentUser(user);
    if (user) {
        setEditName(user.name);
        setEditAbout(user.about || '');
        setEditAvatar(user.avatar);
    }
  }, [activeTab]);

  const filteredContacts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return contacts;

    return contacts.filter(contact => {
      const name = contact.name.toLowerCase();
      const phone = contact.phone;

      // 1. Direct Substring Match (Case-insensitive) - High Confidence
      if (name.includes(term) || phone.includes(term)) return true;

      // 2. Fuzzy Match Logic
      // Only apply fuzzy search if term is at least 2 characters to avoid noise
      if (term.length < 2) return false;

      const words = name.split(/\s+/);
      
      return words.some(word => {
        // A. Full Word Fuzzy Match
        // Calculate distance between the search term and the full word
        // e.g. "Javk" vs "Jack" -> dist 1
        const dist = getLevenshteinDistance(word, term);
        
        // Dynamic threshold: Allow 1 typo for words length 3-5, 2 typos for longer
        const threshold = term.length > 5 ? 2 : 1;
        
        // Too short to allow fuzzy errors?
        if (term.length < 3 && dist > 0) return false;

        if (dist <= threshold) return true;

        // B. Prefix Fuzzy Match
        // Calculate distance between search term and the START of the word
        // e.g. "Alex" vs "Alexander". Prefix "Alex" matches exactly.
        // e.g. "Alax" vs "Alexander". Prefix "Alax" vs "Alex" -> dist 1.
        if (word.length >= term.length) {
            const prefix = word.substring(0, term.length);
            const prefixDist = getLevenshteinDistance(prefix, term);
            // Stricter threshold for prefixes
            return prefixDist <= (term.length > 4 ? 1 : 0);
        }

        return false;
      });
    });
  }, [contacts, searchTerm]);

  const handleStartNewChat = async () => {
    if (!newChatPhone.trim()) return;
    setIsSearchingUser(true);
    
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

  const handleSaveProfile = async () => {
      if(!currentUser) return;
      await updateUserProfile({
          name: editName,
          about: editAbout,
          avatar: editAvatar
      });
      const updated = getCurrentUser();
      setCurrentUser(updated);
      alert("Profile Manifest Updated!");
  };

  const handleLogoutClick = () => {
      if (window.confirm("Abandon ship?")) {
          onLogout();
      }
      setShowMenu(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#fdfbf7] w-full flex-shrink-0 text-[#3e3226]">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-[64px] bg-[#f4f1ea] border-b border-[#d4c5a9] relative z-20 flex-shrink-0">
        <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setActiveTab('profile')} title="Edit Profile">
            <div className="w-10 h-10 rounded-full border border-[#bf9b30] overflow-hidden bg-gray-100 shadow-sm relative group">
                {currentUser?.avatar ? (
                    <img src={currentUser.avatar} alt="Me" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#bf9b30] font-bold">?</div>
                )}
            </div>
            <div className="flex flex-col justify-center">
                 <span className="text-base font-bold text-[#3e3226] leading-none mb-1">{currentUser?.name}</span>
                 <span className="text-[10px] text-[#8c7a6b] uppercase tracking-widest leading-none">Captain</span>
            </div>
        </div>
        
        <div className="relative">
            <button 
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                className="p-2 text-[#6b5b48] hover:bg-[#e6e2d3] rounded-full transition-colors"
            >
                <MoreVertical size={20} />
            </button>
             {showMenu && (
                <>
                    <div className="fixed inset-0 z-10 cursor-default" onClick={() => setShowMenu(false)}></div>
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded border border-[#d4c5a9] shadow-lg z-30 py-1">
                        <button 
                            className="w-full text-left px-4 py-3 hover:bg-[#f4f1ea] text-[#3e3226] text-sm flex items-center gap-2"
                            onClick={() => { setActiveTab('profile'); setShowMenu(false); }}
                        >
                            <UserCog size={16} />
                            Edit Profile
                        </button>
                        <button 
                            className="w-full text-left px-4 py-3 hover:bg-[#f4f1ea] text-[#3e3226] text-sm flex items-center gap-2"
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
      <div className="flex bg-[#fff] border-b border-[#d4c5a9] flex-shrink-0">
          <button 
            onClick={() => setActiveTab('chats')}
            className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all relative ${
                activeTab === 'chats' 
                ? 'text-[#2c5f63] bg-[#f4f1ea]' 
                : 'text-[#8c7a6b] hover:bg-[#faf9f6]'
            }`}
          >
              <Scroll size={16}/> Logs
              {activeTab === 'chats' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#2c5f63]"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('crew')}
            className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all relative ${
                activeTab === 'crew' 
                ? 'text-[#2c5f63] bg-[#f4f1ea]' 
                : 'text-[#8c7a6b] hover:bg-[#faf9f6]'
            }`}
          >
              <UserPlus size={16}/> Recruit
              {activeTab === 'crew' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#2c5f63]"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all relative ${
                activeTab === 'profile' 
                ? 'text-[#2c5f63] bg-[#f4f1ea]' 
                : 'text-[#8c7a6b] hover:bg-[#faf9f6]'
            }`}
          >
              <UserCog size={16}/> Profile
              {activeTab === 'profile' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#2c5f63]"></div>}
          </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col relative bg-[#fdfbf7]">
        
        {activeTab === 'chats' && (
            <>
                <div className="p-3 bg-[#fdfbf7] z-10">
                    <div className="relative flex items-center bg-[#f4f1ea] border border-[#e6e2d3] rounded-lg px-3 py-2">
                        <Search size={16} className="text-[#8c7a6b] mr-3" />
                        <input
                            type="text"
                            placeholder="Search captain's logs..."
                            className="flex-1 bg-transparent border-none outline-none text-sm text-[#3e3226] placeholder-[#8c7a6b]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filteredContacts.map((contact) => (
                    <div
                        key={contact.phone}
                        onClick={() => onSelectContact(contact)}
                        className={`group flex items-center px-4 py-3 cursor-pointer border-b border-transparent hover:bg-[#f4f1ea] transition-all ${
                        selectedContactId === contact.phone 
                            ? 'bg-[#f0ece3] border-l-4 border-l-[#bf9b30]' 
                            : 'border-l-4 border-l-transparent'
                        }`}
                    >
                        <div className="relative w-12 h-12 flex-shrink-0 mr-4">
                            <img
                                src={contact.avatar}
                                alt={contact.name}
                                className="w-full h-full rounded-full object-cover border border-[#d4c5a9]"
                            />
                        </div>
                        
                        <div className="flex-1 min-w-0 flex flex-col justify-center h-full">
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className={`text-base font-semibold truncate ${selectedContactId === contact.phone ? 'text-[#000]' : 'text-[#3e3226]'}`}>
                                    {contact.name}
                                </h3>
                                <span className="text-[11px] text-[#8c7a6b] whitespace-nowrap ml-2">
                                    {contact.lastMessageTime || ''}
                                </span>
                            </div>
                            <p className="text-[13px] text-[#6b5b48] truncate pr-2">
                                {contact.lastMessage || 'Start a parley...'}
                            </p>
                        </div>
                    </div>
                    ))}
                    
                    {contacts.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64 opacity-40">
                            <MapIcon size={48} className="text-[#d4c5a9] mb-2"/>
                            <p className="pirate-font text-[#8c7a6b]">No voyages recorded.</p>
                        </div>
                    )}
                </div>
            </>
        )}

        {activeTab === 'crew' && (
            <div className="p-8 flex flex-col items-center justify-center h-full bg-[#fdfbf7]">
                 <div className="w-full max-w-xs bg-white p-6 rounded-lg border border-[#d4c5a9] shadow-sm">
                     <h2 className="pirate-font text-xl text-[#3e3226] mb-4 text-center">Recruit New Crew</h2>
                     <label className="block text-xs font-bold uppercase mb-2 text-[#8c7a6b]">Den Den Mushi (Phone)</label>
                     <input 
                        type="text" 
                        autoFocus
                        placeholder="e.g. 555-999"
                        className="w-full bg-[#f4f1ea] p-2 border border-[#d4c5a9] rounded mb-4 font-mono text-sm focus:outline-none focus:border-[#bf9b30]"
                        value={newChatPhone}
                        onChange={(e) => setNewChatPhone(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleStartNewChat()}
                      />
                      <button 
                        onClick={handleStartNewChat}
                        disabled={isSearchingUser}
                        className="w-full bg-[#2c5f63] text-white py-2.5 rounded font-bold hover:bg-[#1f4649] transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
                      >
                          {isSearchingUser ? <Loader2 className="animate-spin" size={16}/> : <Sword size={16}/>}
                          Add to Manifest
                      </button>
                 </div>
            </div>
        )}

        {activeTab === 'profile' && (
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#fdfbf7]">
                <div className="max-w-xs mx-auto mt-4 bg-white p-6 rounded-lg border border-[#d4c5a9] shadow-sm">
                    <h2 className="pirate-font text-xl text-[#3e3226] mb-6 text-center">Captain's Log</h2>
                    
                    {/* Avatar Edit */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-24 h-24 rounded-full border-2 border-[#bf9b30] overflow-hidden mb-3 relative group">
                            <img src={editAvatar || 'https://ui-avatars.com/api/?name=User'} alt="Avatar" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black bg-opacity-30 hidden group-hover:flex items-center justify-center">
                                <Camera className="text-white opacity-80" size={24}/>
                            </div>
                        </div>
                        <label className="block text-xs font-bold uppercase mb-1 text-[#8c7a6b]">Portrait URL</label>
                        <input 
                            type="text"
                            value={editAvatar}
                            onChange={(e) => setEditAvatar(e.target.value)}
                            className="w-full bg-[#f4f1ea] p-2 border border-[#d4c5a9] rounded text-xs text-[#3e3226] focus:outline-none focus:border-[#bf9b30]"
                            placeholder="https://..."
                        />
                    </div>

                    {/* Name Edit */}
                    <div className="mb-4">
                        <label className="block text-xs font-bold uppercase mb-2 text-[#8c7a6b]">Pirate Name</label>
                        <input 
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full bg-[#f4f1ea] p-2 border border-[#d4c5a9] rounded font-medium text-[#3e3226] focus:outline-none focus:border-[#bf9b30]"
                        />
                    </div>

                    {/* About Edit */}
                    <div className="mb-6">
                        <label className="block text-xs font-bold uppercase mb-2 text-[#8c7a6b]">About / Status</label>
                        <textarea 
                            value={editAbout}
                            onChange={(e) => setEditAbout(e.target.value)}
                            className="w-full bg-[#f4f1ea] p-2 border border-[#d4c5a9] rounded text-sm text-[#3e3226] focus:outline-none focus:border-[#bf9b30] resize-none h-20"
                            placeholder="Setting sail..."
                        />
                    </div>

                    <button 
                        onClick={handleSaveProfile}
                        className="w-full bg-[#2c5f63] text-white py-2.5 rounded font-bold hover:bg-[#1f4649] transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
                    >
                        <Save size={16} />
                        Save Changes
                    </button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};
