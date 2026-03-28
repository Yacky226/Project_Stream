import { Loader2, ShieldAlert } from "lucide-react";
import { AdminPageIntro } from "../../admin/AdminPageSections";
import { AdminSupportTicketSheet } from "../../admin/support/AdminSupportTicketSheet";
import { AdminSupportContactQueueSection } from "./components/AdminSupportContactQueueSection";
import { AdminSupportKpiGrid } from "./components/AdminSupportKpiGrid";
import { AdminSupportNewsletterPanel } from "./components/AdminSupportNewsletterPanel";
import { AdminSupportOperationsNotes } from "./components/AdminSupportOperationsNotes";
import type { AdminSupportDataModel } from "./useAdminSupportData";

interface AdminSupportContentProps {
  model: AdminSupportDataModel;
  onNavigate: (path: string) => void;
}

export function AdminSupportContent({ model, onNavigate }: AdminSupportContentProps) {
  const {
    overview,
    resolutionCoverage,
    overviewError,
    overviewErrorMessage,
    contactsFetching,
    newsletterFetching,
    contactsLoading,
    newsletterLoading,
    setSheetOpen,
    sheetOpen,
    selectedRequest,
    selectedRequestLoading,
    selectedRequestFetching,
    selectedRequestError,
    selectedRequestErrorMessage,
    detailFeedback,
    workflowStatus,
    setWorkflowStatus,
    assignedAdminId,
    setAssignedAdminId,
    internalNote,
    setInternalNote,
    replyMessage,
    setReplyMessage,
    adminUsersPage,
    workflowSaving,
    replySending,
    handleWorkflowSave,
    handleSendReply,
  } = model;

  return (
    <>
      <div className="space-y-8">
        <AdminPageIntro
          eyebrow="Operational support desk"
          title="Support Center"
          description="Centralize inbound contact requests, move tickets through their lifecycle, and monitor newsletter growth from the same admin workspace."
          actions={
            <>
              <button
                type="button"
                onClick={() => onNavigate("/help")}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Open public Help Center
              </button>
              <button
                type="button"
                onClick={() => onNavigate("/contact")}
                className="rounded-2xl bg-[#1152d4] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0f47b9]"
              >
                Review contact form
              </button>
            </>
          }
        />

        <AdminSupportKpiGrid overview={overview} resolutionCoverage={resolutionCoverage} />

        <section className="grid gap-6 xl:grid-cols-12">
          <AdminSupportContactQueueSection model={model} />
          <div className="space-y-6 xl:col-span-4">
            <AdminSupportNewsletterPanel model={model} />
            <AdminSupportOperationsNotes onNavigate={onNavigate} />
          </div>
        </section>

        {overviewError ? (
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
            <ShieldAlert className="h-4 w-4" />
            {overviewErrorMessage}
          </div>
        ) : null}

        {(contactsFetching || newsletterFetching) && !contactsLoading && !newsletterLoading ? (
          <div className="flex items-center justify-end gap-2 text-xs font-medium text-slate-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#1152d4]" />
            Refreshing support data...
          </div>
        ) : null}
      </div>

      <AdminSupportTicketSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        selectedRequest={selectedRequest}
        isLoading={selectedRequestLoading}
        isSyncing={selectedRequestFetching}
        hasError={Boolean(selectedRequestError)}
        errorMessage={selectedRequestErrorMessage || "Ticket details are unavailable right now."}
        detailFeedback={detailFeedback}
        workflowStatus={workflowStatus}
        onWorkflowStatusChange={setWorkflowStatus}
        assignedAdminId={assignedAdminId}
        onAssignedAdminChange={setAssignedAdminId}
        internalNote={internalNote}
        onInternalNoteChange={setInternalNote}
        replyMessage={replyMessage}
        onReplyMessageChange={setReplyMessage}
        adminUsers={adminUsersPage?.items || []}
        workflowSaving={workflowSaving}
        replySending={replySending}
        onSaveWorkflow={handleWorkflowSave}
        onSendReply={handleSendReply}
      />
    </>
  );
}
