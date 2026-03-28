import { Info, MessageSquare, Radio, Shield, Video } from "lucide-react";
import { Switch } from "../../../ui/switch";
import {
  RESOLUTION_OPTIONS,
  broadcastLabel,
  formatSchedule,
  stepDescription,
  stepLabel,
  type LiveBuilderDraft,
} from "../liveSessionBuilder.utils";
interface LiveSessionBuilderStepTwoProps {
  draft: LiveBuilderDraft;
  progress: number;
  updateDraft: (updates: Partial<LiveBuilderDraft>) => void;
}

export function LiveSessionBuilderStepTwo({
  draft,
  progress,
  updateDraft,
}: LiveSessionBuilderStepTwoProps) {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-8">
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-950 dark:text-slate-50">
              {stepLabel(draft.step)}
            </h2>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              {stepDescription(draft.step)}
            </p>
          </div>
          <span className="w-fit rounded-full bg-[#1152d4]/10 px-3 py-1 text-sm font-semibold text-[#1152d4]">
            Step 2 of 3
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-[#1152d4]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
          <span>Basic info</span>
          <span className="text-[#1152d4]">Technical setup</span>
          <span>Audience</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-center gap-2">
              <Radio className="h-5 w-5 text-[#1152d4]" />
              <h3 className="text-lg font-bold">Stream configuration</h3>
            </div>
            <div className="space-y-4">
              {[ 
                {
                  value: "livekit" as const,
                  title: "LiveKit integrated broadcast",
                  description:
                    "LiveKit is the default engine for live creation and diffusion (camera, mic, screen share).",
                  icon: Video,
                },
              ].map((option) => {
                const Icon = option.icon;
                const isActive = draft.streamType === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateDraft({ streamType: option.value })}
                    className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition ${
                      isActive
                        ? "border-[#1152d4] bg-[#1152d4]/5"
                        : "border-slate-100 hover:border-[#1152d4]/30 dark:border-slate-800"
                    }`}
                  >
                    <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
                      <Icon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {option.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {option.description}
                      </p>
                    </div>
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${isActive ? "border-[#1152d4]" : "border-slate-300 dark:border-slate-700"}`}
                    >
                      {isActive ? (
                        <div className="h-3 w-3 rounded-full bg-[#1152d4]" />
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#1152d4]" />
              <h3 className="text-lg font-bold">Interactivity settings</h3>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                {
                  label: "Enable live chat",
                  description: "Allow students to message during the session.",
                  value: draft.enableLiveChat,
                  onToggle: (checked: boolean) =>
                    updateDraft({ enableLiveChat: checked }),
                },
                {
                  label: "Enable Q&A moderation",
                  description:
                    "Review questions before they become visible to everyone.",
                  value: draft.enableQnaModeration,
                  onToggle: (checked: boolean) =>
                    updateDraft({ enableQnaModeration: checked }),
                },
                {
                  label: "Allow student reactions",
                  description:
                    "Let students react with lightweight emoji signals during the live.",
                  value: draft.allowReactions,
                  onToggle: (checked: boolean) =>
                    updateDraft({ allowReactions: checked }),
                },
              ].map((setting, index) => (
                <div
                  key={setting.label}
                  className={`rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/30 ${
                    index === 2 ? "md:col-span-2" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{setting.label}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {setting.description}
                      </p>
                    </div>
                    <Switch
                      checked={setting.value}
                      onCheckedChange={setting.onToggle}
                      className="mt-0.5 shrink-0 data-[state=checked]:bg-[#1152d4] data-[state=unchecked]:bg-slate-200 dark:data-[state=unchecked]:bg-slate-700"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#1152d4]" />
              <h3 className="text-lg font-bold">Recording & privacy</h3>
            </div>
            <div className="space-y-6">
              {[
                {
                  label: "Auto-record session",
                  value: draft.recordingEnabled,
                  onToggle: (checked: boolean) =>
                    updateDraft({ recordingEnabled: checked }),
                },
                {
                  label: "Cloud storage backup",
                  value: draft.cloudBackup,
                  onToggle: (checked: boolean) =>
                    updateDraft({ cloudBackup: checked }),
                },
              ].map((setting) => (
                <div
                  key={setting.label}
                  className="flex items-center justify-between gap-4"
                >
                  <p className="max-w-[160px] text-sm font-semibold">
                    {setting.label}
                  </p>
                  <Switch
                    checked={setting.value}
                    onCheckedChange={setting.onToggle}
                    className="shrink-0 data-[state=checked]:bg-[#1152d4] data-[state=unchecked]:bg-slate-200 dark:data-[state=unchecked]:bg-slate-700"
                  />
                </div>
              ))}

              <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
                <p className="mb-3 text-sm font-semibold">Stream visibility</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => updateDraft({ visibility: "public" })}
                    className={`flex-1 rounded-xl border-2 px-3 py-2 text-sm font-bold transition ${
                      draft.visibility === "public"
                        ? "border-[#1152d4] bg-[#1152d4]/10 text-[#1152d4]"
                        : "border-slate-100 text-slate-500 dark:border-slate-800 dark:text-slate-400"
                    }`}
                  >
                    Public
                  </button>
                  <button
                    type="button"
                    onClick={() => updateDraft({ visibility: "private" })}
                    className={`flex-1 rounded-xl border-2 px-3 py-2 text-sm font-bold transition ${
                      draft.visibility === "private"
                        ? "border-[#1152d4] bg-[#1152d4]/10 text-[#1152d4]"
                        : "border-slate-100 text-slate-500 dark:border-slate-800 dark:text-slate-400"
                    }`}
                  >
                    Private
                  </button>
                </div>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Resolution
                </span>
                <select
                  value={draft.resolution}
                  onChange={(event) =>
                    updateDraft({ resolution: event.target.value })
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 focus:border-[#1152d4] focus:outline-none focus:ring-2 focus:ring-[#1152d4]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  {RESOLUTION_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <div className="rounded-2xl border border-[#1152d4]/20 bg-[#1152d4]/5 p-5">
            <div className="flex gap-3">
              <Info className="h-5 w-5 shrink-0 text-[#1152d4]" />
              <div>
                <p className="text-sm font-semibold text-[#1152d4]">Pro tip</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  LiveKit is preconfigured as the default broadcast engine.
                  For stable e-learning sessions, 1080p at 30fps is a safe
                  starting point.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Draft summary
            </p>
            <h3 className="mt-2 text-lg font-bold text-slate-950 dark:text-white">
              {draft.title || "Untitled live session"}
            </h3>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">
              {formatSchedule(draft.scheduledAt)}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {broadcastLabel(draft.streamType)}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {draft.visibility === "public"
                  ? "Public access"
                  : "Private access"}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {draft.resolution}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

