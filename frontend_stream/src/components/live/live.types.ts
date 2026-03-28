export interface BaseLiveProps {
  courseId: string;
  sessionId?: string;
  onNavigate: (path: string) => void;
}

export interface SimpleLiveManagerProps {
  courseId: string;
  onNavigate: (path: string) => void;
  embedded?: boolean;
}
