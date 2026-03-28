import { Loader2, Mail, MessageSquareText, ShieldAlert } from "lucide-react";
import type { AdminSupportStatus } from "../../../../types/admin";
import {
  formatDateTime,
  formatSourcePage,
  statusBadgeClasses,
  statusLabel,
  SUPPORT_FILTERS,
} from "../../../admin/support/adminSupport.utils";
import type { AdminSupportDataModel } from "../useAdminSupportData";

interface AdminSupportContactQueueSectionProps {
  model: AdminSupportDataModel;
}

export function AdminSupportContactQueueSection({
  model,
}: AdminSupportContactQueueSectionProps) {
  const {
    statusFilter,
    setStatusFilter,
    setPage,
    contactsLoading,
    contactsError,
    contactsErrorMessage,
    contactsPage,
    openRequestDetails,
    updatingId,
    handleStatusChange,
    page,
  } = model;

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:col-span-8">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">
            Contact Request Queue
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
            Open a ticket to assign it, add internal notes, and answer from the admin desk.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {SUPPORT_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => {
                setStatusFilter(filter.value);
                setPage(0);
              }}
              className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                statusFilter === filter.value
                  ? "bg-[#1152d4] text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 p-6">
        {contactsLoading ? (
          <div className="flex items-center justify-center gap-3 py-16 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin text-[#1152d4]" />
            Loading support requests...
          </div>
        ) : contactsError ? (
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
            <ShieldAlert className="h-4 w-4" />
            {contactsErrorMessage}
          </div>
        ) : contactsPage?.items.length ? (
          contactsPage.items.map((request) => (
            <article
              key={request.id}
              className="rounded-[24px] border border-slate-200 p-5 transition hover:border-[#1152d4]/30 dark:border-slate-800"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#1152d4]/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#1152d4]">
                      {request.subject}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${statusBadgeClasses(
                        request.status,
                      )}`}
                    >
                      {statusLabel(request.status)}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                      {formatSourcePage(request.sourcePage)}
                    </span>
                    {request.assignedAdminName ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                        Assigned to {request.assignedAdminName}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4">
                    <p className="text-lg font-bold text-slate-950 dark:text-white">
                      {request.fullName}
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                      {request.email}
                    </p>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {request.preview}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400">
                    <span>Received {formatDateTime(request.createdAt)}</span>
                    {request.processedAt ? (
                      <span>Updated {formatDateTime(request.processedAt)}</span>
                    ) : null}
                    {request.repliedAt ? <span>Replied {formatDateTime(request.repliedAt)}</span> : null}
                    {request.ipAddress ? <span>IP {request.ipAddress}</span> : null}
                  </div>
                </div>

                <div className="flex w-full flex-col gap-3 xl:w-60">
                  <button
                    type="button"
                    onClick={() => openRequestDetails(request.id)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <MessageSquareText className="h-4 w-4" />
                    Open ticket
                  </button>
                  <select
                    value={request.status}
                    disabled={updatingId === request.id}
                    onChange={(event) =>
                      handleStatusChange(request.id, event.target.value as AdminSupportStatus)
                    }
                    className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-[#1152d4]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <option value="NEW">NEW</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                  <a
                    href={`mailto:${request.email}`}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1152d4]/10 px-4 py-3 text-sm font-semibold text-[#1152d4] transition hover:bg-[#1152d4] hover:text-white"
                  >
                    <Mail className="h-4 w-4" />
                    Quick email
                  </a>
                  {updatingId === request.id ? (
                    <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#1152d4]" />
                      Saving...
                    </div>
                  ) : null}
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[24px] border border-dashed border-slate-300 px-6 py-16 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-300">
            No support request matches the current filter.
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-300">
          Page {(contactsPage?.pageNumber ?? page) + 1} of{" "}
          {Math.max(contactsPage?.totalPages ?? 1, 1)}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((previous) => Math.max(previous - 1, 0))}
            disabled={!contactsPage || contactsPage.first}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setPage((previous) => previous + 1)}
            disabled={!contactsPage || contactsPage.last}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
