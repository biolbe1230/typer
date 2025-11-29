import React, { useState, useEffect, useCallback } from 'react';
import type { PaperNote } from './types';
import { AppState } from './types';
import { TypewriterMachine } from './components/TypewriterMachine';
import { DraggablePaper } from './components/DraggablePaper';
import { RetroPager } from './components/RetroPager';
import { enhanceText } from './services/geminiService';
import { Info } from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [inputText, setInputText] = useState("");
  const [papers, setPapers] = useState<PaperNote[]>([]);
  const [pagerMessage, setPagerMessage] = useState("READY");
  const [currentTypingChar, setCurrentTypingChar] = useState<string | null>(null);
  const [maxZIndex, setMaxZIndex] = useState(10);

  // Initialize with one welcome note
  useEffect(() => {
    const welcomeNote: PaperNote = {
      id: 'welcome',
      text: "Welcome to the Fix Beeper.\n\nType below. The paper grows as you write.\n\nHit the red button to PRINT your card.",
      x: window.innerWidth / 2 - 153, // Centered (306/2)
      y: window.innerHeight / 2 - 200,
      rotation: -2,
      timestamp: Date.now(),
      zIndex: 1
    };
    setPapers([welcomeNote]);
  }, []);

  const handlePrint = useCallback((paperHeight: number, startRect: DOMRect) => {
    if (!inputText.trim()) return;
    
    // Animation & Spawn Logic:
    // 1. The paper in the typewriter is visually at `startRect.top`.
    // 2. We want the new "Drag Note" to pop out from the roller to a position slightly above.
    // 3. EJECTION_DISTANCE determines how far up it pops relative to the typewriter top.
    // 4. We assume the roller is near the bottom of the visible paper in the machine.
    
    const EJECTION_DISTANCE = 120; 
    
    // This is the final resting Y coordinate for the draggable paper
    const spawnY = startRect.top - EJECTION_DISTANCE; 
    const spawnX = startRect.left;

    const newNote: PaperNote = {
        id: crypto.randomUUID(),
        text: inputText,
        x: spawnX,
        y: spawnY,
        rotation: (Math.random() * 4) - 2, // Subtle initial rotation
        timestamp: Date.now(),
        zIndex: maxZIndex + 1,
        isJustPrinted: true // Triggers the 'eject' CSS animation
    };
    
    setMaxZIndex(prev => prev + 1);
    setPapers(prev => [...prev, newNote]);
    
    // Instant Reset
    setInputText("");
    setAppState(AppState.IDLE);
    setPagerMessage("PRINTED");
    
    setTimeout(() => setPagerMessage("READY"), 1000);

  }, [inputText, maxZIndex]);

  // Pass typing char to typewriter to trigger shake
  const handleInputChange = (text: string) => {
      setInputText(text);
      if (text.length > inputText.length) {
          // Added a char
          const char = text.slice(-1);
          setCurrentTypingChar(char);
          // Clear char after short delay to stop shake
          setTimeout(() => setCurrentTypingChar(null), 100);
      }
  };

  const handleAiEnhance = async () => {
    if (!inputText.trim() || appState !== AppState.IDLE) return;
    
    setAppState(AppState.GENERATING);
    setPagerMessage("UPLINK...");
    
    const enhanced = await enhanceText(inputText);
    
    setInputText(enhanced);
    setPagerMessage("RECEIVED");
    setAppState(AppState.IDLE);
    
    setTimeout(() => setPagerMessage("READY"), 2000);
  };

  const updatePaper = (id: string, updates: Partial<PaperNote>) => {
    setPapers(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deletePaper = (id: string) => {
    setPapers(prev => prev.filter(p => p.id !== id));
  };

  const bringToFront = (id: string) => {
      setMaxZIndex(prev => prev + 1);
      setPapers(prev => prev.map(p => p.id === id ? { ...p, zIndex: maxZIndex + 1 } : p));
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#333] text-slate-200 selection:bg-yellow-200 selection:text-black">
      
      {/* Desk Surface Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-40"
           style={{
               backgroundImage: `radial-gradient(#444 1px, transparent 1px)`,
               backgroundSize: '20px 20px'
           }}>
      </div>
      
      {/* Desk Mat (Larger area) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] h-[90vh] bg-[#262626] rounded-[50px] shadow-2xl border border-gray-700/50"></div>

      {/* Scattered Papers Layer - zIndex must be below typewriter for "behind" ejection feel, 
          but we want the ejected paper to eventually be on top. 
          Solution: DraggablePaper handles zIndex. New notes get High Z. 
          We place this layer visibly. 
      */}
      <div className="absolute inset-0 z-30 pointer-events-none">
          <div className="w-full h-full relative">
            {papers.map(paper => (
                <DraggablePaper 
                    key={paper.id} 
                    note={paper} 
                    onUpdate={updatePaper} 
                    onDelete={deletePaper}
                    onFocus={bringToFront}
                />
            ))}
          </div>
      </div>

      {/* Main Typewriter - Anchored to Bottom Center */}
      {/* Raised from bottom-[-20px] to bottom-[20px] to show nameplate */}
      <div className="absolute bottom-[20px] left-0 right-0 flex justify-center z-40 pointer-events-none">
         <div className="pointer-events-auto transform scale-90 origin-bottom"> 
             <TypewriterMachine 
                inputText={inputText}
                setInputText={handleInputChange}
                appState={appState}
                onPrint={handlePrint}
                currentTypingChar={currentTypingChar}
             />
         </div>
      </div>

      {/* Pager Interface */}
      <div className="absolute z-50 bottom-8 right-8 pointer-events-none">
         <div className="pointer-events-auto">
            <RetroPager 
                message={pagerMessage} 
                onAiEnhance={handleAiEnhance} 
                isThinking={appState === AppState.GENERATING}
            />
         </div>
      </div>

      {/* Overlay Info */}
      <div className="absolute top-6 left-8 z-50 opacity-50 hover:opacity-100 transition-opacity pointer-events-auto">
         <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
            <Info size={14} />
            <span>Fix Beeper v1.0 // Type & Print // Drag cards</span>
         </div>
      </div>

    </div>
  );
}