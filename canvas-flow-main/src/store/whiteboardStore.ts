import { create } from 'zustand';
import { ToolType, DrawingOptions, Page, Project } from '@/types/whiteboard';

interface WhiteboardState {
  // Tool state
  activeTool: ToolType;
  drawingOptions: DrawingOptions;
  
  // Page state
  pages: Page[];
  activePageId: string;
  
  // Project state
  project: Project | null;
  hasUnsavedChanges: boolean;
  
  // Zoom state
  zoom: number;
  
  // Actions
  setActiveTool: (tool: ToolType) => void;
  setDrawingOptions: (options: Partial<DrawingOptions>) => void;
  setColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  
  addPage: () => void;
  deletePage: (pageId: string) => void;
  duplicatePage: (pageId: string) => void;
  setActivePage: (pageId: string) => void;
  updatePageData: (pageId: string, data: string, thumbnail?: string) => void;
  renamePage: (pageId: string, name: string) => void;
  
  createNewProject: (name: string) => void;
  loadProject: (project: Project) => void;
  setProjectName: (name: string) => void;
  markSaved: () => void;
  markUnsaved: () => void;
  
  setZoom: (zoom: number) => void;
}

const createNewPage = (index: number): Page => ({
  id: `page-${Date.now()}-${Math.random()}`,
  name: `Page ${index}`,
  data: JSON.stringify({ version: '6.0.0', objects: [] }),
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

export const useWhiteboardStore = create<WhiteboardState>((set, get) => ({
  // Initial state
  activeTool: 'pen',
  drawingOptions: {
    color: '#000000',
    strokeWidth: 2,
    opacity: 1,
  },
  
  pages: [createNewPage(1)],
  activePageId: '',
  
  project: null,
  hasUnsavedChanges: false,
  
  zoom: 1,
  
  // Actions
  setActiveTool: (tool) => set({ activeTool: tool }),
  
  setDrawingOptions: (options) =>
    set((state) => ({
      drawingOptions: { ...state.drawingOptions, ...options },
    })),
  
  setColor: (color) =>
    set((state) => ({
      drawingOptions: { ...state.drawingOptions, color },
    })),
  
  setStrokeWidth: (width) =>
    set((state) => ({
      drawingOptions: { ...state.drawingOptions, strokeWidth: width },
    })),
  
  addPage: () =>
    set((state) => {
      const newPage = createNewPage(state.pages.length + 1);
      return {
        pages: [...state.pages, newPage],
        activePageId: newPage.id,
        hasUnsavedChanges: true,
      };
    }),
  
  deletePage: (pageId) =>
    set((state) => {
      if (state.pages.length <= 1) return state;
      
      const pages = state.pages.filter((p) => p.id !== pageId);
      const activePageId =
        state.activePageId === pageId ? pages[0].id : state.activePageId;
      
      return { pages, activePageId, hasUnsavedChanges: true };
    }),
  
  duplicatePage: (pageId) =>
    set((state) => {
      const page = state.pages.find((p) => p.id === pageId);
      if (!page) return state;
      
      const newPage: Page = {
        ...page,
        id: `page-${Date.now()}-${Math.random()}`,
        name: `${page.name} (Copy)`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      const index = state.pages.findIndex((p) => p.id === pageId);
      const pages = [
        ...state.pages.slice(0, index + 1),
        newPage,
        ...state.pages.slice(index + 1),
      ];
      
      return { pages, hasUnsavedChanges: true };
    }),
  
  setActivePage: (pageId) => set({ activePageId: pageId }),
  
  updatePageData: (pageId, data, thumbnail) =>
    set((state) => ({
      pages: state.pages.map((p) =>
        p.id === pageId
          ? { ...p, data, thumbnail, updatedAt: Date.now() }
          : p
      ),
      hasUnsavedChanges: true,
    })),
  
  renamePage: (pageId, name) =>
    set((state) => ({
      pages: state.pages.map((p) =>
        p.id === pageId ? { ...p, name, updatedAt: Date.now() } : p
      ),
      hasUnsavedChanges: true,
    })),
  
  createNewProject: (name) => {
    const firstPage = createNewPage(1);
    const project: Project = {
      id: `project-${Date.now()}`,
      name,
      pages: [firstPage],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    set({
      project,
      pages: [firstPage],
      activePageId: firstPage.id,
      hasUnsavedChanges: false,
    });
  },
  
  loadProject: (project) =>
    set({
      project,
      pages: project.pages,
      activePageId: project.pages[0]?.id || '',
      hasUnsavedChanges: false,
    }),
  
  setProjectName: (name) =>
    set((state) => ({
      project: state.project ? { ...state.project, name } : null,
      hasUnsavedChanges: true,
    })),
  
  markSaved: () => set({ hasUnsavedChanges: false }),
  markUnsaved: () => set({ hasUnsavedChanges: true }),
  
  setZoom: (zoom) => set({ zoom }),
}));

// Initialize with first page
const store = useWhiteboardStore.getState();
if (store.pages.length > 0 && !store.activePageId) {
  store.setActivePage(store.pages[0].id);
}
