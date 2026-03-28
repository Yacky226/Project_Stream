import { Button } from "../../../ui/button";

export interface LiveSessionNotesPanelProps {
  noteInput: string;
  onNoteInputChange: (value: string) => void;
}

export function LiveSessionNotesPanel({
  noteInput,
  onNoteInputChange,
}: LiveSessionNotesPanelProps) {
  return (
    <div className="flex flex-1 flex-col p-5">
      <label className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
        Session Notes
      </label>
      <textarea
        value={noteInput}
        onChange={(event) => onNoteInputChange(event.target.value)}
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
  );
}
