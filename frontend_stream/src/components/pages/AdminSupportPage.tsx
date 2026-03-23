import { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Loader2,
  Mail,
  MessageSquareText,
  Send,
  ShieldAlert,
  Sparkles,
  Users,
} from 'lucide-react';
import type { AdminSupportStatus } from '../../types/admin';
import { useGetAdminUsersQuery } from '../../store/api/adminUserApi';
import { AdminSpaceShell, AdminSpaceStatus, useAdminSpaceData } from '../admin/AdminSpaceShared';
import { AdminKpiCard, AdminPageIntro } from '../admin/AdminPageSections';
import {
  AdminSupportTicketSheet,
  type AdminSupportDetailFeedback,
} from '../admin/support/AdminSupportTicketSheet';
import {
  SUPPORT_FILTERS,
  compact,
  extractErrorMessage,
  formatDateTime,
  formatSourcePage,
  statusBadgeClasses,
  statusLabel,
  type NewsletterFilterValue,
  type SupportFilterValue,
} from '../admin/support/adminSupport.utils';
import {
  useGetAdminNewsletterSubscriptionsQuery,
  useGetAdminSupportContactByIdQuery,
  useGetAdminSupportContactsQuery,
  useGetAdminSupportOverviewQuery,
  useReplyToAdminSupportContactMutation,
  useUpdateAdminSupportContactStatusMutation,
  useUpdateAdminSupportContactWorkflowMutation,
} from '../../store/api/adminSupportApi';

interface AdminSupportPageProps {
  onNavigate: (path: string) => void;
  currentPath?: string;
}

export function AdminSupportPage({ onNavigate, currentPath }: AdminSupportPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<SupportFilterValue>('ALL');
  const [newsletterFilter, setNewsletterFilter] = useState<NewsletterFilterValue>('active');
  const [page, setPage] = useState(0);
  const [newsletterPage, setNewsletterPage] = useState(0);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [workflowStatus, setWorkflowStatus] = useState<AdminSupportStatus>('NEW');
  const [assignedAdminId, setAssignedAdminId] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [detailFeedback, setDetailFeedback] = useState<AdminSupportDetailFeedback | null>(null);
  const shared = useAdminSpaceData({ includeDashboard: false });

  const normalizedSearch = searchQuery.trim();
  const supportStatus = statusFilter === 'ALL' ? undefined : statusFilter;
  const newsletterActive = newsletterFilter === 'all' ? undefined : newsletterFilter === 'active';

  const { data: overview, isLoading: overviewLoading, error: overviewError } =
    useGetAdminSupportOverviewQuery(undefined, { skip: shared.status !== 'ready' });
  const { data: contactsPage, isLoading: contactsLoading, isFetching: contactsFetching, error: contactsError } =
    useGetAdminSupportContactsQuery(
      { page, size: 8, sortBy: 'createdAt', sortDir: 'DESC', status: supportStatus, search: normalizedSearch || undefined },
      { skip: shared.status !== 'ready' },
    );
  const { data: selectedRequest, isLoading: selectedRequestLoading, isFetching: selectedRequestFetching, error: selectedRequestError } =
    useGetAdminSupportContactByIdQuery(selectedRequestId || '', {
      skip: shared.status !== 'ready' || !selectedRequestId || !sheetOpen,
    });
  const { data: newsletterPageData, isLoading: newsletterLoading, isFetching: newsletterFetching, error: newsletterError } =
    useGetAdminNewsletterSubscriptionsQuery(
      { page: newsletterPage, size: 6, sortBy: 'updatedAt', sortDir: 'DESC', active: newsletterActive, search: normalizedSearch || undefined },
      { skip: shared.status !== 'ready' },
    );
  const { data: adminUsersPage } = useGetAdminUsersQuery(
    { page: 0, size: 50, role: 'ADMINISTRATEUR', actif: true, sortBy: 'prenom', sortDir: 'ASC' },
    { skip: shared.status !== 'ready' },
  );
  const [updateSupportStatus] = useUpdateAdminSupportContactStatusMutation();
  const [updateSupportWorkflow, { isLoading: workflowSaving }] = useUpdateAdminSupportContactWorkflowMutation();
  const [replyToSupportContact, { isLoading: replySending }] = useReplyToAdminSupportContactMutation();

  const contactsErrorMessage = contactsError
    ? extractErrorMessage(contactsError, 'Unable to load support requests right now.')
    : null;
  const newsletterErrorMessage = newsletterError
    ? extractErrorMessage(newsletterError, 'Newsletter list unavailable right now.')
    : null;
  const overviewErrorMessage = overviewError
    ? extractErrorMessage(overviewError, 'Support overview metrics are temporarily unavailable.')
    : null;
  const selectedRequestErrorMessage = selectedRequestError
    ? extractErrorMessage(selectedRequestError, 'Ticket details are unavailable right now.')
    : null;

  useEffect(() => {
    if (!selectedRequest) return;
    setWorkflowStatus(selectedRequest.status);
    setAssignedAdminId(selectedRequest.assignedAdminId || '');
    setInternalNote(selectedRequest.internalNote || '');
    setReplyMessage('');
  }, [selectedRequest]);

  if (shared.status !== 'ready') {
    return <AdminSpaceStatus shared={shared} />;
  }

  if (overviewLoading && !overview && contactsLoading && !contactsPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f6f8] dark:bg-[#101622]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1152d4]" />
      </div>
    );
  }

  const resolutionCoverage = overview?.totalContactRequests
    ? ((overview.resolvedContactRequests + overview.closedContactRequests) / overview.totalContactRequests) * 100
    : 0;

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(0);
    setNewsletterPage(0);
  };

  const handleStatusChange = async (id: string, status: AdminSupportStatus) => {
    try {
      setUpdatingId(id);
      await updateSupportStatus({ id, payload: { status } }).unwrap();
    } finally {
      setUpdatingId(null);
    }
  };

  const openRequestDetails = (id: string) => {
    setSelectedRequestId(id);
    setDetailFeedback(null);
    setSheetOpen(true);
  };

  const handleWorkflowSave = async () => {
    if (!selectedRequestId) return;

    try {
      await updateSupportWorkflow({
        id: selectedRequestId,
        payload: {
          status: workflowStatus,
          assignedAdminId: assignedAdminId ? Number(assignedAdminId) : null,
          internalNote: internalNote.trim() || null,
        },
      }).unwrap();
      setDetailFeedback({ type: 'success', message: 'Workflow updated successfully.' });
    } catch {
      setDetailFeedback({ type: 'error', message: 'Unable to save workflow changes right now.' });
    }
  };

  const handleSendReply = async () => {
    if (!selectedRequestId || !replyMessage.trim()) {
      setDetailFeedback({ type: 'error', message: 'Write a reply before sending it.' });
      return;
    }

    try {
      await replyToSupportContact({
        id: selectedRequestId,
        payload: { message: replyMessage.trim(), status: workflowStatus },
      }).unwrap();
      setReplyMessage('');
      setDetailFeedback({ type: 'success', message: 'Reply sent and ticket history updated.' });
    } catch {
      setDetailFeedback({ type: 'error', message: 'Unable to send the reply right now.' });
    }
  };

  return (
    <AdminSpaceShell
      currentPath={currentPath}
      onNavigate={onNavigate}
      searchQuery={searchQuery}
      onSearchChange={handleSearchChange}
      searchPlaceholder="Search requests, emails, or source pages..."
      displayName={shared.displayName}
      displayRole={shared.displayRole}
      initials={shared.initials}
      avatarUrl={shared.avatarUrl}
      unreadCount={shared.unreadCount}
    >
      <div className="space-y-8">
        <AdminPageIntro
          eyebrow="Operational support desk"
          title="Support Center"
          description="Centralize inbound contact requests, move tickets through their lifecycle, and monitor newsletter growth from the same admin workspace."
          actions={
            <>
            <button
              type="button"
              onClick={() => onNavigate('/help')}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Open public Help Center
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/contact')}
              className="rounded-2xl bg-[#1152d4] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0f47b9]"
            >
              Review contact form
            </button>
            </>
          }
        />

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: 'Pending Queue',
              value: compact(overview?.pendingContactRequests || 0),
              meta: `${compact(overview?.newContactRequests || 0)} new requests`,
              icon: Clock3,
              accent: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
            },
            {
              title: 'Monthly Inbound',
              value: compact(overview?.monthlyContactRequests || 0),
              meta: `${compact(overview?.totalContactRequests || 0)} total requests`,
              icon: MessageSquareText,
              accent: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300',
            },
            {
              title: 'Active Subscribers',
              value: compact(overview?.activeNewsletterSubscriptions || 0),
              meta: `${compact(overview?.monthlyNewsletterSubscriptions || 0)} joined this month`,
              icon: Send,
              accent: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300',
            },
            {
              title: 'Resolution Coverage',
              value: `${resolutionCoverage.toFixed(0)}%`,
              meta: `${compact((overview?.resolvedContactRequests || 0) + (overview?.closedContactRequests || 0))} handled`,
              icon: CheckCircle2,
              accent: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300',
            },
          ].map((card) => (
            <AdminKpiCard
              key={card.title}
              title={card.title}
              value={card.value}
              meta={card.meta}
              icon={card.icon}
              iconToneClass={card.accent}
            />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-12">
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:col-span-8">
            <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-950 dark:text-white">Contact Request Queue</h2>
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
                        ? 'bg-[#1152d4] text-white'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
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
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${statusBadgeClasses(request.status)}`}>
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
                          <p className="text-lg font-bold text-slate-950 dark:text-white">{request.fullName}</p>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{request.email}</p>
                        </div>

                        <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{request.preview}</p>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400">
                          <span>Received {formatDateTime(request.createdAt)}</span>
                          {request.processedAt ? <span>Updated {formatDateTime(request.processedAt)}</span> : null}
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
                          onChange={(event) => handleStatusChange(request.id, event.target.value as AdminSupportStatus)}
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
                Page {(contactsPage?.pageNumber ?? page) + 1} of {Math.max(contactsPage?.totalPages ?? 1, 1)}
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

          <div className="space-y-6 xl:col-span-4">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-950 dark:text-white">Newsletter Audience</h2>
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
                  { label: 'All', value: 'all' },
                  { label: 'Active', value: 'active' },
                  { label: 'Inactive', value: 'inactive' },
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
                        ? 'bg-[#1152d4] text-white'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
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
                    <div key={subscription.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-950 dark:text-white">{subscription.email}</p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                            {formatSourcePage(subscription.sourcePage)}
                          </p>
                        </div>
                        <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${
                          subscription.active
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {subscription.active ? 'Active' : 'Inactive'}
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
                  Page {(newsletterPageData?.pageNumber ?? newsletterPage) + 1} of {Math.max(newsletterPageData?.totalPages ?? 1, 1)}
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

            <div className="rounded-[28px] border border-[#1152d4]/20 bg-[#1152d4]/5 p-6 shadow-sm dark:bg-[#1152d4]/10">
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">Operations Notes</h2>
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
                  <span>Use the shared search bar to filter both inbound requests and newsletter growth by email or source page.</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('/business')}
                className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#1152d4] transition hover:text-[#0f47b9]"
              >
                Open business funnel
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
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
        errorMessage={selectedRequestErrorMessage || 'Ticket details are unavailable right now.'}
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
    </AdminSpaceShell>
  );
}
