import { ArrowRight, Clock3, Sparkles, Users } from "lucide-react";

interface AdminSupportOperationsNotesProps {
  onNavigate: (path: string) => void;
}

export function AdminSupportOperationsNotes({ onNavigate }: AdminSupportOperationsNotesProps) {
  return (
    <div className="rounded-[28px] border border-[#1152d4]/20 bg-[#1152d4]/5 p-6 shadow-sm dark:bg-[#1152d4]/10">
      <h2 className="text-lg font-bold text-slate-950 dark:text-white">
        Operations Notes
      </h2>
      <div className="mt-4 space-y-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
        <div className="flex items-start gap-3">
          <Clock3 className="mt-0.5 h-4 w-4 text-[#1152d4]" />
          <span>Each ticket can now be assigned to an admin and enriched with internal notes.</span>
        </div>
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-4 w-4 text-[#1152d4]" />
          <span>Replies sent from the back-office are persisted on the ticket for follow-up.</span>
        </div>
        <div className="flex items-start gap-3">
          <Users className="mt-0.5 h-4 w-4 text-[#1152d4]" />
          <span>
            Use the shared search bar to filter both inbound requests and newsletter growth by
            email or source page.
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onNavigate("/business")}
        className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#1152d4] transition hover:text-[#0f47b9]"
      >
        Open business funnel
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
