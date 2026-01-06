import React, { useState, useEffect, useRef } from 'react';
import { Search, MoreVertical, Paperclip, Smile, Mic, Send } from 'lucide-react';
import { Contact, Message } from '../types';
import { getMessages, sendMessage, simulateReply } from '../services/mockDb';

interface ChatWindowProps {
  contact: Contact;
  onBack: () => void; // For mobile view handling
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ contact, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages when contact changes
  useEffect(() => {
    const loadMessages = async () => {
      const msgs = await getMessages(contact.id);
      setMessages(msgs);
    };
    loadMessages();
  }, [contact.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;
    
    setIsSending(true);
    try {
      // Optimistic update
      const tempId = Date.now().toString();
      const optimisticMsg: Message = {
        id: tempId,
        contactId: contact.id,
        text: inputText,
        sender: 'me',
        timestamp: Date.now(),
        status: 'sent'
      };
      setMessages(prev => [...prev, optimisticMsg]);
      setInputText('');

      // Actual send
      await sendMessage(contact.id, optimisticMsg.text);
      
      // Simulate a reply for interactivity
      setTimeout(async () => {
         const reply = await simulateReply(contact.id);
         setMessages(prev => [...prev, reply]);
      }, 1000);

    } catch (error) {
      console.error("Failed to send", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-[#efeae2] relative w-full">
      {/* Background Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')",
          backgroundRepeat: 'repeat'
        }}
      />

      {/* Chat Header */}
      <div className="relative z-10 flex items-center justify-between px-4 py-2.5 bg-[#f0f2f5] border-b border-[#d1d7db]">
        <div className="flex items-center">
          {/* Back Button (Mobile only logic handled by CSS usually, but here explicit prop) */}
          <button onClick={onBack} className="mr-3 md:hidden text-[#54656f]">
             <svg viewBox="0 0 24 24" height="24" width="24" preserveAspectRatio="xMidYMid meet" version="1.1" x="0px" y="0px" enableBackground="new 0 0 24 24"><path fill="currentColor" d="M12,4l1.4,1.4L7.8,11H20v2H7.8l5.6,5.6L12,20l-8-8L12,4z"></path></svg>
          </button>
          
          <div className="w-10 h-10 rounded-full overflow-hidden mr-3 cursor-pointer">
            <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col justify-center cursor-pointer">
            <h2 className="text-[#111b21] text-[16px] font-normal leading-tight">{contact.name}</h2>
            <span className="text-[13px] text-[#667781]">online</span>
          </div>
        </div>
        <div className="flex items-center gap-5 text-[#54656f]">
          <button><Search size={20} /></button>
          <button><MoreVertical size={20} /></button>
        </div>
      </div>

      {/* Message Area */}
      <div className="relative z-10 flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="flex flex-col space-y-2 pb-2">
            {/* Encryption Notice */}
            <div className="flex justify-center my-4">
                <div className="bg-[#ffeecd] text-[#54656f] text-[12.5px] px-3 py-1.5 rounded-lg shadow-sm text-center max-w-[90%]">
                    🔒 Messages are end-to-end encrypted. No one outside of this chat, not even Mugiwara Chat, can read or listen to them.
                </div>
            </div>

            {messages.map((msg, idx) => {
                const isMe = msg.sender === 'me';
                const isChain = idx > 0 && messages[idx - 1].sender === msg.sender;
                
                return (
                    <div 
                        key={msg.id} 
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${isChain ? 'mt-0.5' : 'mt-2'}`}
                    >
                        <div 
                            className={`
                                relative max-w-[85%] md:max-w-[65%] rounded-lg px-2 py-1.5 text-[14.2px] shadow-sm
                                ${isMe ? 'bg-[#d9fdd3] rounded-tr-none' : 'bg-white rounded-tl-none'}
                            `}
                        >
                             {/* Tail SVG - simplified approximation */}
                             {!isChain && (
                                <span className={`absolute top-0 ${isMe ? '-right-[8px] text-[#d9fdd3]' : '-left-[8px] text-white'}`}>
                                    <svg viewBox="0 0 8 13" height="13" width="8" preserveAspectRatio="xMidYMid meet" className={isMe ? "" : "transform scale-x-[-1]"}>
                                        <path opacity="0.13" fill="#0000000" d="M1.533,3.568L8,12.193V1H2.812 C1.042,1,0.474,2.156,1.533,3.568z"></path>
                                        <path fill="currentColor" d="M1.533,2.568L8,11.193V0L2.812,0C1.042,0,0.474,1.156,1.533,2.568z"></path>
                                    </svg>
                                </span>
                             )}

                            <div className="px-1 pt-1 pb-4 text-[#111b21] break-words whitespace-pre-wrap">
                                {msg.text}
                            </div>
                            <div className="absolute right-2 bottom-1 flex items-center gap-1">
                                <span className="text-[11px] text-[#667781] min-w-[3rem] text-right">
                                    {formatTime(msg.timestamp)}
                                </span>
                                {isMe && (
                                    <span className={`text-[15px] ${msg.status === 'read' ? 'text-[#53bdeb]' : 'text-[#667781]'}`}>
                                        <svg viewBox="0 0 16 11" height="11" width="16" preserveAspectRatio="xMidYMid meet" version="1.1" x="0px" y="0px" enableBackground="new 0 0 16 11">
                                            <path fill="currentColor" d="M10.041,10.281L10.041,10.281l5.772-8.527c0.234-0.371,0.122-0.865-0.25-1.099 c-0.37-0.233-0.864-0.121-1.098,0.25L9.12,8.547L6.464,5.882C6.222,5.65,5.839,5.66,5.607,5.903c-0.231,0.243-0.222,0.626,0.021,0.858 l3.313,3.22c0.26,0.255,0.686,0.255,0.957-0.012C10.016,10.088,10.033,10.187,10.041,10.281z M4.654,9.652l-0.563-0.548 l3.179-3.189c0.232-0.243,0.241-0.626,0.009-0.858c-0.231-0.232-0.605-0.242-0.847-0.01L2.344,9.157L0.469,7.323 C0.228,7.09,0.155,6.708,0.165,6.465c0.231-0.242,0.605-0.233,0.847-0.011l2.5,2.443L4.654,9.652z"></path>
                                        </svg>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="relative z-10 px-4 py-2 bg-[#f0f2f5] border-t border-[#d1d7db] flex items-end gap-2">
        <button className="text-[#54656f] p-1 mb-1 hover:bg-gray-200 rounded-full transition-colors">
            <Smile size={24} />
        </button>
        <button className="text-[#54656f] p-1 mb-1 hover:bg-gray-200 rounded-full transition-colors">
            <Paperclip size={24} />
        </button>
        
        <div className="flex-1 bg-white rounded-lg min-h-[42px] flex items-center px-4 py-2 my-1">
            <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message"
                className="w-full bg-transparent border-none outline-none text-[#111b21] resize-none max-h-[100px] overflow-y-auto custom-scrollbar leading-[1.4]"
                rows={1}
                style={{ height: '24px' }} // In a real app, auto-grow logic here
            />
        </div>

        {inputText.trim() ? (
            <button 
                onClick={handleSend}
                className="text-[#54656f] p-2 mb-1 hover:bg-gray-200 rounded-full transition-colors"
            >
                <Send size={24} />
            </button>
        ) : (
             <button className="text-[#54656f] p-2 mb-1 hover:bg-gray-200 rounded-full transition-colors">
                <Mic size={24} />
            </button>
        )}
      </div>
    </div>
  );
};
