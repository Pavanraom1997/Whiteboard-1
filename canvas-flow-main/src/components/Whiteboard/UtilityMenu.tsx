import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWhiteboardStore } from '@/store/whiteboardStore';
import { Project } from '@/types/whiteboard';
import {
  FileText,
  FolderOpen,
  Save,
  Download,
  Upload,
  Menu,
  FileDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { saveAs } from 'file-saver';
import { cn } from '@/lib/utils';

export const UtilityMenu = () => {
  const {
    project,
    pages,
    createNewProject,
    loadProject,
    markSaved,
  } = useWhiteboardStore();

  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  const [saveFormatDialogOpen, setSaveFormatDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNewProject = () => {
    if (!projectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }
    createNewProject(projectName);
    setNewProjectDialogOpen(false);
    setProjectName('');
    toast.success('New project created');
  };

  const handleSaveProjectJSON = () => {
    if (!project) {
      toast.error('No project to save');
      return;
    }

    const projectData: Project = {
      ...project,
      pages,
      updatedAt: Date.now(),
    };

    const blob = new Blob([JSON.stringify(projectData, null, 2)], {
      type: 'application/json',
    });
    saveAs(blob, `${project.name}.json`);
    markSaved();
    toast.success('Project saved as JSON');
    setSaveFormatDialogOpen(false);
  };

  const handleSaveAsPDF = () => {
    toast.info('PDF export coming soon - exporting as PNG for now');
    handleExportImage();
    setSaveFormatDialogOpen(false);
  };

  const handleLoadProject = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const projectData = JSON.parse(event.target?.result as string) as Project;
          loadProject(projectData);
          toast.success('Project loaded successfully');
        } catch (error) {
          toast.error('Failed to load project');
          console.error(error);
        }
      };
      reader.readAsText(file);
    };
    input.click();
    setMenuOpen(false);
  };

  const handleExportImage = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      toast.error('No canvas found');
      return;
    }

    canvas.toBlob((blob) => {
      if (blob) {
        saveAs(blob, `${project?.name || 'whiteboard'}-page.png`);
        toast.success('Page exported as PNG');
      }
    });
    setMenuOpen(false);
  };

  const handleImportImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf,.doc,.docx';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const fileType = file.type;

      if (fileType.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const event = new CustomEvent('import-image', {
              detail: { src: img.src },
            });
            window.dispatchEvent(event);
            toast.success('Image imported');
          };
          img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
      } else if (fileType === 'application/pdf') {
        toast.info('PDF import coming soon');
      } else if (
        fileType === 'application/msword' ||
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        toast.info('DOC/DOCX import coming soon');
      } else {
        toast.error('Unsupported file type');
      }
    };
    input.click();
    setMenuOpen(false);
  };

  return (
    <>
      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            className="glass-strong h-12 w-12 rounded-full shadow-lg"
            title="Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-56 p-2 glass-strong" 
          side="top"
          align="end"
        >
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              className="justify-start"
              onClick={() => {
                setNewProjectDialogOpen(true);
                setMenuOpen(false);
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              New Project
            </Button>
            <Button
              variant="ghost"
              className="justify-start"
              onClick={handleLoadProject}
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              Open Project
            </Button>
            <Button
              variant="ghost"
              className="justify-start"
              onClick={() => {
                setSaveFormatDialogOpen(true);
                setMenuOpen(false);
              }}
              disabled={!project}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Project
            </Button>
            <div className="h-px bg-border my-1" />
            <Button
              variant="ghost"
              className="justify-start"
              onClick={handleImportImage}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import File
            </Button>
            <Button
              variant="ghost"
              className="justify-start"
              onClick={handleExportImage}
            >
              <Download className="h-4 w-4 mr-2" />
              Export as PNG
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={newProjectDialogOpen} onOpenChange={setNewProjectDialogOpen}>
        <DialogContent className="glass-strong">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="My Whiteboard Project"
              className="mt-2"
              onKeyDown={(e) => e.key === 'Enter' && handleNewProject()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewProjectDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleNewProject}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={saveFormatDialogOpen} onOpenChange={setSaveFormatDialogOpen}>
        <DialogContent className="glass-strong">
          <DialogHeader>
            <DialogTitle>Save Project</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Choose the format to save your project:
            </p>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="justify-start h-auto py-3"
                onClick={handleSaveProjectJSON}
              >
                <FileDown className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">JSON Format</div>
                  <div className="text-xs text-muted-foreground">
                    Save as editable project file
                  </div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto py-3"
                onClick={handleSaveAsPDF}
              >
                <FileDown className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">PDF Format</div>
                  <div className="text-xs text-muted-foreground">
                    Export as PDF document (coming soon)
                  </div>
                </div>
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveFormatDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
