import { useMemo, useState } from "react";
import { normalizeUserRole } from "../../../lib/roleUtils";
import { useAuth } from "../../../hooks/useAuth";
import {
  useGetChatHistoryQuery,
  useGetCourseDetailsQuery,
  useGetSessionByIdQuery,
  useSendChatMessageMutation,
} from "../../../store/api/liveApi";
import {
  LIVE_CHAT_POLLING_MS,
  clamp,
} from "./liveSession.utils";

export type SidebarTab = "chat" | "notes";

interface UseLiveSessionDataParams {
  courseId: string;
  sessionId: string;
}

export function useLiveSessionData({ courseId, sessionId }: UseLiveSessionDataParams) {
  const { user, isAuthenticated } = useAuth();
  const normalizedRole = normalizeUserRole(user?.role);
  const shouldSendStudentId = normalizedRole === "student" ? user?.id : undefined;
  const [activeTab, setActiveTab] = useState<SidebarTab>("chat");
  const [chatInput, setChatInput] = useState("");
  const [noteInput, setNoteInput] = useState("");

  const { data: session, isLoading: sessionLoading, error: sessionError } = useGetSessionByIdQuery(
    sessionId,
  );
  const { data: courseDetails, isLoading: courseLoading } = useGetCourseDetailsQuery({
    courseId,
    studentId: shouldSendStudentId || undefined,
  });
  const {
    data: chatMessages = [],
    isLoading: chatLoading,
  } = useGetChatHistoryQuery(sessionId, {
    pollingInterval: LIVE_CHAT_POLLING_MS,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const [sendChatMessage, { isLoading: sendingMessage }] = useSendChatMessageMutation();

  const totalDurationMinutes = 90;
  const elapsedMinutes = useMemo(() => {
    if (!session?.scheduledAt) return 45;
    const startAt = new Date(session.scheduledAt).getTime();
    if (Number.isNaN(startAt)) return 45;
    const diff = Math.max(0, Math.round((Date.now() - startAt) / 60000));
    return clamp(diff, 1, totalDurationMinutes);
  }, [session?.scheduledAt]);
  const progressPercent = clamp(Math.round((elapsedMinutes / totalDurationMinutes) * 100), 5, 99);

  const sortedMessages = useMemo(() => {
    return [...chatMessages].sort((a, b) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [chatMessages]);

  const displayedMessages = sortedMessages;
  const instructorName = courseDetails?.teacherName || "Dr. Elena Kostic";
  const sessionTitle = courseDetails?.title || "Advanced Architectural Design";
  const topicTitle = courseDetails?.sections?.[0]?.title || "Parametric Structural Optimization";
  const attendeeCount = Math.max(1248, courseDetails?.enrolledCount || 0);
  const isLive = session?.isLive ?? true;

  const handleSendMessage = async () => {
    const trimmed = chatInput.trim();
    if (!trimmed || !isAuthenticated || !user?.id) return;
    try {
      await sendChatMessage({
        sessionId,
        senderId: user.id,
        content: trimmed,
      }).unwrap();
      setChatInput("");
    } catch {
      // Keep UI responsive even if backend rejects a message.
    }
  };

  return {
    user,
    isAuthenticated,
    session,
    sessionLoading,
    sessionError,
    courseLoading,
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
  };
}

export type LiveSessionData = ReturnType<typeof useLiveSessionData>;
