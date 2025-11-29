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

export const AppState = {
  IDLE: 'IDLE',
  TYPING: 'TYPING',
  GENERATING: 'GENERATING',
  PRINTING: 'PRINTING',
} as const;
export type AppState = (typeof AppState)[keyof typeof AppState];


export const DESK_WIDTH = 2000;
export const DESK_HEIGHT = 2000;