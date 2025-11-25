import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { toast } from 'sonner';
import { saveAs } from 'file-saver';

export const TopBar = () => {
  const {
    project,
    pages,
    createNewProject,
    loadProject,
    markSaved,
    hasUnsavedChanges,
    zoom,
    setZoom,
  } = useWhiteboardStore();

  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState('');

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

  const handleSaveProject = () => {
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
    toast.success('Project saved successfully');
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
  };

  const handleExportImage = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      toast.error('No canvas found');
      return;
    }

    canvas.toBlob((blob) => {
      if (blob) {
        saveAs(blob, `${project?.name || 'whiteboard'}-export.png`);
        toast.success('Page exported as PNG');
      }
    });
  };

  const handleImportImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // This will be handled by the canvas component
          const event = new CustomEvent('import-image', {
            detail: { src: img.src },
          });
          window.dispatchEvent(event);
          toast.success('Image imported');
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.1, 0.1));
  };

  return (
    <>
      <div className="h-14 bg-toolbar border-b border-toolbar-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">
            {project?.name || 'Untitled Project'}
          </h1>
          {hasUnsavedChanges && (
            <span className="text-xs text-muted-foreground">(Unsaved)</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setNewProjectDialogOpen(true)}
            title="New Project"
          >
            <FileText className="h-4 w-4 mr-2" />
            New
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLoadProject}
            title="Open Project"
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            Open
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSaveProject}
            disabled={!project}
            title="Save Project"
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          
          <div className="h-6 w-px bg-border mx-2" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleImportImage}
            title="Import Image"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExportImage}
            title="Export as PNG"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <div className="h-6 w-px bg-border mx-2" />

          <Button variant="ghost" size="icon" title="Zoom Out" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground min-w-[4rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button variant="ghost" size="icon" title="Zoom In" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={newProjectDialogOpen} onOpenChange={setNewProjectDialogOpen}>
        <DialogContent>
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
    </>
  );
};
