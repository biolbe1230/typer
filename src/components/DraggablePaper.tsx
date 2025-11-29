import React, { useState, useEffect } from 'react';
import type { PaperNote } from "../types"
import { Trash2 } from 'lucide-react';

interface DraggablePaperProps {
  note: PaperNote;
  onUpdate: (id: string, updates: Partial<PaperNote>) => void;
  onDelete: (id: string) => void;
  onFocus: (id: string) => void;
}

export const DraggablePaper: React.FC<DraggablePaperProps> = ({ note, onUpdate, onDelete, onFocus }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [animationFinished, setAnimationFinished] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFocus(note.id);

    // Randomize rotation slightly on click/start drag
    // Range: -3 to 3 degrees
    const randomTilt = (Math.random() * 6) - 3;
    onUpdate(note.id, { rotation: randomTilt });

    setIsDragging(true);
    setOffset({
      x: e.clientX - note.x,
      y: e.clientY - note.y
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newX = e.clientX - offset.x;
      const newY = e.clientY - offset.y;
      
      onUpdate(note.id, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, offset, note.id, onUpdate]);

  // Only apply animation if it's a new print and animation hasn't finished yet
  const shouldAnimate = note.isJustPrinted && !animationFinished;

  return (
    <div
      className={`absolute p-6 bg-[#fdfbf7] shadow-[2px_2px_15px_rgba(0,0,0,0.2)] cursor-grab active:cursor-grabbing border border-[#e2d9c8] transition-shadow hover:shadow-xl pointer-events-auto group ${shouldAnimate ? 'animate-eject' : ''}`}
      style={{
        left: note.x,
        top: note.y,
        // If animating, let CSS handle transform. If not, use inline style for rotation/drag.
        transform: isDragging ? `rotate(${note.rotation}deg) scale(1.02)` : `rotate(${note.rotation}deg)`,
        transition: isDragging ? 'none' : 'transform 0.2s ease-out', // Smooth rotation reset
        width: '306px', // Exact match for 340px * 0.9 scale
        minHeight: '80px', 
        height: 'auto',
        zIndex: note.zIndex,
        backgroundImage: 'linear-gradient(to bottom, transparent 19px, #e2d9c8 20px)',
        backgroundSize: '100% 20px',
        lineHeight: '20px',
        // Scale font slightly to match the 0.9 scale of the typewriter
        fontSize: '16.2px' 
      }}
      onMouseDown={handleMouseDown}
      onAnimationEnd={() => setAnimationFinished(true)}
    >
      {/* Texture overlay */}
      <div className="absolute inset-0 pointer-events-none bg-yellow-50 opacity-10 mix-blend-multiply"></div>
      
      {/* Pin/Hole visual */}
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-800 rounded-full opacity-10 blur-[1px]"></div>
      
      {/* Main Content */}
      <div className="font-typewriter text-gray-800 relative z-10 whitespace-pre-wrap break-words pb-4">
        {note.text}
      </div>
      
      {/* Footer Area */}
      <div className="mt-2 flex justify-between items-end relative z-20">
        {/* Timestamp moved to bottom left */}
        <span className="text-[10px] font-typewriter text-gray-400 select-none">
          {new Date(note.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </span>

        {/* Delete button moved to bottom right */}
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
          className="text-gray-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-red-50 rounded"
          title="Delete Note"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};