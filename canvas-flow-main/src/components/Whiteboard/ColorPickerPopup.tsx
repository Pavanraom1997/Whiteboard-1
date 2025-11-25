import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useWhiteboardStore } from '@/store/whiteboardStore';
import { Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

const colors = [
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#FFFFFF' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Orange', value: '#F59E0B' },
  { name: 'Yellow', value: '#FCD34D' },
  { name: 'Green', value: '#10B981' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Teal', value: '#14B8A6' },
];

export const ColorPickerPopup = () => {
  const { drawingOptions, setColor } = useWhiteboardStore();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative glass-strong"
          title="Color"
        >
          <Palette className="h-5 w-5" />
          <div
            className="absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-background"
            style={{ backgroundColor: drawingOptions.color }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-3 glass-strong" 
        side="top"
        align="center"
      >
        <div className="grid grid-cols-4 gap-2">
          {colors.map((color) => (
            <button
              key={color.value}
              onClick={() => setColor(color.value)}
              className={cn(
                'w-10 h-10 rounded-lg border-2 transition-smooth hover:scale-110',
                drawingOptions.color === color.value
                  ? 'border-primary scale-110 shadow-lg'
                  : 'border-border hover:border-primary/50'
              )}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
