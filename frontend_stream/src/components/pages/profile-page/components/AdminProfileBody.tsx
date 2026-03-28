import { BarChart3, BookOpen, CalendarDays, MapPin, Shield, User } from "lucide-react";
import { ImageWithFallback } from "../../../figma/ImageWithFallback";
import type { ProfilePageDataModel } from "../useProfilePageData";

interface AdminProfileBodyProps {
  model: ProfilePageDataModel;
  onNavigate: (path: string | number) => void;
  surfaceClass: string;
}

export function AdminProfileBody({ model, onNavigate, surfaceClass }: AdminProfileBodyProps) {
  const {
    role,
    avatarUrl,
    fullName,
    initials,
    roleSubtitle,
    profileLocation,
    joinedOn,
    adminDashboard,
    adminRecentCourses,
    adminRecentInscriptions,
  } = model;

  return (
    role === 'admin' ? (
      <div className="app-profile-page admin-profile-layout mx-auto w-full max-w-6xl space-y-8">
        <section className={`admin-profile-hero p-6 md:p-8 ${surfaceClass}`}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-5">
              <div className="relative h-24 w-24 shrink-0">
                {avatarUrl ? (
                  <ImageWithFallback
                    alt={fullName}
                    className="h-full w-full rounded-2xl border-4 border-white object-cover shadow-xl dark:border-slate-900"
                    src={avatarUrl}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-2xl border-4 border-white bg-[#1152d4]/12 text-2xl font-black text-[#1152d4] shadow-xl dark:border-slate-900">
                    {initials}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-4 border-white bg-emerald-500 dark:border-slate-900" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1152d4]">Administration Profile</p>
                <h1 className="mt-1 truncate text-2xl font-black text-slate-900 dark:text-slate-100">{fullName}</h1>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-300">{roleSubtitle}</p>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-300">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {profileLocation}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Joined {joinedOn}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:w-[420px]">
              <button
                className="inline-flex items-center justify-center rounded-xl bg-[#1152d4] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#1152d4]/20 transition hover:bg-[#0f47b9]"
                onClick={() => onNavigate('/admin/users')}
                type="button"
              >
                Manage Users
              </button>
              <button
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#1152d4] hover:text-[#1152d4] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                onClick={() => onNavigate('/admin/support')}
                type="button"
              >
                Support Desk
              </button>
              <button
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#1152d4] hover:text-[#1152d4] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 sm:col-span-2"
                onClick={() => onNavigate('/admin/courses')}
                type="button"
              >
                Course Governance
              </button>
            </div>
          </div>
        </section>

        <section className="admin-profile-kpi-grid grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: 'Total Users',
              value: (adminDashboard?.stats.totalUsers || 0).toLocaleString('en-US'),
              helper: `${(adminDashboard?.stats.monthlyNewUsers || 0).toLocaleString('en-US')} joined this month`,
              icon: User,
            },
            {
              label: 'Courses',
              value: (adminDashboard?.stats.totalCourses || 0).toLocaleString('en-US'),
              helper: `${(adminDashboard?.stats.activeCourses || 0).toLocaleString('en-US')} active right now`,
              icon: BookOpen,
            },
            {
              label: 'Live Sessions',
              value: (adminDashboard?.stats.liveSessions || 0).toLocaleString('en-US'),
              helper: `${(adminDashboard?.stats.totalSessions || 0).toLocaleString('en-US')} scheduled overall`,
              icon: CalendarDays,
            },
            {
              label: 'Completion Rate',
              value: `${Math.round(adminDashboard?.stats.averageCompletionRate || 0)}%`,
              helper: `${Math.round(adminDashboard?.stats.averageCourseRating || 0)} avg rating`,
              icon: BarChart3,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <article className={`admin-profile-kpi-card p-5 ${surfaceClass}`} key={item.label}>
                <div className="mb-4 flex items-center justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#1152d4]/10 text-[#1152d4]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                    Live
                  </span>
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{item.label}</p>
                <p className="mt-2 text-3xl font-black leading-none text-slate-900 dark:text-slate-100">{item.value}</p>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-300">{item.helper}</p>
              </article>
            );
          })}
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <section className={`admin-profile-panel p-6 xl:col-span-2 ${surfaceClass}`}>
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Access &amp; Governance</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                  Operational controls connected to your live admin backend.
                </p>
              </div>
              <Shield className="h-8 w-8 text-[#1152d4]/45" />
            </div>

            <div className="space-y-4">
              {[
                {
                  title: 'User Governance',
                  description: `${(adminDashboard?.stats.totalStudents || 0).toLocaleString('en-US')} students, ${(adminDashboard?.stats.totalTeachers || 0).toLocaleString('en-US')} teachers, ${(adminDashboard?.stats.totalAdmins || 0).toLocaleString('en-US')} admins`,
                  progress: adminDashboard?.stats.totalUsers
                    ? Math.min(100, Math.round(((adminDashboard?.stats.totalTeachers || 0) / adminDashboard.stats.totalUsers) * 100))
                    : 0,
                },
                {
                  title: 'Course Lifecycle',
                  description: `${(adminDashboard?.stats.activeCourses || 0).toLocaleString('en-US')} active and ${(adminDashboard?.stats.archivedCourses || 0).toLocaleString('en-US')} archived courses`,
                  progress: adminDashboard?.stats.totalCourses
                    ? Math.min(100, Math.round(((adminDashboard?.stats.activeCourses || 0) / adminDashboard.stats.totalCourses) * 100))
                    : 0,
                },
                {
                  title: 'Enrollment Throughput',
                  description: `${(adminDashboard?.stats.activeEnrollments || 0).toLocaleString('en-US')} active over ${(adminDashboard?.stats.totalEnrollments || 0).toLocaleString('en-US')} total enrollments`,
                  progress: adminDashboard?.stats.totalEnrollments
                    ? Math.min(100, Math.round(((adminDashboard?.stats.activeEnrollments || 0) / adminDashboard.stats.totalEnrollments) * 100))
                    : 0,
                },
              ].map((item) => (
                <article className="admin-profile-control-row rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/70" key={item.title}>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{item.title}</h3>
                    <span className="text-xs font-bold text-[#1152d4]">{item.progress}%</span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-300">{item.description}</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <div className="h-full rounded-full bg-[#1152d4]" style={{ width: `${item.progress}%` }} />
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className={`admin-profile-panel p-6 ${surfaceClass}`}>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Control Summary</h3>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Monthly Enrollments</p>
                <p className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">
                  {(adminDashboard?.stats.monthlyEnrollments || 0).toLocaleString('en-US')}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Completion Baseline</p>
                <p className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">
                  {Math.round(adminDashboard?.stats.averageCompletionRate || 0)}%
                </p>
              </div>
              <button
                className="inline-flex w-full items-center justify-center rounded-xl bg-[#1152d4] py-3 text-sm font-bold text-white shadow-lg shadow-[#1152d4]/20 transition hover:bg-[#0f47b9]"
                onClick={() => onNavigate('/admin/dashboard')}
                type="button"
              >
                Open full dashboard
              </button>
            </div>
          </aside>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <section className={`admin-profile-panel p-6 ${surfaceClass}`}>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Recent Courses</h3>
              <button className="text-sm font-semibold text-[#1152d4] hover:underline" onClick={() => onNavigate('/admin/courses')} type="button">
                View all
              </button>
            </div>
            <div className="space-y-3">
              {adminRecentCourses.length > 0 ? (
                adminRecentCourses.map((course) => (
                  <article className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/70" key={course.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="truncate font-semibold text-slate-900 dark:text-slate-100">{course.title}</h4>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{course.teacherName}</p>
                      </div>
                      <span className="rounded-full bg-[#1152d4]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#1152d4]">
                        {course.isArchived ? 'Archived' : 'Active'}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-500 dark:text-slate-300">
                      <span>{course.enrollmentCount} students</span>
                      <span>{Math.round(course.completionRate)}% completion</span>
                      <span>{course.averageRating.toFixed(1)} rating</span>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-300">
                  No recent courses available from backend right now.
                </div>
              )}
            </div>
          </section>

          <section className={`admin-profile-panel p-6 ${surfaceClass}`}>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Recent Enrollments</h3>
              <button className="text-sm font-semibold text-[#1152d4] hover:underline" onClick={() => onNavigate('/admin/dashboard')} type="button">
                Open activity
              </button>
            </div>
            <div className="space-y-3">
              {adminRecentInscriptions.length > 0 ? (
                adminRecentInscriptions.map((item) => (
                  <article className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/70" key={item.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{item.studentName}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-300">{item.courseTitle}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {item.status}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-300">
                      <span>{item.teacherName}</span>
                      <span>{Math.round(item.progress)}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <div className="h-full rounded-full bg-[#1152d4]" style={{ width: `${Math.min(100, Math.max(0, Math.round(item.progress)))}%` }} />
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-300">
                  No recent enrollment events available right now.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    ) : null
  );
}
