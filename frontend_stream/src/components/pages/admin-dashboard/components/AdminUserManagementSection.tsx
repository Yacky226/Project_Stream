import { Filter, Loader2 } from 'lucide-react';
import { roleBadgeClass, roleLabel } from '../../../admin/dashboard/adminDashboard.utils';
import type { AdminDashboardDataModel } from '../useAdminDashboardData';

interface AdminUserManagementSectionProps {
  usersError: AdminDashboardDataModel['usersError'];
  usersErrorMessage: AdminDashboardDataModel['usersErrorMessage'];
  fallbackUsers: AdminDashboardDataModel['fallbackUsers'];
  usersLoading: AdminDashboardDataModel['usersLoading'];
  usersFetching: AdminDashboardDataModel['usersFetching'];
  displayedUsers: AdminDashboardDataModel['displayedUsers'];
  onNavigate: (path: string | number) => void;
}

export function AdminUserManagementSection({
  usersError,
  usersErrorMessage,
  fallbackUsers,
  usersLoading,
  usersFetching,
  displayedUsers,
  onNavigate,
}: AdminUserManagementSectionProps) {
  return (
    <article className="overflow-hidden rounded-xl border border-[#1152d4]/10 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:col-span-2">
      <div className="flex items-center justify-between border-b border-[#1152d4]/10 p-8 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">User Management</h2>
        <button
          type="button"
          onClick={() => onNavigate('/admin/users')}
          className="inline-flex items-center gap-1 text-sm font-bold text-[#1152d4]"
        >
          Filter <Filter className="h-4 w-4" />
        </button>
      </div>

      <div className="overflow-x-auto">
        {usersError && fallbackUsers.length > 0 ? (
          <div className="border-b border-amber-200 bg-amber-50 px-8 py-3 text-xs font-medium text-amber-700 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-300">
            Live users endpoint returned an error ({usersErrorMessage}). Showing recent backend fallback data.
          </div>
        ) : null}
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#f6f6f8] text-xs font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800">
              <th className="px-8 py-4">Name</th>
              <th className="px-8 py-4">Role</th>
              <th className="px-8 py-4">Status</th>
              <th className="px-8 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1152d4]/10 dark:divide-slate-800">
            {(usersLoading || usersFetching) && !displayedUsers.length && !usersError ? (
              <tr>
                <td colSpan={4} className="px-8 py-10 text-center text-sm text-slate-500">
                  <Loader2 className="mx-auto mb-2 h-4 w-4 animate-spin text-[#1152d4]" />
                  Loading users...
                </td>
              </tr>
            ) : displayedUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-8 py-10 text-center text-sm text-slate-500">
                  {usersErrorMessage ? `No user data available. (${usersErrorMessage})` : 'No users for current filters.'}
                </td>
              </tr>
            ) : (
              displayedUsers.map((userItem) => (
                <tr key={userItem.id} className="transition hover:bg-[#1152d4]/5">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      {userItem.avatar ? (
                        <img className="h-8 w-8 rounded-full object-cover" src={userItem.avatar} alt={userItem.name || 'User'} />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1152d4]/20 text-xs font-bold text-[#1152d4]">
                          {(userItem.prenom?.[0] || 'U') + (userItem.nom?.[0] || '')}
                        </div>
                      )}
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {userItem.name || userItem.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-600 dark:text-slate-300">{roleLabel(userItem.role)}</td>
                  <td className="px-8 py-5">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        userItem.status === 'active'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                      }`}
                    >
                      {userItem.status === 'active' ? 'Active' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <button
                      type="button"
                      onClick={() => onNavigate('/admin/users')}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${roleBadgeClass(userItem.role)}`}
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </article>
  );
}
