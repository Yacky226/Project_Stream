import { ArrowRight, Loader2 } from "lucide-react";
import { compact, formatDateTime, formatSourcePage } from "../../../admin/support/adminSupport.utils";
import type { AdminSupportDataModel } from "../useAdminSupportData";

interface AdminSupportNewsletterPanelProps {
  model: AdminSupportDataModel;
}

export function AdminSupportNewsletterPanel({ model }: AdminSupportNewsletterPanelProps) {
  const {
    newsletterPageData,
    newsletterFilter,
    setNewsletterFilter,
    setNewsletterPage,
    newsletterLoading,
    newsletterError,
    newsletterErrorMessage,
    newsletterPage,
  } = model;

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">
            Newsletter Audience
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
            Monitor help-center and support acquisition.
          </p>
        </div>
        <span className="rounded-full bg-[#1152d4]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#1152d4]">
          {compact(newsletterPageData?.totalElements || 0)}
        </span>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {([
          { label: "All", value: "all" },
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
        ] as const).map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => {
              setNewsletterFilter(filter.value);
              setNewsletterPage(0);
            }}
            className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
              newsletterFilter === filter.value
                ? "bg-[#1152d4] text-white"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {newsletterLoading ? (
          <div className="flex items-center justify-center gap-3 py-10 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin text-[#1152d4]" />
            Loading subscribers...
          </div>
        ) : newsletterError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
            {newsletterErrorMessage}
          </div>
        ) : newsletterPageData?.items.length ? (
          newsletterPageData.items.map((subscription) => (
            <div
              key={subscription.id}
              className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-950 dark:text-white">
                    {subscription.email}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                    {formatSourcePage(subscription.sourcePage)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${
                    subscription.active
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {subscription.active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <span>Updated {formatDateTime(subscription.updatedAt)}</span>
                <a
                  href={`mailto:${subscription.email}`}
                  className="inline-flex items-center gap-1 font-semibold text-[#1152d4] hover:text-[#0f47b9]"
                >
                  Reach out
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-300">
            No newsletter subscription matches the current filter.
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-300">
        <span>
          Page {(newsletterPageData?.pageNumber ?? newsletterPage) + 1} of{" "}
          {Math.max(newsletterPageData?.totalPages ?? 1, 1)}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setNewsletterPage((previous) => Math.max(previous - 1, 0))}
            disabled={!newsletterPageData || newsletterPageData.first}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setNewsletterPage((previous) => previous + 1)}
            disabled={!newsletterPageData || newsletterPageData.last}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
