import { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, PencilBrush, Circle, Rect, Line, Textbox, FabricObject, FabricImage } from 'fabric';
import { useWhiteboardStore } from '@/store/whiteboardStore';
import { toast } from 'sonner';

export const WhiteboardCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const [isReady, setIsReady] = useState(false);

  const {
    activeTool,
    drawingOptions,
    activePageId,
    pages,
    updatePageData,
    zoom,
  } = useWhiteboardStore();

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: window.innerWidth - 160, // Account for left pages sidebar (140px)
      height: window.innerHeight,
      backgroundColor: '#ffffff',
    });

    fabricCanvasRef.current = canvas;
    setIsReady(true);

    // Handle window resize
    const handleResize = () => {
      canvas.setDimensions({
        width: window.innerWidth - 160,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
    };
  }, []);

  // Load page data
  useEffect(() => {
    if (!fabricCanvasRef.current || !activePageId || !isReady) return;

    const page = pages.find((p) => p.id === activePageId);
    if (!page) return;

    const canvas = fabricCanvasRef.current;

    try {
      canvas.loadFromJSON(page.data, () => {
        canvas.renderAll();
      });
    } catch (error) {
      console.error('Error loading page data:', error);
    }
  }, [activePageId, pages, isReady]);

  // Save page data on changes
  useEffect(() => {
    if (!fabricCanvasRef.current || !activePageId || !isReady) return;

    const canvas = fabricCanvasRef.current;

    const handleModified = () => {
      const data = JSON.stringify(canvas.toJSON());
      const thumbnail = canvas.toDataURL({ format: 'png', quality: 0.3, multiplier: 0.2 });
      updatePageData(activePageId, data, thumbnail);
    };

    canvas.on('object:modified', handleModified);
    canvas.on('object:added', handleModified);
    canvas.on('object:removed', handleModified);

    return () => {
      canvas.off('object:modified', handleModified);
      canvas.off('object:added', handleModified);
      canvas.off('object:removed', handleModified);
    };
  }, [activePageId, updatePageData, isReady]);

  // Handle tool changes
  useEffect(() => {
    if (!fabricCanvasRef.current || !isReady) return;

    const canvas = fabricCanvasRef.current;

    // Reset selection mode
    canvas.isDrawingMode = false;
    canvas.selection = true;
    canvas.forEachObject((obj) => {
      obj.selectable = true;
      obj.evented = true;
    });

    switch (activeTool) {
      case 'pen':
      case 'highlighter':
        canvas.isDrawingMode = true;
        const brush = new PencilBrush(canvas);
        brush.color = drawingOptions.color;
        brush.width = drawingOptions.strokeWidth;
        
        if (activeTool === 'highlighter') {
          brush.color = drawingOptions.color + '80'; // Add transparency
          brush.width = drawingOptions.strokeWidth * 3;
        }
        
        canvas.freeDrawingBrush = brush;
        break;

      case 'eraser':
        canvas.isDrawingMode = true;
        const eraserBrush = new PencilBrush(canvas);
        eraserBrush.color = '#ffffff';
        eraserBrush.width = drawingOptions.strokeWidth * 2;
        canvas.freeDrawingBrush = eraserBrush;
        break;

      case 'select':
        // Default selection mode
        break;

      case 'text':
        canvas.selection = false;
        const handleTextClick = (e: any) => {
          if (e.target) return;
          
          const pointer = canvas.getPointer(e.e);
          const text = new Textbox('Double-click to edit', {
            left: pointer.x,
            top: pointer.y,
            fill: drawingOptions.color,
            fontSize: 20,
            width: 200,
          });
          
          canvas.add(text);
          canvas.setActiveObject(text);
          text.enterEditing();
          canvas.off('mouse:down', handleTextClick);
        };
        
        canvas.on('mouse:down', handleTextClick);
        break;

      case 'rectangle':
      case 'circle':
      case 'line':
      case 'arrow':
        canvas.selection = false;
        let isDrawing = false;
        let shape: FabricObject | null = null;
        let startX = 0;
        let startY = 0;

        const handleShapeDown = (e: any) => {
          if (e.target) return;
          
          isDrawing = true;
          const pointer = canvas.getPointer(e.e);
          startX = pointer.x;
          startY = pointer.y;

          if (activeTool === 'rectangle') {
            shape = new Rect({
              left: startX,
              top: startY,
              width: 0,
              height: 0,
              fill: 'transparent',
              stroke: drawingOptions.color,
              strokeWidth: drawingOptions.strokeWidth,
            });
          } else if (activeTool === 'circle') {
            shape = new Circle({
              left: startX,
              top: startY,
              radius: 0,
              fill: 'transparent',
              stroke: drawingOptions.color,
              strokeWidth: drawingOptions.strokeWidth,
            });
          } else if (activeTool === 'line' || activeTool === 'arrow') {
            shape = new Line([startX, startY, startX, startY], {
              stroke: drawingOptions.color,
              strokeWidth: drawingOptions.strokeWidth,
            });
          }

          if (shape) {
            canvas.add(shape);
          }
        };

        const handleShapeMove = (e: any) => {
          if (!isDrawing || !shape) return;

          const pointer = canvas.getPointer(e.e);

          if (activeTool === 'rectangle') {
            const rect = shape as Rect;
            rect.set({
              width: Math.abs(pointer.x - startX),
              height: Math.abs(pointer.y - startY),
              left: Math.min(pointer.x, startX),
              top: Math.min(pointer.y, startY),
            });
          } else if (activeTool === 'circle') {
            const circle = shape as Circle;
            const radius = Math.sqrt(
              Math.pow(pointer.x - startX, 2) + Math.pow(pointer.y - startY, 2)
            );
            circle.set({ radius });
          } else if (activeTool === 'line' || activeTool === 'arrow') {
            const line = shape as Line;
            line.set({ x2: pointer.x, y2: pointer.y });
          }

          canvas.renderAll();
        };

        const handleShapeUp = () => {
          isDrawing = false;
          shape = null;
          canvas.off('mouse:down', handleShapeDown);
          canvas.off('mouse:move', handleShapeMove);
          canvas.off('mouse:up', handleShapeUp);
        };

        canvas.on('mouse:down', handleShapeDown);
        canvas.on('mouse:move', handleShapeMove);
        canvas.on('mouse:up', handleShapeUp);
        break;
    }
  }, [activeTool, drawingOptions, isReady]);

  // Handle zoom
  useEffect(() => {
    if (!fabricCanvasRef.current || !isReady) return;

    const canvas = fabricCanvasRef.current;
    canvas.setZoom(zoom);
    canvas.renderAll();
  }, [zoom, isReady]);

  // Handle delete key
  useEffect(() => {
    if (!fabricCanvasRef.current || !isReady) return;

    const canvas = fabricCanvasRef.current;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && canvas.getActiveObject()) {
        canvas.remove(...canvas.getActiveObjects());
        canvas.discardActiveObject();
        canvas.renderAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isReady]);

  // Handle image import
  useEffect(() => {
    if (!fabricCanvasRef.current || !isReady) return;

    const canvas = fabricCanvasRef.current;

    const handleImageImport = async (e: any) => {
      const { src } = e.detail;
      
      try {
        const image = await FabricImage.fromURL(src, {
          crossOrigin: 'anonymous',
        });
        
        image.set({
          left: 100,
          top: 100,
          scaleX: Math.min(1, 500 / (image.width || 1)),
          scaleY: Math.min(1, 500 / (image.height || 1)),
        });
        
        canvas.add(image);
        canvas.setActiveObject(image);
        canvas.renderAll();
      } catch (error) {
        console.error('Error importing image:', error);
        toast.error('Failed to import image');
      }
    };

    window.addEventListener('import-image', handleImageImport);

    return () => {
      window.removeEventListener('import-image', handleImageImport);
    };
  }, [isReady]);

  return (
    <div className="flex-1 bg-canvas-bg overflow-hidden relative">
      <canvas ref={canvasRef} />
      
      {/* Zoom indicator - Top Right */}
      <div className="absolute top-6 right-6 glass-strong px-3 py-1.5 rounded-lg">
        <span className="text-xs text-muted-foreground">
          {Math.round(zoom * 100)}%
        </span>
      </div>
    </div>
  );
};
