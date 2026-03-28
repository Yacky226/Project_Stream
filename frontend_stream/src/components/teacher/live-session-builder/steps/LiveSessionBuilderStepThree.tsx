import type { KeyboardEvent } from "react";
import { CheckCircle2, Info, Users, X, Zap } from "lucide-react";
import type { LiveCourse } from "../../../../types/live";
import { Switch } from "../../../ui/switch";
import {
  CURRENCY_OPTIONS,
  TARGET_LEVEL_OPTIONS,
  broadcastLabel,
  formatSchedule,
  stepDescription,
  stepLabel,
  type AudienceLevel,
  type LiveBuilderDraft,
} from "../liveSessionBuilder.utils";
interface LiveSessionBuilderStepThreeProps {
  draft: LiveBuilderDraft;
  progress: number;
  selectedCourse: LiveCourse | null;
  prerequisiteInput: string;
  updateDraft: (updates: Partial<LiveBuilderDraft>) => void;
  setPrerequisiteInput: (value: string) => void;
  handlePrerequisiteKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  handleAddPrerequisite: () => void;
  handleEarlyBirdToggle: (checked: boolean) => void;
}

export function LiveSessionBuilderStepThree({
  draft,
  progress,
  selectedCourse,
  prerequisiteInput,
  updateDraft,
  setPrerequisiteInput,
  handlePrerequisiteKeyDown,
  handleAddPrerequisite,
  handleEarlyBirdToggle,
}: LiveSessionBuilderStepThreeProps) {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-6 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1152d4]/10 text-[#1152d4]">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
                {stepLabel(draft.step)}
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {stepDescription(draft.step)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-[#1152d4] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-white">
            <CheckCircle2 className="h-4 w-4" />
            Step 3 of 3
          </div>
        </div>

        <div className="border-b border-slate-100 px-6 py-5 dark:border-slate-800 md:px-10">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Wizard progress
            </p>
            <p className="text-sm font-bold text-[#1152d4]">
              {progress}% completed
            </p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-[#1152d4]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-8 p-6 md:px-10">
          <section className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
              <Users className="h-5 w-5 text-[#1152d4]" />
              <h3 className="text-lg font-bold">Audience targeting</h3>
            </div>
            <div className="grid gap-6 p-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Target levels
                </label>
                <select
                  value={draft.targetLevel}
                  onChange={(event) =>
                    updateDraft({
                      targetLevel: event.target.value as AudienceLevel,
                    })
                  }
                  className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 focus:border-[#1152d4] focus:outline-none focus:ring-2 focus:ring-[#1152d4]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  {TARGET_LEVEL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Who is this live session designed for?
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Max participants
                </label>
                <div className="flex items-center gap-3">
                  <input
                    value={draft.maxParticipants}
                    onChange={(event) =>
                      updateDraft({ maxParticipants: event.target.value })
                    }
                    disabled={draft.unlimitedParticipants}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 focus:border-[#1152d4] focus:outline-none focus:ring-2 focus:ring-[#1152d4]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    placeholder="50"
                    type="number"
                    min="1"
                  />
                  <label className="flex min-w-max items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                    <input
                      checked={draft.unlimitedParticipants}
                      onChange={(event) =>
                        updateDraft({
                          unlimitedParticipants: event.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border-slate-300 text-[#1152d4] focus:ring-[#1152d4]"
                      type="checkbox"
                    />
                    Unlimited
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Prerequisites & skills required
                </label>
                <div className="min-h-[60px] rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                  <div className="flex flex-wrap gap-2">
                    {draft.prerequisites.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#1152d4]/10 px-2 py-1 text-xs font-medium text-[#1152d4]"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() =>
                            updateDraft({
                              prerequisites: draft.prerequisites.filter(
                                (entry) => entry !== item,
                              ),
                            })
                          }
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      value={prerequisiteInput}
                      onChange={(event) =>
                        setPrerequisiteInput(event.target.value)
                      }
                      onKeyDown={handlePrerequisiteKeyDown}
                      onBlur={handleAddPrerequisite}
                      className="min-w-[180px] flex-1 border-none bg-transparent p-0 text-sm focus:outline-none focus:ring-0"
                      placeholder="Add more..."
                      type="text"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
              <Zap className="h-5 w-5 text-[#1152d4]" />
              <h3 className="text-lg font-bold">Pricing & enrollment</h3>
            </div>
            <div className="space-y-8 p-6">
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  {
                    value: "free" as const,
                    title: "Free session",
                    description:
                      "Accessible to all registered users without charge.",
                  },
                  {
                    value: "paid" as const,
                    title: "Paid session",
                    description:
                      "Learners must pay a fee before joining the event.",
                  },
                ].map((option) => {
                  const active = draft.pricingMode === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateDraft({ pricingMode: option.value })}
                      className={`rounded-2xl border-2 p-4 text-left transition ${
                        active
                          ? "border-[#1152d4] bg-[#1152d4]/5"
                          : "border-slate-100 bg-slate-50 hover:border-[#1152d4]/20 dark:border-slate-800 dark:bg-slate-800"
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-bold">
                          {option.title}
                        </span>
                        <div
                          className={`flex h-4 w-4 items-center justify-center rounded-full border ${active ? "border-[#1152d4]" : "border-slate-300 dark:border-slate-700"}`}
                        >
                          {active ? (
                            <div className="h-2 w-2 rounded-full bg-[#1152d4]" />
                          ) : null}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {option.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800/50 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Base price
                  </label>
                  <div className="flex h-12">
                    <select
                      value={draft.currency}
                      onChange={(event) =>
                        updateDraft({ currency: event.target.value })
                      }
                      disabled={draft.pricingMode === "free"}
                      className="h-full w-24 rounded-l-xl border border-r-0 border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    >
                      {CURRENCY_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <input
                      value={draft.basePrice}
                      onChange={(event) =>
                        updateDraft({ basePrice: event.target.value })
                      }
                      disabled={draft.pricingMode === "free"}
                      className="h-full flex-1 rounded-r-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 focus:border-[#1152d4] focus:outline-none focus:ring-2 focus:ring-[#1152d4]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      placeholder="0.00"
                      type="number"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Early bird discount
                    </label>
                    <Switch
                      checked={draft.earlyBirdEnabled}
                      onCheckedChange={handleEarlyBirdToggle}
                      className="shrink-0 data-[state=checked]:bg-[#1152d4] data-[state=unchecked]:bg-slate-200 dark:data-[state=unchecked]:bg-slate-700"
                    />
                  </div>
                  <div className="relative">
                    <input
                      value={draft.earlyBirdDiscount}
                      onChange={(event) =>
                        updateDraft({ earlyBirdDiscount: event.target.value })
                      }
                      disabled={
                        !draft.earlyBirdEnabled || draft.pricingMode === "free"
                      }
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-900 focus:border-[#1152d4] focus:outline-none focus:ring-2 focus:ring-[#1152d4]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      placeholder="20"
                      type="number"
                      min="0"
                      max="99"
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/40">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Publishing into
              </p>
              <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
                {draft.sessionMode === "new"
                  ? "A new course will be created"
                  : selectedCourse?.title || "Selected course pending"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/40">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Broadcast mode
              </p>
              <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
                {broadcastLabel(draft.streamType)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/40">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Go-live date
              </p>
              <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
                {formatSchedule(draft.scheduledAt)}
              </p>
            </div>
          </section>

          <div className="rounded-2xl border border-[#1152d4]/20 bg-[#1152d4]/5 p-5">
            <div className="flex gap-3">
              <Info className="h-5 w-5 shrink-0 text-[#1152d4]" />
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Audience, pricing, thumbnail and moderation preferences are now
                persisted in backend metadata together with the created session.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

