import { LiveSessionFooter } from "./components/LiveSessionFooter";
import { LiveSessionHeader } from "./components/LiveSessionHeader";
import { LiveSessionSidebar } from "./components/LiveSessionSidebar";
import { LiveSessionTopicCard } from "./components/LiveSessionTopicCard";
import { LiveSessionVideoPlayer } from "./components/LiveSessionVideoPlayer";
import type { LiveSessionData, SidebarTab } from "./useLiveSessionData";

interface LiveSessionContentProps {
  courseId: string;
  onNavigate: (path: string | number) => void;
  liveSession: LiveSessionData;
}

export function LiveSessionContent({
  courseId,
  onNavigate,
  liveSession,
}: LiveSessionContentProps) {
  const {
    user,
    isAuthenticated,
    session,
    chatLoading,
    sendingMessage,
    activeTab,
    setActiveTab,
    chatInput,
    setChatInput,
    noteInput,
    setNoteInput,
    totalDurationMinutes,
    elapsedMinutes,
    progressPercent,
    displayedMessages,
    instructorName,
    sessionTitle,
    topicTitle,
    attendeeCount,
    isLive,
    handleSendMessage,
  } = liveSession;

  const handleTabChange = (tab: SidebarTab) => setActiveTab(tab);
  const handleChatInputChange = (value: string) => setChatInput(value);
  const handleNoteInputChange = (value: string) => setNoteInput(value);

  return (
    <div
      className="flex h-screen min-h-screen flex-col overflow-hidden bg-[#f6f6f8] text-slate-900 dark:bg-[#101622] dark:text-slate-100"
      style={{ fontFamily: "Lexend, system-ui, sans-serif" }}
    >
      <LiveSessionHeader
        sessionTitle={sessionTitle}
        isLive={isLive}
        attendeeCount={attendeeCount}
        onLeave={() => onNavigate(`/courses/${courseId}`)}
      />

      <main className="relative flex flex-1 overflow-hidden">
        <section className="scrollbar-hide flex flex-1 flex-col gap-6 overflow-y-auto p-6">
          <LiveSessionVideoPlayer
            instructorName={instructorName}
            progressPercent={progressPercent}
            elapsedMinutes={elapsedMinutes}
            totalDurationMinutes={totalDurationMinutes}
          />
          <LiveSessionTopicCard
            topicTitle={topicTitle}
            onOpenResources={() => onNavigate(`/courses/${courseId}`)}
          />
        </section>

        <LiveSessionSidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          chatPanelProps={{
            instructorName,
            chatLoading,
            displayedMessages,
            isAuthenticated,
            user,
            session,
            chatInput,
            onChatInputChange: handleChatInputChange,
            sendingMessage,
            onSendMessage: handleSendMessage,
            onNavigate,
          }}
          notesPanelProps={{
            noteInput,
            onNoteInputChange: handleNoteInputChange,
          }}
        />
      </main>

      <LiveSessionFooter scheduledAt={session?.scheduledAt} />
    </div>
  );
}
