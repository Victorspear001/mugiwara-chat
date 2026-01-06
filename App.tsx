import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { Contact } from './types';
import { getContacts } from './services/mockDb';

const App: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getContacts();
        setContacts(data);
      } catch (e) {
        console.error("Failed to load contacts", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
  };

  const handleBack = () => {
    setSelectedContact(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f0f2f5] text-[#00a884] flex-col gap-4">
        <svg className="animate-spin h-10 w-10" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <div className="text-sm font-medium text-[#41525d]">Loading Mugiwara Chat...</div>
        <div className="text-xs text-[#8696a0] mt-4 flex items-center gap-1">
             <span className="text-[10px]">🔒</span> End-to-end encrypted
        </div>
      </div>
    );
  }

  return (
    // Main Container
    <div className="relative h-screen w-screen overflow-hidden bg-[#d1d7db] xl:py-[19px]">
        {/* White App Container (Centered on Large Screens) */}
        <div className="h-full w-full max-w-[1600px] mx-auto bg-white xl:shadow-lg flex overflow-hidden xl:rounded-sm">
            
            {/* Sidebar Logic: Always visible on desktop. On mobile, visible only if no chat selected. */}
            <div className={`
                ${selectedContact ? 'hidden md:flex' : 'flex'} 
                w-full md:w-auto h-full
            `}>
                <Sidebar 
                    contacts={contacts} 
                    onSelectContact={handleSelectContact} 
                    selectedContactId={selectedContact?.id}
                />
            </div>

            {/* Chat Logic: Always visible on desktop (placeholder if null). On mobile, visible only if chat selected. */}
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
