import { useState } from 'react';
import { Loader2, ShieldAlert, UserPlus, Users } from 'lucide-react';
import { UserManagementTab } from '../admin/users/UserManagementTab';
import { AdminSpaceShell, AdminSpaceStatus, useAdminSpaceData } from '../admin/AdminSpaceShared';

interface AdminUsersPageProps {
  onNavigate: (path: string) => void;
  currentPath?: string;
}

function compact(value: number) {
  return new Intl.NumberFormat('fr-FR', {
    notation: 'compact',
    maximumFractionDigits: value >= 100000 ? 0 : 1,
  }).format(value);
}

export function AdminUsersPage({ onNavigate, currentPath }: AdminUsersPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const shared = useAdminSpaceData();

  if (shared.status !== 'ready') {
    return <AdminSpaceStatus shared={shared} />;
  }

  if (shared.dashboardLoading && !shared.dashboard) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f6f8] dark:bg-[#101622]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1152d4]" />
      </div>
    );
  }

  if (!shared.dashboard) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f6f8] px-6 dark:bg-[#101622]">
        <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <ShieldAlert className="h-10 w-10 text-red-500" />
          <h1 className="mt-4 text-2xl font-bold text-slate-950 dark:text-white">
            User workspace unavailable
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-300">
            The admin metrics endpoint did not respond. Detailed user CRUD below remains independent when available.
          </p>
        </div>
      </div>
    );
  }

  const { stats } = shared.dashboard;

  return (
    <AdminSpaceShell
      currentPath={currentPath}
      onNavigate={onNavigate}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      showSearch={false}
      displayName={shared.displayName}
      displayRole={shared.displayRole}
      initials={shared.initials}
      avatarUrl={shared.avatarUrl}
      unreadCount={shared.unreadCount}
    >
      <div className="space-y-8">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1152d4]">
              Platform access control
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
              User Management
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-300">
              Manage, monitor, and configure platform access for students, teachers, and administrators. Detailed creation, edition, activation, and export actions are available in the operational table below.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => document.getElementById('admin-users-operations')?.scrollIntoView({ behavior: 'smooth' })}
              className="rounded-2xl bg-[#1152d4] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0f47b9]"
            >
              Open user operations
            </button>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[
            { title: 'Total Users', value: compact(stats.totalUsers), meta: `${compact(stats.totalStudents)} students`, icon: Users },
            { title: 'Teachers', value: compact(stats.totalTeachers), meta: `${compact(stats.totalCourses)} active courses`, icon: Users },
            { title: 'Admins', value: compact(stats.totalAdmins), meta: 'governance layer', icon: ShieldAlert },
            { title: 'New Signups', value: compact(stats.monthlyNewUsers), meta: `${compact(stats.monthlyEnrollments)} enrollments`, icon: UserPlus },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex items-start justify-between">
                  <div className="rounded-2xl bg-[#1152d4]/10 p-3 text-[#1152d4]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                    {card.meta}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.title}</p>
                <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white">{card.value}</h3>
              </div>
            );
          })}
        </section>

        <section id="admin-users-operations" className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-950 dark:text-white">Detailed User Operations</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
              This module is connected to the existing admin CRUD API and keeps the advanced workflows already in place.
            </p>
          </div>
          <UserManagementTab />
        </section>
      </div>
    </AdminSpaceShell>
  );
}
