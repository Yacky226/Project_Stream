import { useEffect, useState } from "react";
import type { AdminSupportStatus } from "../../../types/admin";
import { useGetAdminUsersQuery } from "../../../store/api/adminUserApi";
import {
  useGetAdminNewsletterSubscriptionsQuery,
  useGetAdminSupportContactByIdQuery,
  useGetAdminSupportContactsQuery,
  useGetAdminSupportOverviewQuery,
  useReplyToAdminSupportContactMutation,
  useUpdateAdminSupportContactStatusMutation,
  useUpdateAdminSupportContactWorkflowMutation,
} from "../../../store/api/adminSupportApi";
import { useAdminSpaceData } from "../../admin/AdminSpaceShared";
import {
  extractErrorMessage,
  type NewsletterFilterValue,
  type SupportFilterValue,
} from "../../admin/support/adminSupport.utils";
import type { AdminSupportDetailFeedback } from "../../admin/support/AdminSupportTicketSheet";

export function useAdminSupportData() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<SupportFilterValue>("ALL");
  const [newsletterFilter, setNewsletterFilter] =
    useState<NewsletterFilterValue>("active");
  const [page, setPage] = useState(0);
  const [newsletterPage, setNewsletterPage] = useState(0);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [workflowStatus, setWorkflowStatus] = useState<AdminSupportStatus>("NEW");
  const [assignedAdminId, setAssignedAdminId] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [detailFeedback, setDetailFeedback] =
    useState<AdminSupportDetailFeedback | null>(null);
  const shared = useAdminSpaceData({ includeDashboard: false });

  const normalizedSearch = searchQuery.trim();
  const supportStatus = statusFilter === "ALL" ? undefined : statusFilter;
  const newsletterActive =
    newsletterFilter === "all" ? undefined : newsletterFilter === "active";

  const { data: overview, isLoading: overviewLoading, error: overviewError } =
    useGetAdminSupportOverviewQuery(undefined, { skip: shared.status !== "ready" });
  const {
    data: contactsPage,
    isLoading: contactsLoading,
    isFetching: contactsFetching,
    error: contactsError,
  } = useGetAdminSupportContactsQuery(
    {
      page,
      size: 8,
      sortBy: "createdAt",
      sortDir: "DESC",
      status: supportStatus,
      search: normalizedSearch || undefined,
    },
    { skip: shared.status !== "ready" },
  );
  const {
    data: selectedRequest,
    isLoading: selectedRequestLoading,
    isFetching: selectedRequestFetching,
    error: selectedRequestError,
  } = useGetAdminSupportContactByIdQuery(selectedRequestId || "", {
    skip: shared.status !== "ready" || !selectedRequestId || !sheetOpen,
  });
  const {
    data: newsletterPageData,
    isLoading: newsletterLoading,
    isFetching: newsletterFetching,
    error: newsletterError,
  } = useGetAdminNewsletterSubscriptionsQuery(
    {
      page: newsletterPage,
      size: 6,
      sortBy: "updatedAt",
      sortDir: "DESC",
      active: newsletterActive,
      search: normalizedSearch || undefined,
    },
    { skip: shared.status !== "ready" },
  );
  const { data: adminUsersPage } = useGetAdminUsersQuery(
    {
      page: 0,
      size: 50,
      role: "ADMINISTRATEUR",
      actif: true,
      sortBy: "prenom",
      sortDir: "ASC",
    },
    { skip: shared.status !== "ready" },
  );
  const [updateSupportStatus] = useUpdateAdminSupportContactStatusMutation();
  const [updateSupportWorkflow, { isLoading: workflowSaving }] =
    useUpdateAdminSupportContactWorkflowMutation();
  const [replyToSupportContact, { isLoading: replySending }] =
    useReplyToAdminSupportContactMutation();

  const contactsErrorMessage = contactsError
    ? extractErrorMessage(contactsError, "Unable to load support requests right now.")
    : null;
  const newsletterErrorMessage = newsletterError
    ? extractErrorMessage(newsletterError, "Newsletter list unavailable right now.")
    : null;
  const overviewErrorMessage = overviewError
    ? extractErrorMessage(
        overviewError,
        "Support overview metrics are temporarily unavailable.",
      )
    : null;
  const selectedRequestErrorMessage = selectedRequestError
    ? extractErrorMessage(selectedRequestError, "Ticket details are unavailable right now.")
    : null;

  useEffect(() => {
    if (!selectedRequest) return;
    setWorkflowStatus(selectedRequest.status);
    setAssignedAdminId(selectedRequest.assignedAdminId || "");
    setInternalNote(selectedRequest.internalNote || "");
    setReplyMessage("");
  }, [selectedRequest]);

  const isInitialLoading =
    overviewLoading && !overview && contactsLoading && !contactsPage;
  const resolutionCoverage = overview?.totalContactRequests
    ? ((overview.resolvedContactRequests + overview.closedContactRequests) /
        overview.totalContactRequests) *
      100
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
      setDetailFeedback({ type: "success", message: "Workflow updated successfully." });
    } catch {
      setDetailFeedback({
        type: "error",
        message: "Unable to save workflow changes right now.",
      });
    }
  };

  const handleSendReply = async () => {
    if (!selectedRequestId || !replyMessage.trim()) {
      setDetailFeedback({ type: "error", message: "Write a reply before sending it." });
      return;
    }

    try {
      await replyToSupportContact({
        id: selectedRequestId,
        payload: { message: replyMessage.trim(), status: workflowStatus },
      }).unwrap();
      setReplyMessage("");
      setDetailFeedback({
        type: "success",
        message: "Reply sent and ticket history updated.",
      });
    } catch {
      setDetailFeedback({ type: "error", message: "Unable to send the reply right now." });
    }
  };

  return {
    shared,
    searchQuery,
    statusFilter,
    newsletterFilter,
    page,
    newsletterPage,
    updatingId,
    sheetOpen,
    workflowStatus,
    assignedAdminId,
    internalNote,
    replyMessage,
    detailFeedback,
    overview,
    overviewError,
    contactsPage,
    contactsLoading,
    contactsFetching,
    contactsError,
    selectedRequest,
    selectedRequestLoading,
    selectedRequestFetching,
    selectedRequestError,
    newsletterPageData,
    newsletterLoading,
    newsletterFetching,
    newsletterError,
    adminUsersPage,
    workflowSaving,
    replySending,
    contactsErrorMessage,
    newsletterErrorMessage,
    overviewErrorMessage,
    selectedRequestErrorMessage,
    isInitialLoading,
    resolutionCoverage,
    setStatusFilter,
    setNewsletterFilter,
    setPage,
    setNewsletterPage,
    setSheetOpen,
    setWorkflowStatus,
    setAssignedAdminId,
    setInternalNote,
    setReplyMessage,
    handleSearchChange,
    handleStatusChange,
    openRequestDetails,
    handleWorkflowSave,
    handleSendReply,
  };
}

export type AdminSupportDataModel = ReturnType<typeof useAdminSupportData>;
