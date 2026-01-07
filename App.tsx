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
      // Clear local storage via service
      logoutUser();
      // Clear React State immediately to update UI without waiting for reload
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
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/1024px-WhatsApp.svg.png" 
          alt="Loading" 
          className="w-16 h-16 animate-pulse opacity-50"
        />
        <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-[#00a884] animate-[loading_2s_ease-in-out_infinite]" style={{ width: '30%' }}></div>
        </div>
        <style>{`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(250%); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#d1d7db] xl:py-5">
      <div className="h-full w-full max-w-[1600px] mx-auto bg-white xl:shadow-2xl flex overflow-hidden xl:rounded-md">
        
        {/* Sidebar */}
        <div className={`
          ${selectedContact ? 'hidden md:flex' : 'flex'} 
          w-full md:w-[30%] lg:w-[400px] h-full border-r border-[#e9edef]
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
          flex-1 h-full
        `}>
          {selectedContact ? (
            <ChatWindow contact={selectedContact} onBack={() => setSelectedContact(null)} />
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full bg-[#f0f2f5] text-center border-b-[6px] border-[#25d366]">
              <div className="max-w-md px-6">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/1024px-WhatsApp.svg.png" 
                  alt="Mugiwara" 
                  className="w-24 h-24 mb-10 mx-auto opacity-20 grayscale" 
                />
                <h1 className="text-[#41525d] text-3xl font-light mb-4">Mugiwara Chat</h1>
                <p className="text-[#667781] text-sm leading-relaxed mb-10">
                  Send and receive messages in real-time. This application is powered by Turso for global database synchronization.
                </p>
                <div className="text-[#8696a0] text-xs flex items-center justify-center gap-1">
                  <span className="text-[10px]">🔒</span> End-to-end encrypted
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