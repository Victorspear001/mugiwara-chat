import React, { useState } from 'react';
import { loginOrRegister } from '../services/dbService';
import { Skull, Anchor, Compass } from 'lucide-react';

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
      setError("Arrgh! Fill in yer details, matey!");
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await loginOrRegister(phone, name);
      onLoginSuccess();
    } catch (err) {
      setError("The seas are rough (Connection failed).");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-wood relative">
      <div className="absolute inset-0 bg-black/50 pointer-events-none"></div>

      {/* Wanted Poster Container */}
      <div className="relative z-10 w-full max-w-md bg-parchment p-8 shadow-2xl transform rotate-1 border-4 border-[#3e3226]">
        {/* Nails */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#1a1a1a] shadow-inner border border-gray-600"></div>

        <div className="flex flex-col items-center mb-6">
          <div className="text-[#3e3226] mb-2">
            <Skull size={48} />
          </div>
          <h1 className="pirate-font text-4xl font-black text-[#3e3226] tracking-widest text-center border-b-4 border-[#3e3226] pb-2 w-full">WANTED</h1>
          <p className="text-[#5c4d3c] text-sm font-bold mt-2 tracking-widest uppercase">For The Grand Fleet</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label className="block text-xs font-bold text-[#5c4d3c] uppercase tracking-wider mb-1">Den Den Mushi (ID)</label>
            <div className="flex items-center border-b-2 border-[#3e3226] py-1">
                <Compass className="text-[#3e3226] mr-2" size={20}/>
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 555-0100"
                  className="w-full bg-transparent focus:outline-none text-[#1a1a1a] text-lg font-serif placeholder-[#8c7a6b]"
                />
            </div>
          </div>

          <div className="relative">
            <label className="block text-xs font-bold text-[#5c4d3c] uppercase tracking-wider mb-1">Pirate Name</label>
            <div className="flex items-center border-b-2 border-[#3e3226] py-1">
                <Anchor className="text-[#3e3226] mr-2" size={20}/>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Captain Jack"
                  className="w-full bg-transparent focus:outline-none text-[#1a1a1a] text-lg font-serif placeholder-[#8c7a6b]"
                />
            </div>
          </div>

          {error && <div className="text-[#8a1c1c] font-bold text-center pirate-font">{error}</div>}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#8a1c1c] hover:bg-[#6b1616] text-[#d4c5a9] font-bold text-xl py-3 border-2 border-[#3e3226] shadow-[2px_2px_0px_0px_rgba(62,50,38,1)] active:shadow-none active:translate-y-[2px] transition-all flex items-center justify-center gap-2 pirate-font mt-4"
          >
            {isLoading ? 'Hoisting Sails...' : 'Board the Ship'}
          </button>
        </form>

        <div className="mt-8 text-center">
             <p className="text-[#5c4d3c] text-xs italic">By Order of the Pirate King</p>
        </div>
      </div>
    </div>
  );
};