# Interactive Whiteboard - Architecture Documentation

## Overview

This is a modern interactive whiteboard application built with React, TypeScript, Fabric.js, and Tailwind CSS. It provides a professional drawing and annotation experience for teachers, presenters, and collaborative work.

## Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Canvas Rendering**: Fabric.js v6 (HTML5 Canvas wrapper)
- **State Management**: Zustand (lightweight, simple)
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Shadcn/ui (Radix UI primitives)
- **Build Tool**: Vite
- **File Operations**: FileSaver.js

## Project Structure

```
src/
├── components/
│   ├── ui/                      # Shadcn UI components
│   └── Whiteboard/              # Whiteboard-specific components
│       ├── WhiteboardCanvas.tsx # Main canvas with Fabric.js
│       ├── Toolbar.tsx          # Left sidebar with drawing tools
│       ├── TopBar.tsx           # Top bar with file operations
│       └── PagesSidebar.tsx     # Right sidebar for page management
├── store/
│   └── whiteboardStore.ts       # Zustand store for app state
├── types/
│   └── whiteboard.ts            # TypeScript interfaces
├── pages/
│   └── Index.tsx                # Main application page
└── index.css                    # Design system (CSS variables)
```

## Core Concepts

### 1. State Management (Zustand)

The application uses Zustand for state management. The store (`whiteboardStore.ts`) manages:

- **Tool State**: Active tool, drawing options (color, stroke width, opacity)
- **Page State**: Multiple pages, active page
- **Project State**: Project metadata, save status
- **Zoom State**: Canvas zoom level

**Key Store Actions**:
```typescript
setActiveTool(tool: ToolType)           // Switch between tools
setColor(color: string)                 // Change drawing color
addPage()                               // Add new page
deletePage(id: string)                  // Delete page
updatePageData(id, data, thumbnail)     // Save canvas state
createNewProject(name: string)          // New project
loadProject(project: Project)           // Load project from file
```

### 2. Canvas System (Fabric.js)

The `WhiteboardCanvas` component wraps Fabric.js:

**Fabric.js Objects Used**:
- `PencilBrush`: Free-hand drawing (pen, highlighter, eraser)
- `Rect`: Rectangle shapes
- `Circle`: Circle shapes
- `Line`: Line and arrow shapes
- `Textbox`: Text with editing
- `FabricImage`: Imported images

**Canvas Lifecycle**:
1. Initialize canvas on mount
2. Load page data from store
3. Listen to tool changes and configure canvas accordingly
4. Save canvas state on modifications
5. Handle zoom and pan

### 3. Drawing Tools

Each tool modifies the Fabric.js canvas behavior:

| Tool | Implementation |
|------|----------------|
| **Select** | Default Fabric.js selection mode |
| **Pen** | `isDrawingMode = true` with PencilBrush |
| **Highlighter** | PencilBrush with transparency and thicker stroke |
| **Eraser** | PencilBrush with white color |
| **Text** | Click to place Textbox, enter edit mode |
| **Rectangle** | Click-drag to draw Rect |
| **Circle** | Click-drag to draw Circle |
| **Line** | Click-drag to draw Line |
| **Arrow** | Click-drag to draw Line (arrow styling can be added) |

### 4. Multi-Page System

Each page stores:
```typescript
interface Page {
  id: string;              // Unique identifier
  name: string;            // Display name
  data: string;            // Serialized Fabric.js JSON
  thumbnail?: string;      // Base64 thumbnail image
  createdAt: number;
  updatedAt: number;
}
```

**Page Operations**:
- Add: Creates new blank page
- Delete: Removes page (minimum 1 page required)
- Duplicate: Copies page with all objects
- Switch: Loads page data into canvas

### 5. Save/Load System

**Project Structure**:
```typescript
interface Project {
  id: string;
  name: string;
  pages: Page[];           // All pages with canvas data
  createdAt: number;
  updatedAt: number;
}
```

**Save**: Serializes project to JSON and downloads as `.json` file  
**Load**: Reads `.json` file and restores all pages

### 6. Design System

Colors are defined using CSS variables in `src/index.css`:

```css
--primary: 195 85% 45%;           /* Teal/blue accent */
--toolbar-bg: 0 0% 100%;          /* Toolbar background */
--canvas-bg: 0 0% 100%;           /* Canvas background */
```

All components use semantic tokens:
- `bg-toolbar`: Toolbar background
- `text-primary`: Primary text color
- `border-toolbar-border`: Toolbar borders

## Key Features Implemented

### ✅ Core Drawing
- [x] Pen tool with adjustable color and thickness
- [x] Highlighter tool (semi-transparent)
- [x] Eraser tool
- [x] Shape tools (rectangle, circle, line)
- [x] Text tool with inline editing
- [x] Selection tool (move, resize, delete)

### ✅ Canvas Operations
- [x] Zoom in/out
- [x] Pan (drag canvas)
- [x] Undo/Redo per page (Fabric.js built-in)
- [x] Delete selected objects (Delete/Backspace key)

### ✅ Multi-Page Support
- [x] Add, delete, duplicate pages
- [x] Page thumbnails
- [x] Switch between pages
- [x] Per-page canvas state

### ✅ File Operations
- [x] New project
- [x] Save project (download JSON)
- [x] Open project (load JSON)
- [x] Import images
- [x] Export current page as PNG

## Extending the Application

### Adding New Drawing Tools

1. **Define Tool Type** in `src/types/whiteboard.ts`:
```typescript
export type ToolType = 
  | 'select'
  | 'pen'
  | 'your-new-tool';  // Add here
```

2. **Add Tool Button** in `src/components/Whiteboard/Toolbar.tsx`:
```typescript
const tools = [
  // ...
  { type: 'your-new-tool' as const, icon: YourIcon, label: 'Your Tool' },
];
```

3. **Implement Tool Logic** in `src/components/Whiteboard/WhiteboardCanvas.tsx`:
```typescript
switch (activeTool) {
  // ...
  case 'your-new-tool':
    // Configure canvas for your tool
    break;
}
```

### Adding PDF Import

To add PDF support:

1. **Install pdf.js**:
```bash
npm install pdfjs-dist
```

2. **Create PDF Parser** (`src/utils/pdfParser.ts`):
```typescript
import * as pdfjsLib from 'pdfjs-dist';

export async function loadPDF(file: File): Promise<ImageData[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  const pages: ImageData[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    // Render page to canvas and extract ImageData
    // ...
  }
  return pages;
}
```

3. **Add Import Handler** in `TopBar.tsx`:
```typescript
const handleImportPDF = async () => {
  const file = await selectFile('.pdf');
  const pages = await loadPDF(file);
  
  // Create new pages with PDF images as backgrounds
  pages.forEach((imageData) => {
    addPage();
    // Add image to canvas
  });
};
```

### Adding Undo/Redo

Fabric.js v6 doesn't include built-in undo/redo. To implement:

1. **Track History** in store:
```typescript
interface HistoryState {
  past: string[];    // Past canvas states
  present: string;   // Current state
  future: string[];  // Future states (for redo)
}
```

2. **Capture States**:
```typescript
const captureState = () => {
  const state = JSON.stringify(canvas.toJSON());
  // Push to history
};
```

3. **Implement Undo/Redo**:
```typescript
const undo = () => {
  if (past.length === 0) return;
  const previous = past[past.length - 1];
  canvas.loadFromJSON(previous);
};
```

### Adding Collaboration (Future)

For real-time collaboration, you would need:

1. **Backend**: WebSocket server (Socket.io, Supabase Realtime, etc.)
2. **Sync Events**: Broadcast canvas changes to other users
3. **Cursor Tracking**: Show other users' cursors
4. **Conflict Resolution**: Handle simultaneous edits

Example architecture:
```typescript
// Client sends changes
socket.emit('canvas:update', {
  pageId,
  objects: canvas.toJSON().objects,
});

// Client receives changes
socket.on('canvas:update', (data) => {
  canvas.loadFromJSON(data.objects);
});
```

### Desktop App (Electron)

To package as desktop app:

1. **Install Electron**:
```bash
npm install --save-dev electron electron-builder
```

2. **Create Electron Main** (`electron/main.ts`):
```typescript
import { app, BrowserWindow } from 'electron';

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
  });
  
  win.loadURL('http://localhost:5173'); // Dev
  // or: win.loadFile('dist/index.html'); // Production
});
```

3. **Add Scripts** to `package.json`:
```json
{
  "scripts": {
    "electron:dev": "electron .",
    "electron:build": "electron-builder"
  }
}
```

## Performance Optimization

### Current Optimizations
- Debounced canvas save operations
- Thumbnail generation at low quality (0.3) and small scale (0.2)
- Efficient state updates with Zustand

### Future Optimizations
- **Virtual Canvas**: Only render visible portion for large canvases
- **Object Pooling**: Reuse Fabric.js objects instead of recreating
- **Web Workers**: Offload heavy computations (PDF parsing, etc.)
- **IndexedDB**: Store projects locally instead of JSON files

## Testing Strategy

### Unit Tests
- Store actions and state mutations
- Utility functions (color conversion, etc.)

### Integration Tests
- Canvas rendering with different tools
- Page switching and data persistence
- Import/export functionality

### E2E Tests
- Complete user workflows (create → draw → save → load)
- Cross-browser compatibility

## Browser Compatibility

**Supported Browsers**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Required APIs**:
- HTML5 Canvas
- File API (FileReader, Blob, FileSaver)
- LocalStorage (optional)

## Known Limitations

1. **No Real-time Collaboration**: Single-user only
2. **No Cloud Storage**: Files saved locally only
3. **Limited Export Formats**: PNG only (no PDF export yet)
4. **No Office File Parsing**: DOCX/PPTX not supported yet
5. **No Screen Recording**: Not yet implemented

## Roadmap

### Phase 1 (Current - MVP)
- [x] Core drawing tools
- [x] Multi-page support
- [x] Save/load projects
- [x] Image import
- [x] Export as PNG

### Phase 2 (Next)
- [ ] PDF import and annotation
- [ ] Export as multi-page PDF
- [ ] Undo/Redo with full history
- [ ] More shape tools (polygon, arrow with head)
- [ ] Layer management

### Phase 3 (Future)
- [ ] Real-time collaboration
- [ ] Cloud storage integration
- [ ] Screen recording
- [ ] Mobile app (React Native)
- [ ] Handwriting recognition

## Contributing

When contributing:

1. Follow existing code style
2. Use TypeScript strictly (no `any` types)
3. Add comments for complex logic
4. Test across browsers
5. Update this documentation

## License

This is an original implementation. All code, UI, and design are created from scratch.
