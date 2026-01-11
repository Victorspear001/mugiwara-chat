
import React, { useState, useEffect, useRef } from 'react';
import { Search, MoreVertical, Smile, Send, Image as ImageIcon, Video, Mic, X, StopCircle } from 'lucide-react';
import { Contact, Message, MessageType } from '../types';
import { getMessages, sendMessage, getCurrentUser } from '../services/dbService';

interface ChatWindowProps {
  contact: Contact;
  onBack: () => void;
}

// Expanded Android-like Emoji Pack
const EMOJI_CATEGORIES = {
    "Recent": ["😂", "❤️", "😍", "🔥", "👍", "🏴‍☠️", "⚓"],
    "Faces": ["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥", "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "🥵", "🥶", "🥴", "😵", "🤯", "🤠", "🥳", "😎", "🤓", "🧐", "😕", "😟", "🙁", "☹️", "😮", "😯", "😲", "😳", "🥺", "😦", "😧", "😨", "😰", "😥", "😢", "😭", "😱", "😖", "😣", "😞", "😓", "😩", "😫", "🥱", "😤", "😡", "😠", "🤬", "😈", "👿", "💀", "☠️", "💩", "🤡", "👹", "👺", "👻", "👽", "👾", "🤖"],
    "Gestures": ["👋", "🤚", "🖐", "✋", "🖖", "👌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏"],
    "Hearts": ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟"],
    "Pirate": ["🏴‍☠️", "⚓", "🦜", "🍺", "⚔️", "💣", "💰", "🗺️", "🌊", "☠️", "🍖", "🏝️", "⛵", "🪙", "🦈", "📜"],
};

export const ChatWindow: React.FC<ChatWindowProps> = ({ contact, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [activeEmojiCat, setActiveEmojiCat] = useState("Faces");
  
  // Audio Recording
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const currentUser = getCurrentUser();

  // Notifications permission
  useEffect(() => {
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }
  }, []);

  // Poll messages & Handle Notifications
  useEffect(() => {
    if (!currentUser) return;

    const fetchMsgs = async () => {
      const msgs = await getMessages(currentUser.phone, contact.phone);
      
      // Check for new messages for notification
      setMessages(prev => {
          if (msgs.length > prev.length) {
              const lastMsg = msgs[msgs.length - 1];
              // If last message is NOT me and it's new
              if (!lastMsg.isMe && (!prev.length || lastMsg.id !== prev[prev.length - 1].id)) {
                 if (document.visibilityState === 'hidden' && Notification.permission === "granted") {
                     new Notification(`New message from ${contact.name}`, {
                         body: lastMsg.type === 'text' ? lastMsg.text : `Sent a ${lastMsg.type}`,
                         icon: contact.avatar
                     });
                 }
              }
          }
          return msgs;
      });
    };

    fetchMsgs();
    const interval = setInterval(fetchMsgs, 2000);
    return () => clearInterval(interval);
  }, [contact.phone, currentUser, contact.name]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (contentOverride?: string, type: MessageType = 'text') => {
    const content = contentOverride || inputText;
    if ((!content.trim() && type === 'text') || isSending || !currentUser) return;
    
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
        type: type,
        timestamp: Date.now(),
        status: 'sent',
        isMe: true
      };
      setMessages(prev => [...prev, optimisticMsg]);

      await sendMessage(currentUser.phone, contact.phone, content, type);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      // Basic size check (approx 4MB limit for base64 string safety in simple implementation)
      if (file.size > 4 * 1024 * 1024) {
          alert("File too large (Max 4MB)");
          return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
          const base64 = reader.result as string;
          handleSend(base64, type);
      };
      reader.readAsDataURL(file);
      e.target.value = ''; // Reset input
  };

  // Voice Recording Logic
  const startRecording = async () => {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const recorder = new MediaRecorder(stream);
          mediaRecorderRef.current = recorder;
          audioChunksRef.current = [];

          recorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                  audioChunksRef.current.push(event.data);
              }
          };

          recorder.onstop = () => {
              const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
              const reader = new FileReader();
              reader.readAsDataURL(audioBlob);
              reader.onloadend = () => {
                  const base64 = reader.result as string;
                  handleSend(base64, 'audio');
              };
              stream.getTracks().forEach(track => track.stop()); // Stop mic
          };

          recorder.start();
          setIsRecording(true);
      } catch (e) {
          alert("Microphone access denied or not available.");
          console.error(e);
      }
  };

  const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
      }
  };

  const addEmoji = (emoji: string) => {
      setInputText(prev => prev + emoji);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessageContent = (msg: Message) => {
      if (msg.type === 'image') {
          return <img src={msg.text} alt="Shared" className="max-w-full rounded-md border border-[#d4c5a9] max-h-[300px] object-cover" />;
      }
      if (msg.type === 'video') {
          return (
              <video controls className="max-w-full rounded-md border border-[#d4c5a9] max-h-[300px]">
                  <source src={msg.text} type="video/mp4" />
                  Your browser does not support video.
              </video>
          );
      }
      if (msg.type === 'audio') {
          return (
              <div className="flex items-center gap-2 min-w-[200px]">
                  <audio controls src={msg.text} className="h-8 w-full max-w-[220px]" />
              </div>
          );
      }
      // Fallback for old messages that might be images stored as text
      if (msg.text.startsWith('data:image')) {
        return <img src={msg.text} alt="Shared" className="max-w-full rounded-md border border-[#d4c5a9] max-h-[300px] object-cover" />;
      }

      return <div className="break-words whitespace-pre-wrap text-[15px] leading-relaxed">{msg.text}</div>;
  };

  return (
    <div className="flex flex-col h-full bg-[#f0eadd] relative w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-[64px] bg-[#f4f1ea] border-b border-[#d4c5a9] flex-shrink-0 relative z-20 shadow-sm">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-3 md:hidden text-[#6b5b48] hover:bg-[#e6e2d3] p-1 rounded-full">
             <X size={24}/>
          </button>
          
          <div className="w-10 h-10 rounded-full border border-[#bf9b30] overflow-hidden mr-3">
            <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="text-[#3e3226] text-base font-bold leading-none mb-1">{contact.name}</h2>
            <span className="text-[10px] text-[#6b5b48] uppercase tracking-wider truncate max-w-[150px]">
                {contact.about || 'Wanted Alive'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[#6b5b48]">
          <button className="p-2 hover:bg-[#e6e2d3] rounded-full transition-colors"><Search size={20} /></button>
          <button className="p-2 hover:bg-[#e6e2d3] rounded-full transition-colors"><MoreVertical size={20} /></button>
        </div>
      </div>

      {/* Message Area */}
      <div className="relative z-10 flex-1 overflow-y-auto p-4 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/dust.png')] flex flex-col">
        <div className="flex flex-col space-y-3 pb-2 min-h-0">
            
            {/* Encryption Notice */}
            <div className="flex justify-center my-4">
                <div className="bg-[#fdfbf7] border border-[#e6e2d3] text-[#8c7a6b] text-xs px-3 py-1.5 rounded-lg shadow-sm text-center max-w-[90%] select-none">
                    ⚓ Secure parley. Messages are encrypted.
                </div>
            </div>

            {messages.map((msg) => {
                const isMe = msg.isMe;
                return (
                    <div 
                        key={msg.id} 
                        className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                        <div 
                            className={`
                                relative max-w-[85%] md:max-w-[70%] px-3 py-2 shadow-sm text-[#3e3226]
                                ${isMe 
                                    ? 'bg-[#e1ffc7] rounded-l-lg rounded-br-lg rounded-tr-none' 
                                    : 'bg-white rounded-r-lg rounded-bl-lg rounded-tl-none'}
                            `}
                        >
                            <div className="mb-1">
                                {renderMessageContent(msg)}
                            </div>
                            <div className="flex items-center gap-1 justify-end mt-1 opacity-60 select-none">
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
            <div ref={messagesEndRef} className="h-1" />
        </div>
      </div>

      {/* Input Area */}
      <div className="relative z-10 px-4 py-2 bg-[#f4f1ea] border-t border-[#d4c5a9] flex items-end gap-2 flex-shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => handleFileChange(e, 'image')} 
            className="hidden" 
            accept="image/*"
        />
        <input 
            type="file" 
            ref={videoInputRef} 
            onChange={(e) => handleFileChange(e, 'video')} 
            className="hidden" 
            accept="video/*"
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
            <button 
                onClick={() => videoInputRef.current?.click()}
                className="text-[#8c7a6b] p-2 hover:text-[#6b5b48] rounded-full transition-colors"
                title="Send Video"
            >
                <Video size={24} />
            </button>
        </div>
        
        {/* Text Input */}
        <div className="flex-1 bg-white border border-[#fff] rounded-lg min-h-[42px] flex items-center px-4 py-2 my-1 focus-within:border-[#d4c5a9] focus-within:shadow-sm transition-all">
            <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isRecording ? "Recording audio..." : "Write message..."}
                disabled={isRecording}
                className="w-full bg-transparent border-none outline-none text-[#3e3226] placeholder-[#a09080] resize-none max-h-[100px] overflow-y-auto custom-scrollbar leading-[1.4]"
                rows={1}
                style={{ height: '24px' }}
            />
        </div>

        {/* Send / Mic Button */}
        {inputText.trim() ? (
             <button 
                onClick={() => handleSend()}
                className="p-3 mb-1 rounded-full transition-all shadow-sm bg-[#2c5f63] text-white hover:bg-[#1f4649]"
            >
                <Send size={18} fill="currentColor"/>
            </button>
        ) : (
            <button 
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                className={`p-3 mb-1 rounded-full transition-all shadow-sm ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-[#e6e2d3] text-[#8c7a6b] hover:bg-[#d4c5a9]'}`}
                title="Hold to Record"
            >
                {isRecording ? <StopCircle size={18} fill="currentColor"/> : <Mic size={18} />}
            </button>
        )}

        {/* Emoji Picker Popover */}
        {showEmoji && (
            <div className="absolute bottom-20 left-2 bg-[#fff] border border-[#d4c5a9] rounded-lg shadow-xl w-80 h-80 flex flex-col overflow-hidden animate-in slide-in-from-bottom-2 z-50">
                {/* Categories */}
                <div className="flex bg-[#f4f1ea] overflow-x-auto p-2 border-b border-[#e6e2d3] gap-2 scrollbar-hide">
                    {Object.keys(EMOJI_CATEGORIES).map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setActiveEmojiCat(cat)}
                            className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${activeEmojiCat === cat ? 'bg-[#2c5f63] text-white' : 'bg-[#e6e2d3] text-[#6b5b48]'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-2 grid grid-cols-6 gap-1 content-start custom-scrollbar">
                    {EMOJI_CATEGORIES[activeEmojiCat as keyof typeof EMOJI_CATEGORIES].map(e => (
                        <button 
                            key={e} 
                            onClick={() => addEmoji(e)}
                            className="text-2xl hover:bg-[#f4f1ea] p-1 rounded transition-colors"
                        >
                            {e}
                        </button>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
