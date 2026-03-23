import { Loader2, Mail, Send, ShieldAlert } from 'lucide-react';
import type {
  AdminSupportContactRequestDetail,
  AdminSupportStatus,
  AdminUser,
} from '../../../types/admin';
import {
  formatDateTime,
  formatSourcePage,
  statusBadgeClasses,
  statusLabel,
} from './adminSupport.utils';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../../ui/sheet';
import { Textarea } from '../../ui/textarea';

export interface AdminSupportDetailFeedback {
  type: 'success' | 'error';
  message: string;
}

interface AdminSupportTicketSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRequest: AdminSupportContactRequestDetail | null | undefined;
  isLoading: boolean;
  isSyncing: boolean;
  hasError: boolean;
  errorMessage: string;
  detailFeedback: AdminSupportDetailFeedback | null;
  workflowStatus: AdminSupportStatus;
  onWorkflowStatusChange: (status: AdminSupportStatus) => void;
  assignedAdminId: string;
  onAssignedAdminChange: (value: string) => void;
  internalNote: string;
  onInternalNoteChange: (value: string) => void;
  replyMessage: string;
  onReplyMessageChange: (value: string) => void;
  adminUsers: AdminUser[];
  workflowSaving: boolean;
  replySending: boolean;
  onSaveWorkflow: () => void;
  onSendReply: () => void;
}

export function AdminSupportTicketSheet({
  open,
  onOpenChange,
  selectedRequest,
  isLoading,
  isSyncing,
  hasError,
  errorMessage,
  detailFeedback,
  workflowStatus,
  onWorkflowStatusChange,
  assignedAdminId,
  onAssignedAdminChange,
  internalNote,
  onInternalNoteChange,
  replyMessage,
  onReplyMessageChange,
  adminUsers,
  workflowSaving,
  replySending,
  onSaveWorkflow,
  onSendReply,
}: AdminSupportTicketSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Support Ticket Workspace</SheetTitle>
          <SheetDescription>
            Review the full ticket, keep internal notes, assign an owner, and reply without leaving
            the admin desk.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 px-4 py-16 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-300">
              <Loader2 className="h-4 w-4 animate-spin text-[#1152d4]" />
              Loading ticket details...
            </div>
          ) : hasError || !selectedRequest ? (
            <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
              <ShieldAlert className="h-4 w-4" />
              {errorMessage || 'Ticket details are unavailable right now.'}
            </div>
          ) : (
            <>
              {detailFeedback ? (
                <div
                  className={`rounded-2xl px-4 py-3 text-sm ${
                    detailFeedback.type === 'success'
                      ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-950/30 dark:text-emerald-300'
                      : 'border border-red-200 bg-red-50 text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300'
                  }`}
                >
                  {detailFeedback.message}
                </div>
              ) : null}

              <section className="rounded-[24px] border border-slate-200 p-5 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#1152d4]/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#1152d4]">
                    {selectedRequest.subject}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${statusBadgeClasses(selectedRequest.status)}`}
                  >
                    {statusLabel(selectedRequest.status)}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                    {formatSourcePage(selectedRequest.sourcePage)}
                  </span>
                </div>

                <div className="mt-4">
                  <h2 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                    {selectedRequest.fullName}
                  </h2>
                  <a
                    href={`mailto:${selectedRequest.email}`}
                    className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-[#1152d4] hover:text-[#0f47b9]"
                  >
                    <Mail className="h-4 w-4" />
                    {selectedRequest.email}
                  </a>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                      Received
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                      {formatDateTime(selectedRequest.createdAt)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                      Last Reply
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                      {selectedRequest.repliedAt
                        ? formatDateTime(selectedRequest.repliedAt)
                        : 'No reply yet'}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                      Assigned Admin
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                      {selectedRequest.assignedAdminName || 'Unassigned'}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                      Last Responder
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                      {selectedRequest.respondedByAdminName || 'Not answered yet'}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-[24px] border border-slate-200 p-5 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-950 dark:text-white">Original Message</h3>
                <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
                  {selectedRequest.message}
                </div>
              </section>

              <section className="rounded-[24px] border border-slate-200 p-5 dark:border-slate-800">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-bold text-slate-950 dark:text-white">Workflow</h3>
                  {isSyncing ? (
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#1152d4]" />
                      Syncing...
                    </div>
                  ) : null}
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Ticket Status
                    </span>
                    <select
                      value={workflowStatus}
                      onChange={(event) =>
                        onWorkflowStatusChange(event.target.value as AdminSupportStatus)
                      }
                      className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-[#1152d4]/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                    >
                      <option value="NEW">NEW</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Assigned Admin
                    </span>
                    <select
                      value={assignedAdminId}
                      onChange={(event) => onAssignedAdminChange(event.target.value)}
                      className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-[#1152d4]/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                    >
                      <option value="">Unassigned</option>
                      {adminUsers.map((admin) => (
                        <option key={admin.id} value={admin.id}>
                          {admin.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="mt-4">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Internal Notes
                    </span>
                    <Textarea
                      value={internalNote}
                      onChange={(event) => onInternalNoteChange(event.target.value)}
                      className="min-h-[120px] rounded-2xl border-slate-200 dark:border-slate-800"
                      placeholder="Summarize context, owner decisions, or follow-up actions for the support team..."
                    />
                  </label>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={onSaveWorkflow}
                    disabled={workflowSaving}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#1152d4] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0f47b9] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {workflowSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Save workflow
                  </button>
                </div>
              </section>

              <section className="rounded-[24px] border border-slate-200 p-5 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-950 dark:text-white">Reply Desk</h3>

                {selectedRequest.lastAdminReply ? (
                  <div className="mt-4 rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-950/20">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-300">
                      Latest Sent Reply
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-200">
                      {selectedRequest.lastAdminReply}
                    </p>
                    <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                      {selectedRequest.respondedByAdminName || 'Support admin'} on{' '}
                      {formatDateTime(selectedRequest.repliedAt)}
                    </p>
                  </div>
                ) : null}

                <div className="mt-4">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Compose Reply
                    </span>
                    <Textarea
                      value={replyMessage}
                      onChange={(event) => onReplyMessageChange(event.target.value)}
                      className="min-h-[160px] rounded-2xl border-slate-200 dark:border-slate-800"
                      placeholder="Write the response that will be sent to the learner or prospect..."
                    />
                  </label>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    The selected status will be saved with the outgoing reply.
                  </p>
                  <button
                    type="button"
                    onClick={onSendReply}
                    disabled={replySending}
                    className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {replySending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Send reply
                  </button>
                </div>
              </section>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
