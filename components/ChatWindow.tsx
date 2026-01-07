import React, { useState, useEffect, useRef } from 'react';
import { Search, MoreVertical, Smile, Send, Image as ImageIcon, X } from 'lucide-react';
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

      if (file.size > 1024 * 1024) { 
          alert("Image is too large (Max 1MB)");
          return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
          const base64 = reader.result as string;
          handleSend(base64);
      };
      reader.readAsDataURL(file);
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
              <img src={text} alt="Shared" className="max-w-full rounded-md border border-[#d4c5a9] max-h-[300px] object-cover" />
          );
      }
      return <div className="break-words whitespace-pre-wrap text-[15px] leading-relaxed">{text}</div>;
  };

  return (
    <div className="flex flex-col h-full bg-[#f0eadd] relative w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-[64px] bg-[#f4f1ea] border-b border-[#d4c5a9] flex-shrink-0 relative z-20">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-3 md:hidden text-[#6b5b48] hover:bg-[#e6e2d3] p-1 rounded-full">
             <X size={24}/>
          </button>
          
          <div className="w-10 h-10 rounded-full border border-[#bf9b30] overflow-hidden mr-3">
            <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="text-[#3e3226] text-base font-bold leading-none mb-1">{contact.name}</h2>
            <span className="text-[10px] text-[#6b5b48] uppercase tracking-wider">Wanted Alive</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[#6b5b48]">
          <button className="p-2 hover:bg-[#e6e2d3] rounded-full transition-colors"><Search size={20} /></button>
          <button className="p-2 hover:bg-[#e6e2d3] rounded-full transition-colors"><MoreVertical size={20} /></button>
        </div>
      </div>

      {/* Message Area */}
      <div className="relative z-10 flex-1 overflow-y-auto p-4 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/dust.png')]">
        <div className="flex flex-col space-y-2 pb-2">
            
            {/* Encryption Notice */}
            <div className="flex justify-center my-4">
                <div className="bg-[#fdfbf7] border border-[#e6e2d3] text-[#8c7a6b] text-xs px-3 py-1.5 rounded-lg shadow-sm text-center max-w-[90%]">
                    ⚓ Secure parley. Messages are encrypted.
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
                                relative max-w-[85%] md:max-w-[65%] px-3 py-2 shadow-sm text-[#3e3226]
                                ${isMe 
                                    ? 'bg-[#e1ffc7] rounded-l-lg rounded-br-lg rounded-tr-none' 
                                    : 'bg-white rounded-r-lg rounded-bl-lg rounded-tl-none'}
                            `}
                        >
                            <div className="mb-1">
                                {renderMessageContent(msg.text)}
                            </div>
                            <div className="flex items-center gap-1 justify-end mt-0.5 opacity-60">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-[#6b5b48]">
                                    {formatTime(msg.timestamp)}
                                </span>
                                {isMe && (
                                    <span className={msg.status === 'read' ? 'text-[#34b7f1]' : 'text-gray-400'}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
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
      <div className="relative z-10 px-4 py-2 bg-[#f4f1ea] border-t border-[#d4c5a9] flex items-end gap-2 flex-shrink-0">
        
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept="image/*"
        />

        {/* Action Buttons */}
        <div className="flex gap-1 mb-2">
            <button 
                onClick={() => setShowEmoji(!showEmoji)}
                className={`p-2 rounded-full transition-colors ${showEmoji ? 'text-[#bf9b30] bg-[#e6e2d3]' : 'text-[#8c7a6b] hover:text-[#6b5b48]'}`}
            >
                <Smile size={24} />
            </button>
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-[#8c7a6b] p-2 hover:text-[#6b5b48] rounded-full transition-colors"
                title="Send Image"
            >
                <ImageIcon size={24} />
            </button>
        </div>
        
        {/* Text Input */}
        <div className="flex-1 bg-white border border-[#fff] rounded-lg min-h-[42px] flex items-center px-4 py-2 my-1 focus-within:border-[#d4c5a9] focus-within:shadow-sm transition-all">
            <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Write message..."
                className="w-full bg-transparent border-none outline-none text-[#3e3226] placeholder-[#a09080] resize-none max-h-[100px] overflow-y-auto custom-scrollbar leading-[1.4]"
                rows={1}
                style={{ height: '24px' }}
            />
        </div>

        {/* Send Button */}
        <button 
            onClick={() => handleSend()}
            disabled={!inputText.trim()}
            className={`p-3 mb-1 rounded-full transition-all shadow-sm ${inputText.trim() ? 'bg-[#2c5f63] text-white hover:bg-[#1f4649]' : 'bg-[#e6e2d3] text-[#a09080]'}`}
        >
            <Send size={18} fill={inputText.trim() ? "currentColor" : "none"}/>
        </button>

        {/* Emoji Picker Popover */}
        {showEmoji && (
            <div className="absolute bottom-20 left-4 bg-white border border-[#d4c5a9] rounded-lg p-2 shadow-xl grid grid-cols-4 gap-2 w-64 animate-in slide-in-from-bottom-2 z-50">
                {PIRATE_EMOJIS.map(e => (
                    <button 
                        key={e} 
                        onClick={() => addEmoji(e)}
                        className="text-2xl hover:bg-[#f4f1ea] p-2 rounded transition-colors"
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