import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { Login } from './components/Login';
import { Contact, User } from './types';
import { getConversations, getCurrentUser, initializeSchema, logoutUser } from './services/dbService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        // Initialize DB Schema (Create tables if not exist)
        await initializeSchema();
        
        const storedUser = getCurrentUser();
        if (storedUser) {
          setUser(storedUser);
        }
      } catch (error) {
        console.error("Failed to initialize app:", error);
      } finally {
        // Always stop loading, even if there was an error reading user data
        setIsLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchContacts = async () => {
      try {
        const data = await getConversations(user.phone);
        setContacts(data);
      } catch (e) {
        console.error("Sync Error:", e);
      }
    };

    fetchContacts();
    const interval = setInterval(fetchContacts, 4000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLoginSuccess = () => {
    try {
        const currentUser = getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
    } catch (e) {
        console.error("Login success handler error:", e);
    }
  };

  const handleLogout = () => {
      logoutUser();
      setUser(null);
      setSelectedContact(null);
      setContacts([]);
  };

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
  };

  if (isLoading) {
    return (
      <div className="h-full w-full bg-[#f0f2f5] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-[#bf9b30] border-t-transparent rounded-full animate-spin"></div>
        <p className="pirate-font text-[#3e3226]">Loading Charts...</p>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#dcd6bc] xl:py-5 flex justify-center items-center">
      {/* Main Card Container */}
      <div className="h-full w-full xl:h-[95vh] xl:w-[95vw] max-w-[1600px] bg-white xl:shadow-2xl flex overflow-hidden xl:rounded-xl border border-[#c0b399]">
        
        {/* Sidebar */}
        <div className={`
          ${selectedContact ? 'hidden md:flex' : 'flex'} 
          w-full md:w-[320px] lg:w-[400px] h-full border-r border-[#d4c5a9]
        `}>
          <Sidebar 
            contacts={contacts} 
            onSelectContact={handleSelectContact} 
            onLogout={handleLogout}
            selectedContactId={selectedContact?.phone}
          />
        </div>

        {/* Main Content Area */}
        <div className={`
          ${selectedContact ? 'flex' : 'hidden md:flex'} 
          flex-1 h-full bg-[#f4f1ea] relative
        `}>
          {selectedContact ? (
            <ChatWindow contact={selectedContact} onBack={() => setSelectedContact(null)} />
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full bg-[#f8f6f2] text-center border-b-[6px] border-[#bf9b30] p-8">
              <div className="max-w-md">
                <div className="w-32 h-32 mx-auto mb-6 opacity-80">
                   {/* Decorative Image/Icon placeholder */}
                   <svg viewBox="0 0 24 24" fill="none" stroke="#d4c5a9" strokeWidth="1" className="w-full h-full">
                     <circle cx="12" cy="12" r="10" />
                     <path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
                   </svg>
                </div>
                <h1 className="pirate-font text-[#3e3226] text-4xl mb-4">Mugiwara Chat</h1>
                <p className="text-[#6b5b48] text-base leading-relaxed mb-8">
                  Welcome aboard, Captain! Select a crew member from the list to start planning your next voyage. 
                  <br/><br/>
                  <span className="text-sm italic opacity-75">"The sea is vast, but our connection is instant."</span>
                </p>
                <div className="flex items-center justify-center gap-2 text-[#8c7a6b] text-xs uppercase tracking-widest">
                  <span>🔒 Secure Parley</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;