export interface PaperNote {
  id: string;
  text: string;
  x: number;
  y: number;
  rotation: number;
  timestamp: number;
  zIndex: number;
  isJustPrinted?: boolean;
}

export interface Position {
  x: number;
  y: number;
}

export enum AppState {
  IDLE = 'IDLE',
  TYPING = 'TYPING', // User is typing input
  GENERATING = 'GENERATING', // AI is thinking
  PRINTING = 'PRINTING', // Animation of printing
}

export const DESK_WIDTH = 2000;
export const DESK_HEIGHT = 2000;