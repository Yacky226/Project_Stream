import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import { LiveSessionContent } from "./live-session/LiveSessionContent";
import { useLiveSessionData } from "./live-session/useLiveSessionData";

interface LiveSessionProps {
  courseId: string;
  sessionId: string;
  onNavigate: (path: string | number) => void;
}

export function LiveSession({ courseId, sessionId, onNavigate }: LiveSessionProps) {
  const liveSession = useLiveSessionData({ courseId, sessionId });

  if (liveSession.sessionLoading || liveSession.courseLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f6f8] dark:bg-[#101622]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1152d4] border-t-transparent" />
      </div>
    );
  }

  if (liveSession.sessionError) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <Alert variant="destructive">
          <AlertDescription>Unable to load this live session right now.</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => onNavigate(`/courses/${courseId}`)}>Back to course</Button>
        </div>
      </div>
    );
  }

  return (
    <LiveSessionContent
      courseId={courseId}
      onNavigate={onNavigate}
      liveSession={liveSession}
    />
  );
}
