import { useEffect } from 'react';
import { BottomToolbar } from '@/components/Whiteboard/BottomToolbar';
import { UtilityMenu } from '@/components/Whiteboard/UtilityMenu';
import { WhiteboardCanvas } from '@/components/Whiteboard/WhiteboardCanvas';
import { PagesSidebar } from '@/components/Whiteboard/PagesSidebar';
import { useWhiteboardStore } from '@/store/whiteboardStore';

const Index = () => {
  const { createNewProject, project } = useWhiteboardStore();

  useEffect(() => {
    // Initialize with a default project
    createNewProject('My Whiteboard');
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-background relative">
      <PagesSidebar />
      <WhiteboardCanvas />
      <BottomToolbar />
      
      {/* Utility Menu - Bottom Right */}
      <div className="fixed bottom-6 right-6 z-50">
        <UtilityMenu />
      </div>

      {/* Project Name Overlay - Top Left */}
      {project && (
        <div className="fixed top-6 left-6 z-40 glass-strong px-4 py-2 rounded-lg">
          <h1 className="text-sm font-semibold">{project.name}</h1>
        </div>
      )}
    </div>
  );
};

export default Index;
