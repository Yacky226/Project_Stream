import { BookOpen, MessageCircle } from "lucide-react";
import type { SidebarTab } from "../useLiveSessionData";
import {
  LiveSessionChatPanel,
  type LiveSessionChatPanelProps,
} from "./LiveSessionChatPanel";
import {
  LiveSessionNotesPanel,
  type LiveSessionNotesPanelProps,
} from "./LiveSessionNotesPanel";

interface LiveSessionSidebarProps {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  chatPanelProps: LiveSessionChatPanelProps;
  notesPanelProps: LiveSessionNotesPanelProps;
}

export function LiveSessionSidebar({
  activeTab,
  onTabChange,
  chatPanelProps,
  notesPanelProps,
}: LiveSessionSidebarProps) {
  return (
    <aside className="hidden w-[470px] flex-col border-l border-slate-200 bg-white dark:border-slate-800 dark:bg-[#101622] lg:flex">
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => onTabChange("chat")}
          className={`flex flex-1 items-center justify-center gap-2 border-b-2 py-5 text-sm font-bold transition-colors ${
            activeTab === "chat"
              ? "border-[#1152d4] text-[#1152d4]"
              : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          <MessageCircle className="h-4 w-4" />
          Live Chat
        </button>
        <button
          type="button"
          onClick={() => onTabChange("notes")}
          className={`flex flex-1 items-center justify-center gap-2 border-b-2 py-5 text-sm font-bold transition-colors ${
            activeTab === "notes"
              ? "border-[#1152d4] text-[#1152d4]"
              : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          My Notes
        </button>
      </div>

      {activeTab === "chat" ? (
        <LiveSessionChatPanel {...chatPanelProps} />
      ) : (
        <LiveSessionNotesPanel {...notesPanelProps} />
      )}
    </aside>
  );
}
