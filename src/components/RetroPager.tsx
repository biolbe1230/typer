import React from 'react';
import { Sparkles, Zap } from 'lucide-react';

interface RetroPagerProps {
  message: string;
  onAiEnhance: () => void;
  isThinking: boolean;
}

export const RetroPager: React.FC<RetroPagerProps> = ({ message, onAiEnhance, isThinking }) => {
  return (
    <div className="absolute bottom-8 right-8 w-64 h-40 bg-gray-900 rounded-xl p-4 shadow-2xl border-b-4 border-r-4 border-gray-800 transform rotate-[-5deg] transition-transform hover:rotate-0">
      {/* Casing Detail */}
      <div className="absolute top-0 left-4 w-12 h-1 bg-gray-700 rounded-b-md"></div>
      
      {/* Screen */}
      <div className="w-full h-20 bg-[#9ea78e] shadow-inner border-4 border-gray-700 rounded-md mb-3 relative overflow-hidden flex items-center justify-center px-2">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/pixel-weave.png')] opacity-30 pointer-events-none"></div>
        <p className={`font-digital text-3xl text-black tracking-widest uppercase truncate ${isThinking ? 'animate-pulse' : ''}`}>
          {message || "READY"}
        </p>
      </div>

      {/* Buttons */}
      <div className="flex justify-between items-center px-2">
        <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Motorola<br/>FIX-BEEPER</div>
        
        <button 
          onClick={onAiEnhance}
          disabled={isThinking}
          className={`
            group flex items-center justify-center w-12 h-8 rounded 
            ${isThinking ? 'bg-yellow-600' : 'bg-teal-700 hover:bg-teal-600'} 
            shadow-[0_2px_0_rgb(0,0,0)] active:shadow-none active:translate-y-[2px] transition-all
          `}
          title="Enhance with AI"
        >
           {isThinking ? <Zap size={16} className="text-white animate-spin" /> : <Sparkles size={16} className="text-white" />}
        </button>
      </div>
      
      {/* Clip */}
      <div className="absolute -right-2 top-10 w-2 h-16 bg-gray-800 rounded-r-md"></div>
    </div>
  );
};