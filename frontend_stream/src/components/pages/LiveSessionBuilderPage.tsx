import { LiveSessionBuilderWorkflow } from '../teacher/live-session-builder/LiveSessionBuilderWorkflow';

interface LiveSessionBuilderPageProps {
  onNavigate: (path: string) => void;
  currentPath?: string;
}

export function LiveSessionBuilderPage({
  onNavigate,
  currentPath,
}: LiveSessionBuilderPageProps) {
  return (
    <LiveSessionBuilderWorkflow
      onNavigate={onNavigate}
      currentPath={currentPath}
    />
  );
}
