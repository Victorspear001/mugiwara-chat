import React, { useState } from 'react';
import { loginOrRegister } from '../services/dbService';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !name) {
      setError("Please fill in all fields");
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await loginOrRegister(phone, name);
      onLoginSuccess();
    } catch (err) {
      setError("Connection failed. Check your database settings.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f0f2f5] p-4">
      {/* Header with Logo */}
      <div className="flex items-center gap-3 mb-8">
        <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/1024px-WhatsApp.svg.png" 
            alt="Logo" 
            className="w-10 h-10" 
        />
        <h1 className="text-[#41525d] text-2xl font-semibold uppercase tracking-wide">Mugiwara Chat</h1>
      </div>

      <div className="bg-white p-10 rounded-lg shadow-sm w-full max-w-md">
        <h2 className="text-[#111b21] text-2xl font-light mb-6 text-center">Login or Register</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-[#54656f] mb-1">Phone Number (ID)</label>
            <input 
              type="text" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 555-0100"
              className="w-full border-b-2 border-[#00a884] focus:outline-none py-2 text-[#111b21] text-lg bg-transparent placeholder-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm text-[#54656f] mb-1">Display Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Monkey D. Luffy"
              className="w-full border-b-2 border-[#e9edef] focus:border-[#00a884] transition-colors focus:outline-none py-2 text-[#111b21] text-lg bg-transparent"
            />
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#00a884] hover:bg-[#008f6f] text-white font-semibold py-2.5 rounded-sm transition-colors mt-4 disabled:opacity-70"
          >
            {isLoading ? 'Connecting...' : 'Start Chatting'}
          </button>
        </form>

        <p className="text-center text-xs text-[#8696a0] mt-8">
          No verification code required. Just enter your number to start.
        </p>
      </div>
      
      <div className="mt-8 flex flex-col items-center gap-2">
         <span className="text-[#8696a0] text-sm">from</span>
         <span className="text-[#54656f] font-bold text-xs tracking-widest">MUGIWARA INC</span>
      </div>
    </div>
  );
};