import React, { useState } from 'react';
import { loginOrRegister } from '../services/dbService';
import { Anchor, Compass } from 'lucide-react';

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
      setError("Please fill in all details.");
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await loginOrRegister(phone, name);
      onLoginSuccess();
    } catch (err) {
      setError("Connection failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#dcd6bc] relative overflow-hidden">
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/dust.png')] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-sm bg-white p-8 shadow-xl rounded-lg border border-[#c0b399]">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#f4f1ea] rounded-full flex items-center justify-center mb-4 border border-[#d4c5a9]">
            <Anchor className="text-[#2c5f63]" size={32} />
          </div>
          <h1 className="pirate-font text-3xl font-bold text-[#3e3226] text-center">Crew Register</h1>
          <p className="text-[#8c7a6b] text-sm mt-1">Sign the manifest to join.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#6b5b48] uppercase tracking-wider mb-1.5">Den Den Mushi (Phone)</label>
            <div className="flex items-center bg-[#fdfbf7] border border-[#d4c5a9] rounded-md px-3 py-2 focus-within:border-[#2c5f63] focus-within:ring-1 focus-within:ring-[#2c5f63] transition-all">
                <Compass className="text-[#8c7a6b] mr-3" size={18}/>
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="555-0100"
                  className="w-full bg-transparent focus:outline-none text-[#3e3226] font-medium placeholder-[#c0b399]"
                />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#6b5b48] uppercase tracking-wider mb-1.5">Pirate Name</label>
            <div className="flex items-center bg-[#fdfbf7] border border-[#d4c5a9] rounded-md px-3 py-2 focus-within:border-[#2c5f63] focus-within:ring-1 focus-within:ring-[#2c5f63] transition-all">
                <span className="text-[#8c7a6b] mr-3 font-bold text-lg">@</span>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Captain Jack"
                  className="w-full bg-transparent focus:outline-none text-[#3e3226] font-medium placeholder-[#c0b399]"
                />
            </div>
          </div>

          {error && <div className="text-[#c0392b] text-sm font-medium text-center bg-[#fde8e8] py-2 rounded">{error}</div>}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#2c5f63] hover:bg-[#1f4649] text-white font-bold text-lg py-3 rounded-md shadow-md active:transform active:scale-[0.98] transition-all mt-4"
          >
            {isLoading ? 'Hoisting Sails...' : 'Board Ship'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-[#f0ece3] pt-4">
             <p className="text-[#a09080] text-xs">Mugiwara Chat &copy; {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
};