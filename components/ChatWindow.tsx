import React, { useState, useEffect, useRef } from 'react';
import { Search, MoreVertical, Paperclip, Smile, Send, Image as ImageIcon, X } from 'lucide-react';
import { Contact, Message } from '../types';
import { getMessages, sendMessage, getCurrentUser } from '../services/dbService';

interface ChatWindowProps {
  contact: Contact;
  onBack: () => void;
}

const PIRATE_EMOJIS = ["🏴‍☠️", "⚓", "🦜", "🍺", "⚔️", "💣", "💰", "🗺️", "🌊", "☠️", "🍖", "🏝️", "⛵", "🪙", "🦈", "📜"];

export const ChatWindow: React.FC<ChatWindowProps> = ({ contact, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUser = getCurrentUser();

  // Load messages & Poll
  useEffect(() => {
    if (!currentUser) return;

    const fetchMsgs = async () => {
      const msgs = await getMessages(currentUser.phone, contact.phone);
      setMessages(msgs);
    };

    fetchMsgs();
    const interval = setInterval(fetchMsgs, 3000);
    return () => clearInterval(interval);

  }, [contact.phone, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textOverride?: string) => {
    const content = textOverride || inputText;
    if (!content.trim() || isSending || !currentUser) return;
    
    setIsSending(true);
    setInputText(''); 
    setShowEmoji(false);

    try {
      // Optimistic update
      const tempId = Date.now().toString();
      const optimisticMsg: Message = {
        id: tempId,
        senderPhone: currentUser.phone,
        receiverPhone: contact.phone,
        text: content,
        timestamp: Date.now(),
        status: 'sent',
        isMe: true
      };
      setMessages(prev => [...prev, optimisticMsg]);

      await sendMessage(currentUser.phone, contact.phone, content);
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 1024 * 1024) { // 1MB limit for this demo
          alert("That cargo is too heavy! (Max 1MB)");
          return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
          const base64 = reader.result as string;
          handleSend(base64);
      };
      reader.readAsDataURL(file);
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addEmoji = (emoji: string) => {
      setInputText(prev => prev + emoji);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessageContent = (text: string) => {
      if (text.startsWith('data:image')) {
          return (
              <img src={text} alt="Shared" className="max-w-full rounded-md border border-[#8c7a6b] max-h-[300px] object-cover" />
          );
      }
      return <div className="break-words whitespace-pre-wrap font-serif text-[15px]">{text}</div>;
  };

  return (
    <div className="flex flex-col h-full bg-[#2c241b] relative w-full">
      {/* Background Texture */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: "url('https://www.transparenttextures.com/patterns/black-scales.png')",
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 bg-[#1a1a1a] border-b border-[#bf9b30] shadow-xl">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-3 md:hidden text-[#bf9b30]">
             <X size={24}/>
          </button>
          
          <div className="w-10 h-10 rounded-full border border-[#bf9b30] overflow-hidden mr-3 bg-[#2c241b]">
            <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover opacity-90" />
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="text-[#d4c5a9] text-lg pirate-font leading-tight">{contact.name}</h2>
            <span className="text-[12px] text-[#8c7a6b] uppercase tracking-wider">Wanted Alive</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[#bf9b30]">
          <button><Search size={20} /></button>
          <button><MoreVertical size={20} /></button>
        </div>
      </div>

      {/* Message Area */}
      <div className="relative z-10 flex-1 overflow-y-auto p-4 custom-scrollbar bg-parchment/10">
        <div className="flex flex-col space-y-4 pb-2">
            
            {/* Encryption Notice */}
            <div className="flex justify-center my-4">
                <div className="bg-[#bf9b30]/20 border border-[#bf9b30]/50 text-[#d4c5a9] text-xs px-4 py-2 rounded shadow-sm text-center max-w-[90%] font-serif italic">
                    ⚓ Secure Channel: Messages be sealed with wax and magic. Only ye and yer matey can read 'em.
                </div>
            </div>

            {messages.map((msg, idx) => {
                const isMe = msg.isMe;
                
                return (
                    <div 
                        key={msg.id} 
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                        <div 
                            className={`
                                relative max-w-[85%] md:max-w-[65%] px-3 py-2 shadow-md
                                ${isMe 
                                    ? 'bg-[#3e3226] text-[#d4c5a9] rounded-l-lg rounded-br-lg border border-[#bf9b30]/50' 
                                    : 'bg-parchment text-[#2c241b] rounded-r-lg rounded-bl-lg border border-[#8c7a6b]'}
                            `}
                        >
                            <div className="mb-1">
                                {renderMessageContent(msg.text)}
                            </div>
                            <div className={`flex items-center gap-1 justify-end mt-1 ${isMe ? 'opacity-70' : 'opacity-50'}`}>
                                <span className="text-[10px] uppercase font-bold tracking-wider">
                                    {formatTime(msg.timestamp)}
                                </span>
                                {isMe && (
                                    <span className={msg.status === 'read' ? 'text-[#bf9b30]' : 'text-gray-400'}>
                                        {/* Double Check Icon */}
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
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
      <div className="relative z-10 px-4 py-3 bg-[#2c241b] border-t-2 border-[#bf9b30] flex items-end gap-2 shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
        
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept="image/*"
        />

        {/* Action Buttons */}
        <div className="flex gap-1 mb-1">
            <button 
                onClick={() => setShowEmoji(!showEmoji)}
                className={`p-2 rounded-full transition-colors ${showEmoji ? 'text-[#bf9b30] bg-black/20' : 'text-[#8c7a6b] hover:text-[#d4c5a9]'}`}
            >
                <Smile size={24} />
            </button>
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-[#8c7a6b] p-2 hover:text-[#d4c5a9] rounded-full transition-colors"
                title="Send Painting"
            >
                <ImageIcon size={24} />
            </button>
        </div>
        
        {/* Text Input */}
        <div className="flex-1 bg-[#1a1a1a] border border-[#5c4d3c] rounded-lg min-h-[42px] flex items-center px-4 py-2 my-1 focus-within:border-[#bf9b30] transition-colors">
            <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Write in the log..."
                className="w-full bg-transparent border-none outline-none text-[#d4c5a9] placeholder-[#5c4d3c] resize-none max-h-[100px] overflow-y-auto custom-scrollbar leading-[1.4] font-serif"
                rows={1}
                style={{ height: '24px' }}
            />
        </div>

        {/* Send Button */}
        <button 
            onClick={() => handleSend()}
            disabled={!inputText.trim()}
            className={`p-3 mb-1 rounded-full transition-all shadow-lg ${inputText.trim() ? 'bg-[#bf9b30] text-[#2c241b] hover:bg-[#d4b045] hover:scale-105' : 'bg-[#3e3226] text-[#5c4d3c]'}`}
        >
            <Send size={20} fill={inputText.trim() ? "#2c241b" : "none"}/>
        </button>

        {/* Emoji Picker Popover */}
        {showEmoji && (
            <div className="absolute bottom-20 left-4 bg-[#3e3226] border-2 border-[#bf9b30] rounded-lg p-2 shadow-2xl grid grid-cols-4 gap-2 w-64 animate-in slide-in-from-bottom-5">
                {PIRATE_EMOJIS.map(e => (
                    <button 
                        key={e} 
                        onClick={() => addEmoji(e)}
                        className="text-2xl hover:bg-[#2c241b] p-2 rounded transition-colors"
                    >
                        {e}
                    </button>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};