import { useMemo, useState } from 'react';
import {
  AtSign,
  BookOpen,
  Building2,
  Compass,
  ChevronDown,
  ChevronUp,
  Clock3,
  Download,
  LogOut,
  Maximize,
  MessageCircle,
  Paperclip,
  Pause,
  Play,
  PlusCircle,
  Send,
  Settings,
  Smile,
  User,
  Users,
  Volume2,
  Wifi,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import {
  useGetChatHistoryQuery,
  useGetCourseDetailsQuery,
  useGetSessionByIdQuery,
  useSendChatMessageMutation,
} from '../../store/api/liveApi';
import { normalizeUserRole } from '../../lib/roleUtils';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';

interface LiveSessionProps {
  courseId: string;
  sessionId: string;
  onNavigate: (path: string | number) => void;
}

type SidebarTab = 'chat' | 'notes';

const VIDEO_PLACEHOLDER =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBAybo5y7TrqfDC1NxN6PNZMRdZ3SxgN9mihA10rKnnkllHWCSCTQ_Vl0o6lrs2_xfUwjoARxkWWPXTyl6S1QDeMO87M_Gk06Ob3KXgxwCrbX0WUnliGp2JPjF4sEQkyVuIUjTb0zXEPEA9T9d3oHqzZcI5DpCgwTDiIjURWFIGCtxCts0xqWnmkt3QUV98mUxTsHDPaguDqGepRwITMMdmEEv16wsIn1o3KWjOz33l58iJTrq56iUEKwhbydRAO58L8EnsiAktV0M';
const DEMO_STUDENT_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDGie28-WMW3qnehNeXOobHcKw2I584-jjwSH7WPHLp7mx21BfIFaJbjJ4LC6qETnAu_iHA4_IuVRwWwJTV6SlubaMClNrmE0DdYJ9xbkga-WDxEG5eR3DFhHXtrENj-5Zm06uRE0Q1x8-ezDdpnqSMseIBRSPO9L-Tz0Qypum6uo4o96mT8FaM2Er-c9bgK2ito2ls54QxdEFFXp5i_xnoVF1Qt9Eg-mlJosowyI58UiPbQLLC3ohAHV4YubQ7bi2O3kATBXTtMN8';
const DEMO_STUDENT_AVATAR_2 =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCazQ2EGYJfpQavGrK8g49scUHe7vp2K-Typ3uZ9_0owAga-KiqYBq0b9v4m_0ZKNvO_V8zqHlhskSxKuLkvsIDj2AQu7gw4ssau-WoQuesKNLwdDiJVC9x7m8JNJJ73vt8P0e_6Ls-7_mUY9s3qd4moD7q1ar54Q52YVlpRBuxEqJs2ZFF5li7TBbBIgVzrZmsb3DYtIA18H6YUqLfkor9jUpjl-Cffp4TprnvHo2T7wsEvrTR--JRjXbMUE9sQ084bMmbq1tCj5s';

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function toSafeString(value: unknown, fallback = '') {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function toNameInitials(value: unknown) {
  const normalized = toSafeString(value, 'ME').trim();
  const parts = normalized.split(/\s+/).filter(Boolean);
  if (!parts.length) return 'ME';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
}

function formatPlayback(minutesTotal: number) {
  const safe = Math.max(0, Math.round(minutesTotal));
  const hours = Math.floor(safe / 60);
  const minutes = safe % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
}

function formatChatTimestamp(value: unknown) {
  const normalized = toSafeString(value, '');
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return '--:--';
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function LiveSession({ courseId, sessionId, onNavigate }: LiveSessionProps) {
  const { user, isAuthenticated } = useAuth();
  const normalizedRole = normalizeUserRole(user?.role);
  const shouldSendStudentId = normalizedRole === 'student' ? user?.id : undefined;
  const [activeTab, setActiveTab] = useState<SidebarTab>('chat');
  const [chatInput, setChatInput] = useState('');
  const [noteInput, setNoteInput] = useState('');

  const { data: session, isLoading: sessionLoading, error: sessionError } = useGetSessionByIdQuery(sessionId);
  const { data: courseDetails, isLoading: courseLoading } = useGetCourseDetailsQuery({
    courseId,
    studentId: shouldSendStudentId || undefined,
  });
  const {
    data: chatMessages = [],
    isLoading: chatLoading,
  } = useGetChatHistoryQuery(sessionId);
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
  const instructorName = courseDetails?.teacherName || 'Dr. Elena Kostic';
  const sessionTitle = courseDetails?.title || 'Advanced Architectural Design';
  const topicTitle =
    courseDetails?.sections?.[0]?.title || 'Parametric Structural Optimization';
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
      setChatInput('');
    } catch {
      // Keep UI responsive even if backend rejects a message.
    }
  };

  if (sessionLoading || courseLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f6f8] dark:bg-[#101622]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1152d4] border-t-transparent" />
      </div>
    );
  }

  if (sessionError) {
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
    <div
      className="flex h-screen min-h-screen flex-col overflow-hidden bg-[#f6f6f8] text-slate-900 dark:bg-[#101622] dark:text-slate-100"
      style={{ fontFamily: 'Lexend, system-ui, sans-serif' }}
    >
      <header className="z-50 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md dark:border-slate-800 dark:bg-[#101622]/80 md:px-8">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-[#1152d4]/10 p-2.5">
            <Compass className="h-5 w-5 text-[#1152d4]" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight">{sessionTitle}</h1>
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${isLive ? 'animate-pulse bg-red-500' : 'bg-slate-400'}`} />
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                {isLive ? 'Live Q&A Session' : 'Recorded Session'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800 md:flex">
            <Users className="h-4 w-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {attendeeCount.toLocaleString('en-US')} attending
            </span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate(`/courses/${courseId}`)}
            className="flex items-center gap-2 rounded-xl bg-[#1152d4] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#1152d4]/20 transition-all hover:bg-[#0f47b9]"
          >
            <LogOut className="h-4 w-4" />
            Leave Session
          </button>
        </div>
      </header>

      <main className="relative flex flex-1 overflow-hidden">
        <section className="scrollbar-hide flex flex-1 flex-col gap-6 overflow-y-auto p-6">
          <div className="group relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-2xl dark:border-slate-800">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${VIDEO_PLACEHOLDER}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="flex h-20 w-20 scale-90 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-transform duration-300 group-hover:scale-100">
                <Play className="h-9 w-9 fill-current" />
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 flex translate-y-4 flex-col gap-4 p-6 transition-transform duration-300 group-hover:translate-y-0">
              <div className="h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-white/20">
                <div className="h-full rounded-full bg-[#1152d4]" style={{ width: `${progressPercent}%` }} />
              </div>
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-4 md:gap-6">
                  <Pause className="h-5 w-5 cursor-pointer transition-colors hover:text-[#1152d4]" />
                  <Volume2 className="h-5 w-5 cursor-pointer transition-colors hover:text-[#1152d4]" />
                  <span className="text-sm font-medium tracking-tight">
                    {formatPlayback(elapsedMinutes)} / {formatPlayback(totalDurationMinutes)}
                  </span>
                </div>
                <div className="flex items-center gap-4 md:gap-6">
                  <MessageCircle className="h-5 w-5 cursor-pointer transition-colors hover:text-[#1152d4]" />
                  <Settings className="h-5 w-5 cursor-pointer transition-colors hover:text-[#1152d4]" />
                  <Maximize className="h-5 w-5 cursor-pointer transition-colors hover:text-[#1152d4]" />
                </div>
              </div>
            </div>

            <div className="absolute left-6 top-6 flex items-center gap-3 rounded-xl border border-white/20 bg-white/70 px-4 py-2 shadow-lg backdrop-blur-md">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1152d4] text-white">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{instructorName}</p>
                <p className="text-[10px] font-medium text-slate-500">Lead Designer</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1152d4]/10">
                <BookOpen className="h-5 w-5 text-[#1152d4]" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#1152d4]">
                  Current Topic
                </p>
                <h3 className="text-base font-bold">{topicTitle}</h3>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate(`/courses/${courseId}`)}
                className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <Download className="h-4 w-4" />
                Resources
              </button>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>
          </div>
        </section>

        <aside className="hidden w-[470px] flex-col border-l border-slate-200 bg-white dark:border-slate-800 dark:bg-[#101622] lg:flex">
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`flex flex-1 items-center justify-center gap-2 border-b-2 py-5 text-sm font-bold transition-colors ${
                activeTab === 'chat'
                  ? 'border-[#1152d4] text-[#1152d4]'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <MessageCircle className="h-4 w-4" />
              Live Chat
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('notes')}
              className={`flex flex-1 items-center justify-center gap-2 border-b-2 py-5 text-sm font-bold transition-colors ${
                activeTab === 'notes'
                  ? 'border-[#1152d4] text-[#1152d4]'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              My Notes
            </button>
          </div>

          {activeTab === 'chat' ? (
            <>
              <div className="scrollbar-hide flex flex-1 flex-col gap-6 overflow-y-auto p-5">
                <div className="flex justify-center">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-tight text-slate-500 dark:bg-slate-800">
                    {instructorName} joined the session
                  </span>
                </div>

                {chatLoading ? (
                  <div className="text-sm text-slate-500">Loading chat...</div>
                ) : !displayedMessages.length ? (
                  <>
                    <div className="flex gap-3">
                      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-sm">
                        <ImageWithFallback
                          src={DEMO_STUDENT_AVATAR}
                          alt="Julian Thorne"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5 items-start">
                        <span className="ml-1 text-[11px] font-bold text-slate-500">Julian Thorne</span>
                        <div className="max-w-[90%] rounded-2xl rounded-tl-none bg-slate-100 px-4 py-2.5 shadow-sm dark:bg-slate-800">
                          <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                            The brutalist approach mentioned earlier is fascinating. How does it scale for residential projects?
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row-reverse gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-white bg-[#1152d4] text-xs font-bold text-white shadow-sm">
                        {toNameInitials(user?.firstName || user?.email || 'ME')}
                      </div>
                      <div className="flex flex-col gap-1.5 items-end">
                        <span className="mr-1 text-[11px] font-bold text-slate-500">You</span>
                        <div className="max-w-[90%] rounded-2xl rounded-tr-none bg-[#1152d4] px-4 py-2.5 shadow-lg shadow-[#1152d4]/20">
                          <p className="text-sm leading-relaxed text-white">
                            I was wondering the same thing! Especially regarding the thermal performance of exposed concrete.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-white bg-amber-500 text-white shadow-sm">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col gap-1.5 items-start">
                        <span className="ml-1 flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                          {instructorName}
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] dark:bg-amber-900/40">INSTRUCTOR</span>
                        </span>
                        <div className="max-w-[90%] rounded-2xl rounded-tl-none border border-amber-100 bg-amber-50 px-4 py-2.5 dark:border-amber-900/40 dark:bg-amber-900/20">
                          <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                            Great question, Julian. I&apos;ll cover residential scaling in the next 5 minutes. Hold that thought!
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-sm">
                        <ImageWithFallback
                          src={DEMO_STUDENT_AVATAR_2}
                          alt="Sarah Chen"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5 items-start">
                        <span className="ml-1 text-[11px] font-bold text-slate-500">Sarah Chen</span>
                        <div className="max-w-[90%] rounded-2xl rounded-tl-none bg-slate-100 px-4 py-2.5 shadow-sm dark:bg-slate-800">
                          <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                            Can we get the slides for this section? The diagram on slide 14 was very helpful.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  displayedMessages.map((message) => {
                    const senderRoleRaw = typeof message.senderRole === 'string' ? message.senderRole : '';
                    const senderRole = senderRoleRaw.toLowerCase();
                    const senderName = toSafeString(message.senderName, 'Utilisateur');
                    const messageContent = toSafeString(message.content, '');
                    const messageCreatedAt = formatChatTimestamp(message.createdAt);
                    const senderPhoto = typeof message.senderPhoto === 'string' ? message.senderPhoto : null;
                    const isTeacher =
                      senderRole.includes('teacher') ||
                      senderRole.includes('instructor') ||
                      message.senderId === String(session?.teacherId || '');
                    const isSelf =
                      isAuthenticated && user?.id != null && String(user.id) === String(message.senderId);

                    if (isSelf) {
                      return (
                        <div key={message.id} className="flex flex-row-reverse gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-white bg-[#1152d4] text-xs font-bold text-white shadow-sm">
                            {toNameInitials(user?.firstName || user?.email || 'ME')}
                          </div>
                          <div className="flex items-end gap-1.5">
                            <div className="max-w-[90%] rounded-2xl rounded-tr-none bg-[#1152d4] px-4 py-2.5 shadow-lg shadow-[#1152d4]/20">
                              <p className="text-sm leading-relaxed text-white">{messageContent}</p>
                            </div>
                            <span className="pb-1 text-[10px] font-semibold text-slate-400">
                              {messageCreatedAt}
                            </span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={message.id} className="flex gap-3">
                        {senderPhoto ? (
                          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-sm">
                            <ImageWithFallback
                              src={senderPhoto}
                              alt={senderName}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-white text-white shadow-sm ${isTeacher ? 'bg-amber-500' : 'bg-slate-500'}`}>
                            {isTeacher ? (
                              <Building2 className="h-4 w-4" />
                            ) : (
                              <span className="text-xs font-bold">{toNameInitials(senderName)}</span>
                            )}
                          </div>
                        )}

                        <div className="flex flex-col gap-1.5 items-start">
                          <span
                            className={`ml-1 flex items-center gap-1 text-[11px] font-bold ${
                              isTeacher ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'
                            }`}
                          >
                            {senderName}
                            {isTeacher ? (
                              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] dark:bg-amber-900/40">
                                INSTRUCTOR
                              </span>
                            ) : null}
                          </span>
                          <div
                            className={`max-w-[90%] rounded-2xl rounded-tl-none px-4 py-2.5 shadow-sm ${
                              isTeacher
                                ? 'border border-amber-100 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-900/20'
                                : 'bg-slate-100 dark:bg-slate-800'
                            }`}
                          >
                            <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                              {messageContent}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="border-t border-slate-200 bg-white/50 p-5 backdrop-blur-md dark:border-slate-800 dark:bg-[#101622]/50">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-100 p-1.5 transition-all focus-within:ring-2 focus-within:ring-[#1152d4]/40 dark:border-slate-700 dark:bg-slate-800">
                      <button
                        type="button"
                        className="flex h-10 w-10 items-center justify-center text-slate-500 transition-colors hover:text-[#1152d4]"
                      >
                        <PlusCircle className="h-5 w-5" />
                      </button>
                      <input
                        value={chatInput}
                        onChange={(event) => setChatInput(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="flex-1 border-none bg-transparent py-2 text-sm text-slate-900 placeholder-slate-400 focus:ring-0 dark:text-slate-100"
                        placeholder="Type a message..."
                        type="text"
                      />
                      <button
                        type="button"
                        onClick={handleSendMessage}
                        disabled={!chatInput.trim() || sendingMessage}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1152d4] text-white transition-all hover:bg-[#0f47b9] disabled:opacity-60"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between px-1">
                      <div className="flex gap-3">
                        <button type="button" className="text-slate-400 transition-colors hover:text-slate-600">
                          <Smile className="h-4 w-4" />
                        </button>
                        <button type="button" className="text-slate-400 transition-colors hover:text-slate-600">
                          <Paperclip className="h-4 w-4" />
                        </button>
                        <button type="button" className="text-slate-400 transition-colors hover:text-slate-600">
                          <AtSign className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-tight text-slate-400">
                        Enter to send
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-500">Sign in to participate in live chat.</p>
                    <Button onClick={() => onNavigate('/auth/signin')}>Sign in</Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col p-5">
              <label className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                Session Notes
              </label>
              <textarea
                value={noteInput}
                onChange={(event) => setNoteInput(event.target.value)}
                className="h-full min-h-[240px] flex-1 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 focus:border-[#1152d4] focus:outline-none focus:ring-2 focus:ring-[#1152d4]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                placeholder="Write your notes here..."
              />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-slate-400">{noteInput.length} characters</span>
                <Button size="sm" variant="outline">
                  Save notes
                </Button>
              </div>
            </div>
          )}
        </aside>
      </main>

      <footer className="group relative flex h-10 cursor-pointer items-center justify-center border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 transition-colors group-hover:text-[#1152d4]">
          <ChevronUp className="h-4 w-4" />
          Session Handouts and More
        </div>
        <div className="absolute right-8 flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-[10px] font-bold uppercase text-slate-500">
              Connection: Stable
            </span>
          </div>
          <div className="hidden items-center gap-1 text-[10px] font-bold uppercase text-slate-500 md:flex">
            <Clock3 className="h-3.5 w-3.5" />
            {formatTimeLabel(session?.scheduledAt || null)}
          </div>
          <div className="hidden items-center gap-1 text-[10px] font-bold uppercase text-slate-500 md:flex">
            <Wifi className="h-3.5 w-3.5" />
            HD
          </div>
        </div>
      </footer>
    </div>
  );
}


