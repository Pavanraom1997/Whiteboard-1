import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWhiteboardStore } from '@/store/whiteboardStore';
import { Plus, Copy, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export const PagesSidebar = () => {
  const {
    pages,
    activePageId,
    addPage,
    deletePage,
    duplicatePage,
    setActivePage,
  } = useWhiteboardStore();

  const handleDeletePage = (pageId: string) => {
    if (pages.length <= 1) {
      toast.error('Cannot delete the last page');
      return;
    }
    deletePage(pageId);
    toast.success('Page deleted');
  };

  const handleDuplicatePage = (pageId: string) => {
    duplicatePage(pageId);
    toast.success('Page duplicated');
  };

  return (
    <div className="w-40 glass-strong border-r border-toolbar-border flex flex-col">
      <div className="p-3 border-b border-toolbar-border flex items-center justify-between">
        <h2 className="text-sm font-semibold">Pages</h2>
        <Button size="icon" className="h-7 w-7" onClick={addPage} title="Add Page">
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {pages.map((page, index) => (
            <div
              key={page.id}
              className={cn(
                'group relative rounded-md border-2 transition-smooth cursor-pointer overflow-hidden',
                activePageId === page.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              )}
              onClick={() => setActivePage(page.id)}
            >
              {/* Thumbnail */}
              <div className="aspect-[4/3] bg-canvas-bg flex items-center justify-center">
                {page.thumbnail ? (
                  <img
                    src={page.thumbnail}
                    alt={page.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-3xl text-muted-foreground font-light">
                    {index + 1}
                  </span>
                )}
              </div>

              {/* Page Info */}
              <div className="p-1.5 bg-background/95">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium truncate">{page.name}</span>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-smooth">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-5 w-5"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicatePage(page.id);
                      }}
                      title="Duplicate Page"
                    >
                      <Copy className="h-2.5 w-2.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-5 w-5 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePage(page.id);
                      }}
                      title="Delete Page"
                      disabled={pages.length <= 1}
                    >
                      <Trash2 className="h-2.5 w-2.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
