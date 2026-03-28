import {
  AtSign,
  Building2,
  Paperclip,
  PlusCircle,
  Send,
  Smile,
} from "lucide-react";
import { ImageWithFallback } from "../../../figma/ImageWithFallback";
import { Button } from "../../../ui/button";
import type { LiveSessionData } from "../useLiveSessionData";
import {
  DEMO_STUDENT_AVATAR,
  DEMO_STUDENT_AVATAR_2,
  formatChatTimestamp,
  toNameInitials,
  toSafeString,
} from "../liveSession.utils";

export interface LiveSessionChatPanelProps {
  instructorName: string;
  chatLoading: boolean;
  displayedMessages: LiveSessionData["displayedMessages"];
  isAuthenticated: boolean;
  user: LiveSessionData["user"];
  session: LiveSessionData["session"];
  chatInput: string;
  onChatInputChange: (value: string) => void;
  sendingMessage: boolean;
  onSendMessage: () => void;
  onNavigate: (path: string | number) => void;
}

function LiveSessionMockMessages({
  instructorName,
  user,
}: {
  instructorName: string;
  user: LiveSessionData["user"];
}) {
  return (
    <>
      <div className="flex gap-3">
        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-sm">
          <ImageWithFallback
            src={DEMO_STUDENT_AVATAR}
            alt="Julian Thorne"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-col items-start gap-1.5">
          <span className="ml-1 text-[11px] font-bold text-slate-500">Julian Thorne</span>
          <div className="max-w-[90%] rounded-2xl rounded-tl-none bg-slate-100 px-4 py-2.5 shadow-sm dark:bg-slate-800">
            <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
              The brutalist approach mentioned earlier is fascinating. How does it scale for
              residential projects?
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-row-reverse gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-white bg-[#1152d4] text-xs font-bold text-white shadow-sm">
          {toNameInitials(user?.firstName || user?.email || "ME")}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="mr-1 text-[11px] font-bold text-slate-500">You</span>
          <div className="max-w-[90%] rounded-2xl rounded-tr-none bg-[#1152d4] px-4 py-2.5 shadow-lg shadow-[#1152d4]/20">
            <p className="text-sm leading-relaxed text-white">
              I was wondering the same thing! Especially regarding the thermal performance of
              exposed concrete.
            </p>
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-white bg-amber-500 text-white shadow-sm">
          <Building2 className="h-4 w-4" />
        </div>
        <div className="flex flex-col items-start gap-1.5">
          <span className="ml-1 flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
            {instructorName}
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] dark:bg-amber-900/40">
              INSTRUCTOR
            </span>
          </span>
          <div className="max-w-[90%] rounded-2xl rounded-tl-none border border-amber-100 bg-amber-50 px-4 py-2.5 dark:border-amber-900/40 dark:bg-amber-900/20">
            <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
              Great question, Julian. I&apos;ll cover residential scaling in the next 5 minutes.
              Hold that thought!
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
        <div className="flex flex-col items-start gap-1.5">
          <span className="ml-1 text-[11px] font-bold text-slate-500">Sarah Chen</span>
          <div className="max-w-[90%] rounded-2xl rounded-tl-none bg-slate-100 px-4 py-2.5 shadow-sm dark:bg-slate-800">
            <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
              Can we get the slides for this section? The diagram on slide 14 was very helpful.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function LiveSessionRealtimeMessages({
  displayedMessages,
  isAuthenticated,
  user,
  session,
}: {
  displayedMessages: LiveSessionData["displayedMessages"];
  isAuthenticated: boolean;
  user: LiveSessionData["user"];
  session: LiveSessionData["session"];
}) {
  return (
    <>
      {displayedMessages.map((message) => {
        const senderRoleRaw = typeof message.senderRole === "string" ? message.senderRole : "";
        const senderRole = senderRoleRaw.toLowerCase();
        const senderName = toSafeString(message.senderName, "Utilisateur");
        const messageContent = toSafeString(message.content, "");
        const messageCreatedAt = formatChatTimestamp(message.createdAt);
        const senderPhoto = typeof message.senderPhoto === "string" ? message.senderPhoto : null;
        const isTeacher =
          senderRole.includes("teacher") ||
          senderRole.includes("instructor") ||
          message.senderId === String(session?.teacherId || "");
        const isSelf =
          isAuthenticated && user?.id != null && String(user.id) === String(message.senderId);

        if (isSelf) {
          return (
            <div key={message.id} className="flex flex-row-reverse gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-white bg-[#1152d4] text-xs font-bold text-white shadow-sm">
                {toNameInitials(user?.firstName || user?.email || "ME")}
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
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-white text-white shadow-sm ${isTeacher ? "bg-amber-500" : "bg-slate-500"}`}>
                {isTeacher ? (
                  <Building2 className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-bold">{toNameInitials(senderName)}</span>
                )}
              </div>
            )}

            <div className="flex flex-col items-start gap-1.5">
              <span
                className={`ml-1 flex items-center gap-1 text-[11px] font-bold ${
                  isTeacher ? "text-amber-600 dark:text-amber-400" : "text-slate-500"
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
                    ? "border border-amber-100 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-900/20"
                    : "bg-slate-100 dark:bg-slate-800"
                }`}
              >
                <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                  {messageContent}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

export function LiveSessionChatPanel({
  instructorName,
  chatLoading,
  displayedMessages,
  isAuthenticated,
  user,
  session,
  chatInput,
  onChatInputChange,
  sendingMessage,
  onSendMessage,
  onNavigate,
}: LiveSessionChatPanelProps) {
  return (
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
          <LiveSessionMockMessages instructorName={instructorName} user={user} />
        ) : (
          <LiveSessionRealtimeMessages
            displayedMessages={displayedMessages}
            isAuthenticated={isAuthenticated}
            user={user}
            session={session}
          />
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
                onChange={(event) => onChatInputChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    onSendMessage();
                  }
                }}
                className="flex-1 border-none bg-transparent py-2 text-sm text-slate-900 placeholder-slate-400 focus:ring-0 dark:text-slate-100"
                placeholder="Type a message..."
                type="text"
              />
              <button
                type="button"
                onClick={onSendMessage}
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
            <Button onClick={() => onNavigate("/auth/signin")}>Sign in</Button>
          </div>
        )}
      </div>
    </>
  );
}
