import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { Login } from './components/Login';
import { Contact, User } from './types';
import { getConversations, getCurrentUser } from './services/dbService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth status on load
  useEffect(() => {
    const storedUser = getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  // Poll for contact list updates (new messages bring conversations to top)
  useEffect(() => {
    if (!user) return;

    const fetchContacts = async () => {
      try {
        const data = await getConversations(user.phone);
        setContacts(data);
      } catch (e) {
        console.error("Failed to load contacts", e);
      }
    };

    fetchContacts();
    const interval = setInterval(fetchContacts, 5000); // Update sidebar every 5s
    return () => clearInterval(interval);
  }, [user]);

  const handleLoginSuccess = () => {
    setUser(getCurrentUser());
  };

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
  };

  const handleBack = () => {
    setSelectedContact(null);
  };

  if (isLoading) {
     return <div className="h-screen w-screen bg-[#f0f2f5]"></div>;
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    // Main Container
    <div className="relative h-screen w-screen overflow-hidden bg-[#d1d7db] xl:py-[19px]">
        {/* White App Container (Centered on Large Screens) */}
        <div className="h-full w-full max-w-[1600px] mx-auto bg-white xl:shadow-lg flex overflow-hidden xl:rounded-sm">
            
            {/* Sidebar Logic */}
            <div className={`
                ${selectedContact ? 'hidden md:flex' : 'flex'} 
                w-full md:w-auto h-full
            `}>
                <Sidebar 
                    contacts={contacts} 
                    onSelectContact={handleSelectContact} 
                    selectedContactId={selectedContact?.phone} // Use phone as ID
                />
            </div>

            {/* Chat Logic */}
            <div className={`
                ${selectedContact ? 'flex' : 'hidden md:flex'} 
                flex-1 h-full
            `}>
                {selectedContact ? (
                    <ChatWindow contact={selectedContact} onBack={handleBack} />
                ) : (
                    // Empty State (Desktop only)
                    <div className="hidden md:flex flex-col items-center justify-center w-full h-full bg-[#f0f2f5] border-l border-[#d1d7db] text-center border-b-[6px] border-[#25d366]">
                         <div className="max-w-[560px] flex flex-col items-center">
                            <img 
                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/1024px-WhatsApp.svg.png" 
                                alt="Welcome" 
                                className="w-[100px] h-[100px] mb-8 opacity-40 grayscale" 
                            />
                            <h1 className="text-[#41525d] text-[32px] font-light mb-4">Mugiwara Chat Web</h1>
                            <p className="text-[#667781] text-[14px] leading-6 mb-8">
                                Send and receive messages without keeping your phone online.<br/>
                                Use Mugiwara Chat on up to 4 linked devices and 1 phone.
                            </p>
                            <div className="text-[#8696a0] text-[12px] flex items-center gap-1 mt-auto absolute bottom-10">
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