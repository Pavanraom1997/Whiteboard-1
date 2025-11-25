import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

const colors = [
  '#000000',
  '#EF4444',
  '#F59E0B',
  '#10B981',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
];

export const Toolbar = () => {
  const { activeTool, setActiveTool, drawingOptions, setColor, setStrokeWidth } =
    useWhiteboardStore();

  return (
    <div className="w-20 bg-toolbar border-r border-toolbar-border flex flex-col items-center py-4 gap-4">
      {/* Tools */}
      <div className="flex flex-col gap-2">
        {tools.map((tool, index) => (
          <div key={tool.type}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveTool(tool.type)}
              className={cn(
                'relative transition-smooth',
                activeTool === tool.type && 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
              title={tool.label}
            >
              <tool.icon className="h-5 w-5" />
            </Button>
            {(index === 0 || index === 4 || index === 7) && (
              <Separator className="my-2" />
            )}
          </div>
        ))}
      </div>

      <Separator />

      {/* Color Picker */}
      <div className="flex flex-col gap-2 px-2">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => setColor(color)}
            className={cn(
              'w-8 h-8 rounded-full border-2 transition-smooth',
              drawingOptions.color === color
                ? 'border-primary scale-110'
                : 'border-border hover:scale-105'
            )}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>

      <Separator />

      {/* Stroke Width */}
      <div className="flex flex-col gap-2 px-2 w-full">
        <div className="text-xs text-muted-foreground text-center">
          {drawingOptions.strokeWidth}px
        </div>
        <Slider
          value={[drawingOptions.strokeWidth]}
          onValueChange={([value]) => setStrokeWidth(value)}
          min={1}
          max={20}
          step={1}
          className="w-full"
          orientation="vertical"
        />
      </div>
    </div>
  );
};
