export type ToolType = 
  | 'select'
  | 'pen'
  | 'highlighter'
  | 'eraser'
  | 'text'
  | 'rectangle'
  | 'circle'
  | 'line'
  | 'arrow';

export interface DrawingOptions {
  color: string;
  strokeWidth: number;
  opacity: number;
}

export interface Page {
  id: string;
  name: string;
  data: string; // Serialized Fabric.js canvas JSON
  thumbnail?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Project {
  id: string;
  name: string;
  pages: Page[];
  createdAt: number;
  updatedAt: number;
}

export interface HistoryState {
  canUndo: boolean;
  canRedo: boolean;
}
