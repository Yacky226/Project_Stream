import { useMemo, useState } from 'react';
import {
  AlertCircle,
  BarChart3,
  Bell,
  BookOpen,
  Download,
  Filter,
  GraduationCap,
  Hourglass,
  MoreVertical,
  Plus,
  School,
  Search,
  Settings,
  Shield,
  UserPlus,
  Users,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGetAdminUsersQuery } from '../../store/api/adminUserApi';
import { useGetAdminDashboardQuery } from '../../store/api/dashboardApi';
import type { AdminRoleFilter, AdminUserRole } from '../../types/admin';
import type { AdminCourseOverview } from '../../types/dashboard';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
}

type AdminSection = 'courses' | 'users';
type CourseStatusFilter = 'all' | 'published' | 'drafts';
type UserStatusFilter = 'all' | 'active' | 'inactive';

function compact(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: value >= 100000 ? 0 : 1,
  }).format(value);
}

function formatDate(value?: string | null): string {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(date);
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') return fallback;
  const payload = error as {
    data?: { message?: string; error?: string };
    error?: string;
    message?: string;
  };
  return payload.data?.message || payload.data?.error || payload.error || payload.message || fallback;
}

function inferCourseCategory(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('python') || t.includes('react') || t.includes('data') || t.includes('code')) return 'Engineering';
  if (t.includes('design') || t.includes('ux') || t.includes('ui')) return 'Design';
  if (t.includes('business') || t.includes('leadership') || t.includes('brand')) return 'Business';
  return 'General';
}

function estimatePrice(course: AdminCourseOverview): string {
  const seed = course.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const price = 59 + (seed % 6) * 20;
  return `$${price.toFixed(2)}`;
}

function getCourseStatus(course: AdminCourseOverview): 'Published' | 'Pending' | 'Draft' {
  if (course.isArchived) return 'Draft';
  if (course.enrollmentCount === 0) return 'Pending';
  return 'Published';
}

function mapRoleToApi(role: string): AdminRoleFilter | undefined {
  if (role === 'ETUDIANT' || role === 'ENSEIGNANT' || role === 'ADMINISTRATEUR') return role;
  return undefined;
}

function roleLabel(role: AdminUserRole): string {
  if (role === 'admin') return 'Admin';
  if (role === 'teacher') return 'Teacher';
  return 'Student';
}

function roleBadgeClass(role: AdminUserRole): string {
  if (role === 'admin') return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300';
  if (role === 'teacher') return 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
  return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [section, setSection] = useState<AdminSection>('courses');
  const [courseSearch, setCourseSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState<CourseStatusFilter>('all');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState<UserStatusFilter>('all');
  const [userPage, setUserPage] = useState(0);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  const shouldLoad = Boolean(isAuthenticated && user?.role === 'admin');

  const {
    data,
    isLoading: dashboardLoading,
    isFetching: dashboardFetching,
    error: dashboardError,
    refetch,
  } = useGetAdminDashboardQuery(undefined, { skip: !shouldLoad });

  const {
    data: usersPage,
    isLoading: usersLoading,
    isFetching: usersFetching,
    error: usersError,
  } = useGetAdminUsersQuery(
    {
      page: userPage,
      size: 10,
      sortBy: 'dateCreation',
      sortDir: 'DESC',
      role: mapRoleToApi(userRoleFilter),
      actif: userStatusFilter === 'all' ? undefined : userStatusFilter === 'active',
      search: userSearch.trim() || undefined,
    },
    {
      skip: !shouldLoad || section !== 'users',
    },
  );

  const stats = data?.stats;
  const courses = data?.recentCourses || [];
  const users = usersPage?.items || [];

  const filteredCourses = useMemo(() => {
    const q = courseSearch.trim().toLowerCase();
    return courses.filter((course) => {
      const status = getCourseStatus(course);
      const matchesSearch = !q || `${course.title} ${course.teacherName}`.toLowerCase().includes(q);
      const matchesFilter =
        courseFilter === 'all' ||
        (courseFilter === 'published' && status === 'Published') ||
        (courseFilter === 'drafts' && status === 'Draft');
      return matchesSearch && matchesFilter;
    });
  }, [courseFilter, courseSearch, courses]);

  const selectedCount = selectedUsers.size;
  const allUsersSelected = users.length > 0 && users.every((currentUser) => selectedUsers.has(currentUser.id));

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const toggleSelectAllUsers = () => {
    if (allUsersSelected) {
      setSelectedUsers(new Set());
      return;
    }
    setSelectedUsers(new Set(users.map((currentUser) => currentUser.id)));
  };

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f6f8] px-6 dark:bg-[#101622]">
        <div className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Shield className="h-10 w-10 text-[#1152d4]" />
          <h1 className="mt-4 text-2xl font-bold text-slate-950 dark:text-white">Admin access required</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-300">
            Please sign in with an administrator account to access this workspace.
          </p>
          <Button className="mt-6" onClick={() => onNavigate('/auth/signin')}>Sign in</Button>
        </div>
      </div>
    );
  }

  if (!authLoading && isAuthenticated && user?.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f6f8] px-6 dark:bg-[#101622]">
        <div className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <h1 className="mt-4 text-2xl font-bold text-slate-950 dark:text-white">Access denied</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-300">
            This workspace is reserved for administrators.
          </p>
          <Button variant="outline" className="mt-6" onClick={() => onNavigate('/')}>Back to home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f6f6f8] text-slate-900 dark:bg-[#101622] dark:text-slate-100">
      <aside className="fixed h-full w-72 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex h-full flex-col gap-8 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1152d4]/10 text-[#1152d4]"><School className="h-5 w-5" /></div>
            <div>
              <h1 className="text-base font-bold leading-none text-slate-900 dark:text-white">Elegant Academy</h1>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Admin Management</p>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-2">
            <button
              type="button"
              onClick={() => setSection('courses')}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${section === 'courses' ? 'bg-[#1152d4]/10 font-semibold text-[#1152d4]' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}
            >
              <BookOpen className="h-4 w-4" />
              <span className="text-sm">Course Management</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSection('users');
                setSelectedUsers(new Set());
              }}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${section === 'users' ? 'bg-[#1152d4]/10 font-semibold text-[#1152d4]' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}
            >
              <Users className="h-4 w-4" />
              <span className="text-sm">User Management</span>
            </button>
            <span className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-600 dark:text-slate-400"><BarChart3 className="h-4 w-4" />Analytics</span>
            <span className="mt-auto flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-600 dark:text-slate-400"><Settings className="h-4 w-4" />Settings</span>
          </nav>

          <button
            type="button"
            onClick={() => onNavigate('/teacher/course-builder')}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1152d4] py-3 text-sm font-semibold text-white shadow-lg shadow-[#1152d4]/20 transition-all hover:bg-[#0f47b9]"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Course</span>
          </button>
        </div>
      </aside>

      <main className="ml-72 flex-1">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/80 px-8 py-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{section === 'courses' ? 'Course Inventory' : 'User Management'}</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={section === 'courses' ? courseSearch : userSearch}
                onChange={(event) => {
                  if (section === 'courses') setCourseSearch(event.target.value);
                  else {
                    setUserSearch(event.target.value);
                    setUserPage(0);
                  }
                }}
                className="w-64 rounded-xl bg-slate-100 py-2 pl-10 pr-4 text-sm outline-none ring-[#1152d4]/50 transition-all focus:ring-2 dark:bg-slate-800"
                placeholder={section === 'courses' ? 'Search courses, teachers...' : 'Search name, email...'}
                type="text"
              />
            </div>
            <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><Bell className="h-5 w-5" /></button>
          </div>
        </header>

        <div className="space-y-8 p-8">
          {dashboardError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{extractErrorMessage(dashboardError, 'Unable to load admin dashboard data.')}</AlertDescription>
            </Alert>
          )}
          {section === 'courses' ? (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    icon: BookOpen,
                    title: 'Total Courses',
                    value: compact(stats?.totalCourses || 0),
                    meta: '+12%',
                    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
                  },
                  {
                    icon: Hourglass,
                    title: 'Pending Approval',
                    value: compact(courses.filter((course) => getCourseStatus(course) === 'Pending').length),
                    meta: '+5%',
                    color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
                  },
                  {
                    icon: GraduationCap,
                    title: 'Active Students',
                    value: compact(stats?.activeEnrollments || 0),
                    meta: '+18%',
                    color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
                  },
                  {
                    icon: BarChart3,
                    title: 'Course Revenue',
                    value: `$${compact(filteredCourses.reduce((sum, course) => sum + course.enrollmentCount * 49, 0))}`,
                    meta: '+7%',
                    color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
                  },
                ].map((card) => {
                  const Icon = card.icon;
                  return (
                    <div key={card.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                      <div className="mb-4 flex items-center justify-between">
                        <div className={`rounded-lg p-2 ${card.color}`}><Icon className="h-5 w-5" /></div>
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-500 dark:bg-emerald-500/10">{card.meta}</span>
                      </div>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">{card.title}</p>
                      <h3 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{card.value}</h3>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-12 gap-8">
                <section className="col-span-12 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-9">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                      <h4 className="font-bold text-slate-800 dark:text-white">All Courses</h4>
                      <div className="flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
                        <button type="button" onClick={() => setCourseFilter('all')} className={`px-3 py-1.5 text-xs ${courseFilter === 'all' ? 'rounded bg-white font-semibold shadow-sm dark:bg-slate-700' : 'font-medium text-slate-500'}`}>All</button>
                        <button type="button" onClick={() => setCourseFilter('published')} className={`px-3 py-1.5 text-xs ${courseFilter === 'published' ? 'rounded bg-white font-semibold shadow-sm dark:bg-slate-700' : 'font-medium text-slate-500'}`}>Published</button>
                        <button type="button" onClick={() => setCourseFilter('drafts')} className={`px-3 py-1.5 text-xs ${courseFilter === 'drafts' ? 'rounded bg-white font-semibold shadow-sm dark:bg-slate-700' : 'font-medium text-slate-500'}`}>Drafts</button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"><Filter className="h-4 w-4" />Advanced Filters</button>
                      <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"><Download className="h-4 w-4" />Export Report</button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                          <th className="px-6 py-4">Course Info</th>
                          <th className="px-6 py-4">Instructor</th>
                          <th className="px-6 py-4">Category</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-center">Price</th>
                          <th className="px-6 py-4 text-center">Students</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {(dashboardLoading || dashboardFetching) && !data ? (
                          <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">Loading course inventory...</td></tr>
                        ) : filteredCourses.length === 0 ? (
                          <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">No course found with current filters.</td></tr>
                        ) : (
                          filteredCourses.map((course) => {
                            const status = getCourseStatus(course);
                            const statusClass =
                              status === 'Published'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : status === 'Pending'
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-slate-500 dark:text-slate-400';
                            return (
                              <tr key={course.id} className="group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-12 flex-shrink-0 rounded-lg bg-[#1152d4]/20" />
                                    <div>
                                      <p className="text-sm font-bold leading-snug text-slate-900 dark:text-white">{course.title}</p>
                                      <p className="mt-0.5 text-[11px] text-slate-500">Updated {formatDate(course.createdAt)}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">{course.teacherName}</td>
                                <td className="px-6 py-4"><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">{inferCourseCategory(course.title)}</span></td>
                                <td className="px-6 py-4"><span className={`flex items-center gap-1.5 text-xs font-bold ${statusClass}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{status}</span></td>
                                <td className="px-6 py-4 text-center text-sm font-bold">{estimatePrice(course)}</td>
                                <td className="px-6 py-4 text-center text-sm font-medium">{compact(course.enrollmentCount)}</td>
                                <td className="px-6 py-4 text-right"><button className="rounded p-1.5 transition-colors hover:text-[#1152d4]"><MoreVertical className="h-4 w-4" /></button></td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 dark:border-slate-800">
                    <p className="text-xs font-medium text-slate-500">Showing {filteredCourses.length} of {courses.length} recent courses</p>
                    <button type="button" onClick={() => refetch()} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800">Refresh</button>
                  </div>
                </section>
                <aside className="col-span-12 space-y-6 lg:col-span-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-6 flex items-center justify-between">
                      <h4 className="font-bold text-slate-800 dark:text-white">Moderation Queue</h4>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">4 NEW</span>
                    </div>
                    <div className="space-y-4">
                      {[
                        { title: 'Introduction to VR Design', author: 'Alex Thorne' },
                        { title: 'Solidity Smart Contracts', author: 'Sarah Jenkins' },
                        { title: 'Modern Oil Painting', author: 'Marcus V.' },
                      ].map((item) => (
                        <div key={item.title}>
                          <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{item.title}</p>
                          <p className="mt-0.5 text-xs text-slate-500">By {item.author}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <button className="flex-1 rounded-lg bg-emerald-500 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-emerald-600">Approve</button>
                            <button className="flex-1 rounded-lg bg-slate-100 py-1.5 text-[11px] font-bold text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">Reject</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="mt-6 w-full text-sm font-bold text-[#1152d4] hover:underline">View All Queue</button>
                  </div>

                  <div className="rounded-2xl border border-[#1152d4]/20 bg-[#1152d4]/5 p-6 dark:bg-[#1152d4]/10">
                    <h4 className="mb-2 font-bold text-slate-900 dark:text-white">Need help?</h4>
                    <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">Check our administrative guide for course approval standards and compliance.</p>
                    <a className="text-sm font-bold text-[#1152d4]" href="#">Go to Help Center</a>
                  </div>
                </aside>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
                  <p className="text-slate-500 dark:text-slate-400">Manage, monitor, and configure platform access for all users.</p>
                </div>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 font-medium shadow-sm transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"><Download className="h-4 w-4" />Export CSV</button>
                  <button className="flex items-center gap-2 rounded-lg bg-[#1152d4] px-4 py-2 font-medium text-white shadow-lg shadow-[#1152d4]/20 transition-all hover:bg-[#0f47b9]"><UserPlus className="h-4 w-4" />Create User</button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                  { title: 'Total Users', value: compact(stats?.totalUsers || 0), icon: Users },
                  { title: 'Active Now', value: compact(stats?.activeEnrollments || 0), icon: BarChart3 },
                  { title: 'New Signups', value: compact(stats?.monthlyNewUsers || 0), icon: UserPlus },
                  { title: 'Flagged Accounts', value: '14', icon: AlertCircle },
                ].map((card) => {
                  const Icon = card.icon;
                  return (
                    <div key={card.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-[#1152d4] dark:bg-blue-900/20"><Icon className="h-5 w-5" /></div>
                      <p className="text-sm font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">{card.title}</p>
                      <h3 className="mt-1 text-2xl font-bold">{card.value}</h3>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-t-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-6 flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
                  <div className="relative w-full lg:w-96">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      className="w-full rounded-lg bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none ring-[#1152d4]/50 transition-all focus:ring-2 dark:bg-slate-800"
                      placeholder="Search by name, email, or ID..."
                      type="text"
                      value={userSearch}
                      onChange={(event) => {
                        setUserSearch(event.target.value);
                        setUserPage(0);
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      value={userRoleFilter}
                      onChange={(event) => {
                        setUserRoleFilter(event.target.value);
                        setUserPage(0);
                      }}
                      className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold outline-none dark:bg-slate-800"
                    >
                      <option value="all">All Roles</option>
                      <option value="ETUDIANT">Student</option>
                      <option value="ENSEIGNANT">Teacher</option>
                      <option value="ADMINISTRATEUR">Admin</option>
                    </select>
                    <select
                      value={userStatusFilter}
                      onChange={(event) => {
                        setUserStatusFilter(event.target.value as UserStatusFilter);
                        setUserPage(0);
                      }}
                      className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold outline-none dark:bg-slate-800"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {selectedCount > 0 && (
                  <div className="flex items-center justify-between rounded-lg border border-[#1152d4]/10 bg-[#1152d4]/5 px-4 py-3">
                    <span className="text-sm font-medium text-[#1152d4]">{selectedCount} users selected</span>
                    <button type="button" onClick={() => setSelectedUsers(new Set())} className="text-[#1152d4] hover:text-[#0f47b9]"><AlertCircle className="h-4 w-4" /></button>
                  </div>
                )}
              </div>
              <div className="overflow-hidden rounded-b-xl border-x border-b border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                {usersError && (
                  <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{extractErrorMessage(usersError, 'Unable to load users.')}</AlertDescription>
                    </Alert>
                  </div>
                )}

                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-y border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                      <th className="w-10 px-6 py-4">
                        <input checked={allUsersSelected} onChange={toggleSelectAllUsers} className="rounded border-slate-300 text-[#1152d4] focus:ring-[#1152d4]" type="checkbox" />
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">User</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Role</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Joined Date</th>
                      <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(usersLoading || usersFetching) && !usersPage ? (
                      <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">Loading users...</td></tr>
                    ) : users.length === 0 ? (
                      <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">No users found with current filters.</td></tr>
                    ) : (
                      users.map((currentUser) => (
                        <tr key={currentUser.id} className="group transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="px-6 py-4">
                            <input checked={selectedUsers.has(currentUser.id)} onChange={() => toggleUserSelection(currentUser.id)} className="rounded border-slate-300 text-[#1152d4] focus:ring-[#1152d4]" type="checkbox" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {currentUser.avatar ? (
                                <img className="h-9 w-9 rounded-full object-cover" src={currentUser.avatar} alt={currentUser.name} />
                              ) : (
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1152d4]/10 text-xs font-bold text-[#1152d4]">{(currentUser.prenom?.[0] || 'U') + (currentUser.nom?.[0] || '')}</div>
                              )}
                              <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{currentUser.name || currentUser.email}</p>
                                <p className="text-xs text-slate-500">{currentUser.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${roleBadgeClass(currentUser.role)}`}>{roleLabel(currentUser.role)}</span></td>
                          <td className="px-6 py-4"><span className="text-sm font-medium">{currentUser.status === 'active' ? 'Active' : 'Inactive'}</span></td>
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{formatDate(currentUser.joinDate)}</td>
                          <td className="px-6 py-4 text-right"><button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"><MoreVertical className="h-4 w-4" /></button></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                <div className="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
                  <span className="text-sm text-slate-500">Showing {users.length ? userPage * 10 + 1 : 0} to {Math.min((userPage + 1) * 10, usersPage?.totalElements || 0)} of {usersPage?.totalElements || 0} users</span>
                  <div className="flex gap-2">
                    <button type="button" disabled={usersPage ? usersPage.first : userPage === 0} onClick={() => setUserPage((previous) => Math.max(0, previous - 1))} className="rounded border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium transition-colors hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700">Previous</button>
                    <span className="rounded bg-[#1152d4] px-3 py-1 text-sm font-medium text-white">{userPage + 1}</span>
                    <button type="button" disabled={usersPage ? usersPage.last : true} onClick={() => setUserPage((previous) => previous + 1)} className="rounded border border-slate-200 bg-white px-3 py-1 text-sm font-medium transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700">Next</button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
