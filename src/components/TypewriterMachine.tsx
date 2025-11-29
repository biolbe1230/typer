import React, { useState, useEffect, useRef } from 'react';
import { AppState } from '../types';

interface TypewriterMachineProps {
  inputText: string;
  setInputText: (text: string) => void;
  appState: AppState;
  onPrint: (paperHeight: number, startRect: DOMRect) => void;
  currentTypingChar: string | null;
}

export const TypewriterMachine: React.FC<TypewriterMachineProps> = ({ 
  inputText, 
  setInputText, 
  appState, 
  onPrint,
  currentTypingChar
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const [paperHeight, setPaperHeight] = useState(120); // Start short
  const [isFeeding, setIsFeeding] = useState(false);

  // Detect when paper is cleared (printed) to trigger feed animation
  useEffect(() => {
    if (inputText === '' && textareaRef.current) {
        // Reset height
        setPaperHeight(120);
        textareaRef.current.style.height = 'auto';
        
        // Trigger feed animation
        setIsFeeding(true);
        const timer = setTimeout(() => setIsFeeding(false), 600);
        return () => clearTimeout(timer);
    }
  }, [inputText]);

  // Auto-resize textarea and paper container
  useEffect(() => {
    if (textareaRef.current && inputText) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = scrollHeight + 'px';
      // Add some padding for the paper feel
      setPaperHeight(Math.max(120, scrollHeight + 60)); 
    }
  }, [inputText]);

  const handlePrintClick = () => {
    if (paperRef.current) {
      const rect = paperRef.current.getBoundingClientRect();
      onPrint(paperHeight, rect);
    }
  };

  const isInteractive = appState === AppState.IDLE || appState === AppState.TYPING;
  const isTypingEffect = !!currentTypingChar; 

  // Paper Transition Styles
  const getPaperStyle = () => {
    if (isFeeding) {
      return {
        animation: 'eject 0.6s reverse cubic-bezier(0.2, 0.8, 0.2, 1)',
        opacity: 1 // animating from bottom
      };
    }
    
    // Standard state
    return {
      transition: 'height 0.2s ease-out',
      opacity: 1
    };
  };

  return (
    <div className="relative flex flex-col items-center z-50">
      
      {/* The Paper Stack (Behind the Roller) */}
      <div 
        ref={paperRef}
        className="relative z-10 will-change-transform origin-bottom"
        style={{ 
            width: '340px',
            height: `${paperHeight}px`,
            marginBottom: '-20px', // Tuck into roller
            ...getPaperStyle()
        }}
      >
        <div className="bg-[#fdfbf7] w-full h-full shadow-md relative transition-all duration-100 overflow-hidden border-t border-x border-gray-200 rounded-t-sm">
            {/* Paper Texture */}
            <div className="absolute inset-0 pointer-events-none opacity-30"
                 style={{ backgroundImage: 'linear-gradient(to bottom, transparent 19px, #e2d9c8 20px)', backgroundSize: '100% 20px' }}>
            </div>

            <div className="p-6 pt-8 h-full relative">
                <textarea
                    ref={textareaRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type here..."
                    disabled={!isInteractive}
                    className="w-full bg-transparent resize-none outline-none font-typewriter text-lg text-gray-800 placeholder-gray-300 leading-relaxed overflow-hidden block"
                    style={{ minHeight: '40px' }}
                    autoFocus={isInteractive}
                />
            </div>
        </div>
      </div>

      {/* The Roller / Platen Assembly (Visual Only) */}
      <div className={`relative z-20 flex flex-col items-center transition-transform ${isTypingEffect ? 'animate-shake' : ''}`}>
          
          {/* The Black Roller */}
          <div className="w-[420px] h-16 bg-[#222] rounded-full shadow-[0_5px_15px_rgba(0,0,0,0.5)] relative flex items-center justify-center border-t border-gray-600 overflow-hidden">
              {/* Roller Texture/Rotation */}
              <div 
                className="absolute inset-0 flex flex-col gap-1 opacity-20 transition-transform"
                style={{
                    transform: isFeeding ? 'translateY(20px)' : 'translateY(0)',
                    transition: isFeeding ? 'transform 0.6s ease-out' : 'none',
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 5px, #fff 6px, transparent 7px)'
                }}
              ></div>
              
              {/* Roller Shine */}
              <div className="absolute top-2 left-0 right-0 h-3 bg-gradient-to-b from-gray-700 to-transparent opacity-50"></div>
              
              {/* Paper Guide Ruler */}
              <div className="w-[80%] h-full flex justify-between items-end pb-2 px-4 opacity-30">
                 {[...Array(15)].map((_, i) => (
                     <div key={i} className="w-[1px] h-3 bg-white"></div>
                 ))}
              </div>
          </div>

          {/* The Carriage Body / Color Housing */}
          <div className="w-[480px] h-24 -mt-8 bg-[#008080] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.4)] relative flex flex-col items-center justify-start pt-8 border-t-2 border-[#4db6ac]">
               
               {/* Decorative Stripes */}
               <div className="w-full h-2 bg-[#004d40] mb-1 opacity-50"></div>
               <div className="w-full h-1 bg-[#004d40] opacity-30"></div>

               {/* Brand Plate */}
               <div className="mt-2 bg-[#111] px-4 py-1 rounded-sm border border-yellow-600 shadow-sm">
                   <span className="text-[#d4af37] font-serif tracking-[0.2em] text-[10px] font-bold">MOTOROLA FIX-BEEPER</span>
               </div>

               {/* Knobs on sides */}
               <div className="absolute -left-6 top-4 w-10 h-10 rounded-full bg-[#1a1a1a] border-4 border-[#333] shadow-lg"></div>
               <div className="absolute -right-6 top-4 w-10 h-10 rounded-full bg-[#1a1a1a] border-4 border-[#333] shadow-lg"></div>

               {/* Return Lever (Left) */}
               <div 
                 className="absolute -left-12 top-[-20px] w-2 h-20 bg-gray-300 origin-bottom rounded-t-full shadow-md border-r border-gray-400 transition-transform duration-300 group-active:rotate-[-45deg]"
                 style={{ transform: isFeeding ? 'rotate(-45deg)' : 'rotate(-12deg)' }}
               >
                   <div className="absolute top-0 -left-4 w-8 h-4 bg-gray-300 rounded-full"></div>
               </div>
          </div>
      </div>

      {/* Floating Print Button */}
      <button
        onClick={handlePrintClick}
        disabled={!inputText.trim() || !isInteractive}
        className={`
            absolute right-8 top-24 z-30
            w-14 h-14 rounded-full bg-[#e53935] border-4 border-[#b71c1c] shadow-[0_4px_0_#7f0000]
            flex items-center justify-center group
            disabled:bg-gray-400 disabled:border-gray-600 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-[4px]
            hover:bg-[#f44336] active:translate-y-[4px] active:shadow-none transition-all
        `}
        title="Print Card"
      >
        <span className="font-bold text-white text-[10px] uppercase tracking-widest">PRINT</span>
      </button>

    </div>
  );
};