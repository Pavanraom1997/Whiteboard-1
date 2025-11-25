import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useWhiteboardStore } from '@/store/whiteboardStore';
import {
  MousePointer2,
  Pen,
  Highlighter,
  Eraser,
  Type,
  Square,
  Circle,
  Minus,
  MoveRight,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ColorPickerPopup } from './ColorPickerPopup';

const tools = [
  { type: 'select' as const, icon: MousePointer2, label: 'Select' },
  { type: 'pen' as const, icon: Pen, label: 'Pen' },
  { type: 'highlighter' as const, icon: Highlighter, label: 'Highlighter' },
  { type: 'eraser' as const, icon: Eraser, label: 'Eraser' },
  { type: 'text' as const, icon: Type, label: 'Text' },
  { type: 'rectangle' as const, icon: Square, label: 'Rectangle' },
  { type: 'circle' as const, icon: Circle, label: 'Circle' },
  { type: 'line' as const, icon: Minus, label: 'Line' },
  { type: 'arrow' as const, icon: MoveRight, label: 'Arrow' },
];

export const BottomToolbar = () => {
  const { activeTool, setActiveTool, drawingOptions, setStrokeWidth } =
    useWhiteboardStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [autoHideTimer, setAutoHideTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isExpanded && activeTool !== 'select') {
      // Auto-hide after 3 seconds of inactivity
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 3000);
      setAutoHideTimer(timer);

      return () => clearTimeout(timer);
    }
  }, [isExpanded, activeTool]);

  const handleMouseEnter = () => {
    if (autoHideTimer) {
      clearTimeout(autoHideTimer);
      setAutoHideTimer(null);
    }
  };

  const handleMouseLeave = () => {
    if (isExpanded && activeTool !== 'select') {
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 2000);
      setAutoHideTimer(timer);
    }
  };

  const handleToolSelect = (tool: typeof activeTool) => {
    setActiveTool(tool);
    if (tool === 'select') {
      setIsExpanded(false);
    }
  };

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-smooth"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Toggle Button */}
      {!isExpanded && (
        <Button
          size="icon"
          className="glass-strong h-12 w-12 rounded-full shadow-lg"
          onClick={() => setIsExpanded(true)}
          title="Show Tools"
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
      )}

      {/* Expanded Toolbar */}
      {isExpanded && (
        <div className="glass-strong rounded-2xl shadow-2xl p-3 flex items-center gap-3">
          {/* Collapse Button */}
          <Button
            size="icon"
            variant="ghost"
            className="h-10 w-10"
            onClick={() => setIsExpanded(false)}
            title="Hide Tools"
          >
            <ChevronDown className="h-5 w-5" />
          </Button>

          <div className="h-8 w-px bg-border" />

          {/* Tools */}
          <div className="flex gap-2">
            {tools.map((tool) => (
              <Button
                key={tool.type}
                variant="ghost"
                size="icon"
                onClick={() => handleToolSelect(tool.type)}
                className={cn(
                  'h-10 w-10 transition-smooth',
                  activeTool === tool.type &&
                    'bg-primary text-primary-foreground hover:bg-primary/90'
                )}
                title={tool.label}
              >
                <tool.icon className="h-5 w-5" />
              </Button>
            ))}
          </div>

          <div className="h-8 w-px bg-border" />

          {/* Color Picker */}
          <ColorPickerPopup />

          <div className="h-8 w-px bg-border" />

          {/* Stroke Width */}
          <div className="flex items-center gap-3 px-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              Width: {drawingOptions.strokeWidth}px
            </span>
            <Slider
              value={[drawingOptions.strokeWidth]}
              onValueChange={([value]) => setStrokeWidth(value)}
              min={1}
              max={20}
              step={1}
              className="w-32"
            />
          </div>
        </div>
      )}
    </div>
  );
};
