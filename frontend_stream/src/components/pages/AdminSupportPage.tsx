import { Loader2 } from "lucide-react";
import { AdminSpaceShell, AdminSpaceStatus } from "../admin/AdminSpaceShared";
import { AdminSupportContent } from "./admin-support/AdminSupportContent";
import { useAdminSupportData } from "./admin-support/useAdminSupportData";

interface AdminSupportPageProps {
  onNavigate: (path: string) => void;
  currentPath?: string;
}

export function AdminSupportPage({ onNavigate, currentPath }: AdminSupportPageProps) {
  const model = useAdminSupportData();
  const { shared, searchQuery, handleSearchChange, isInitialLoading } = model;

  if (shared.status !== "ready") {
    return <AdminSpaceStatus shared={shared} />;
  }

  if (isInitialLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f6f8] dark:bg-[#101622]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1152d4]" />
      </div>
    );
  }

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
      <AdminSupportContent model={model} onNavigate={onNavigate} />
    </AdminSpaceShell>
  );
}
