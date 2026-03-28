import { BarChart3, BookOpen, CheckCircle2, GraduationCap, Link as LinkIcon, Mail } from "lucide-react";
import { ImageWithFallback } from "../../../figma/ImageWithFallback";
import { activityDescription, badgeIcons, formatDate } from "../profilePage.utils";
import type { ProfilePageDataModel } from "../useProfilePageData";

interface ProfileOverviewBodyProps {
  model: ProfilePageDataModel;
  onNavigate: (path: string | number) => void;
  surfaceClass: string;
}

export function ProfileOverviewBody({ model, onNavigate, surfaceClass }: ProfileOverviewBodyProps) {
  const {
    role,
    fullName,
    avatarUrl,
    initials,
    roleSubtitle,
    metrics,
    teacherPublicProfilePath,
    skillBadges,
    completedCourses,
    inProgressCourses,
    activityFeed,
    teacherCourses,
    teacherSessions,
    adminRecentCourses,
    adminDashboard,
  } = model;

  return (
    <div className="app-profile-page profile-content-grid grid grid-cols-1 gap-8 lg:grid-cols-12">
      <aside className="profile-aside space-y-6 lg:col-span-4">
        <div className={`profile-identity-card overflow-hidden ${surfaceClass}`}>
          <div className="h-24 bg-gradient-to-r from-[#1152d4]/25 via-sky-400/20 to-cyan-300/10 dark:from-[#1152d4]/30 dark:via-sky-500/15 dark:to-cyan-400/10" />
          <div className="-mt-12 px-7 pb-7">
            <div className="relative mx-auto mb-5 h-24 w-24">
              {avatarUrl ? (
                <ImageWithFallback
                  alt={fullName}
                  className="h-full w-full rounded-full border-4 border-white object-cover shadow-lg dark:border-slate-900"
                  src={avatarUrl}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full border-4 border-white bg-[#1152d4]/10 text-2xl font-bold text-[#1152d4] shadow-lg dark:border-slate-900">
                  {initials}
                </div>
              )}
              <span className="absolute bottom-0 right-0 h-5 w-5 rounded-full border-[3px] border-white bg-emerald-500 dark:border-slate-900" />
            </div>

            <div className="text-center">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{fullName}</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{roleSubtitle}</p>
              <span className="mt-3 inline-flex rounded-full border border-[#1152d4]/20 bg-[#1152d4]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#1152d4]">
                {role === 'teacher' ? 'Instructor Account' : role === 'admin' ? 'Admin Account' : 'Student Account'}
              </span>
            </div>

            <p className="mt-4 text-center text-sm leading-relaxed text-slate-500 dark:text-slate-300">
              {role === 'teacher'
                ? 'Public instructor identity connected to your live backend profile and published courses.'
                : role === 'admin'
                  ? 'Administration profile synchronized with platform analytics.'
                  : 'Learning portfolio synchronized with your student dashboard.'}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 text-center dark:border-slate-800 dark:bg-slate-950/70">
                <p className="text-lg font-bold text-slate-900 dark:text-white">{metrics[0]?.value || '0'}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{metrics[0]?.label || 'Primary'}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 text-center dark:border-slate-800 dark:bg-slate-950/70">
                <p className="text-lg font-bold text-slate-900 dark:text-white">{metrics[1]?.value || '0'}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{metrics[1]?.label || 'Secondary'}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <button
                className="w-full cursor-pointer rounded-xl bg-[#1152d4] py-3 text-sm font-semibold text-white shadow-lg shadow-[#1152d4]/20 transition hover:bg-[#0f47b9]"
                onClick={() => onNavigate('/settings')}
                type="button"
              >
                Manage profile
              </button>
              {teacherPublicProfilePath ? (
                <button
                  className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:border-[#1152d4] hover:text-[#1152d4] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  onClick={() => onNavigate(teacherPublicProfilePath)}
                  type="button"
                >
                  View public profile
                </button>
              ) : null}
            </div>

            <div className="mt-5 flex justify-center gap-3">
              <button className="cursor-pointer rounded-lg bg-slate-100 p-2 text-slate-600 transition hover:bg-[#1152d4]/10 hover:text-[#1152d4] dark:bg-slate-800 dark:text-slate-300" type="button">
                <LinkIcon className="h-4 w-4" />
              </button>
              <button className="cursor-pointer rounded-lg bg-slate-100 p-2 text-slate-600 transition hover:bg-[#1152d4]/10 hover:text-[#1152d4] dark:bg-slate-800 dark:text-slate-300" type="button">
                <Mail className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className={`p-6 ${surfaceClass}`}>
          <h3 className="mb-6 text-sm font-bold uppercase tracking-[0.16em] text-slate-900 dark:text-white">Skill Badges</h3>
          <div className="grid grid-cols-3 gap-4">
            {skillBadges.map((badge, index) => {
              const Icon = badgeIcons[index % badgeIcons.length];
              return (
                <div className="flex flex-col items-center gap-2 text-center" key={badge}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1152d4]/10 text-[#1152d4]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-tight text-slate-500 dark:text-slate-300">{badge}</span>
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      <div className="space-y-8 lg:col-span-8">
        <div className="profile-metrics-row grid grid-cols-1 gap-4 md:grid-cols-3">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div className={`profile-metric-card flex items-center gap-4 p-6 transition hover:-translate-y-0.5 hover:shadow-md ${surfaceClass}`} key={metric.label}>
                <div className="rounded-xl bg-[#1152d4]/10 p-3">
                  <Icon className="h-5 w-5 text-[#1152d4]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{metric.value}</div>
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">{metric.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {role === 'student' ? (
          <>
            <section>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xl font-bold dark:text-white">
                  <CheckCircle2 className="h-5 w-5 text-[#1152d4]" />
                  Verified Certificates
                </h2>
                <button className="text-sm font-semibold text-[#1152d4] hover:underline" onClick={() => onNavigate('/catalog')} type="button">
                  View All
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {completedCourses.length > 0 ? (
                  completedCourses.map((course) => (
                    <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white transition-all hover:shadow-xl hover:shadow-[#1152d4]/5 dark:border-slate-800 dark:bg-slate-900" key={course.id}>
                      <div className="relative h-40 bg-slate-100 dark:bg-slate-800">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1152d4]/20 to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex h-32 w-48 flex-col justify-between rounded border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-950">
                            <div className="flex items-start justify-between">
                              <GraduationCap className="h-3 w-3 text-[#1152d4]" />
                              <span className="font-mono text-[8px] text-slate-400">ID: CERT-{course.id}</span>
                            </div>
                            <div>
                              <div className="text-[10px] font-bold leading-tight text-slate-900 dark:text-white">{course.title}</div>
                              <div className="text-[8px] text-slate-500 dark:text-slate-300">{fullName}</div>
                            </div>
                            <div className="flex items-end justify-between border-t border-slate-100 pt-1 dark:border-slate-800">
                              <span className="text-[6px] uppercase text-slate-400">EduElevate Academic</span>
                              <CheckCircle2 className="h-[10px] w-[10px] text-emerald-500" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-5">
                        <h3 className="mb-1 font-bold text-slate-900 dark:text-white">{course.title}</h3>
                        <p className="mb-4 text-xs text-slate-500 dark:text-slate-300">Completed: {formatDate(course.scheduledAt || course.enrolledAt)}</p>
                        <button className="text-xs font-bold text-[#1152d4]" onClick={() => onNavigate(`/courses/${course.id}`)} type="button">
                          VIEW CREDENTIAL
                        </button>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 md:col-span-2">
                    No completed course yet. Finish a course to unlock your first verified credential card.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[28px] border border-[#1152d4]/10 bg-[#1152d4]/5 p-8 dark:border-[#203049] dark:bg-[#101a2d]/90">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold dark:text-white">Currently Learning</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Courses in progress</p>
                </div>
                <BookOpen className="h-9 w-9 text-[#1152d4]/40" />
              </div>

              <div className="space-y-4">
                {inProgressCourses.length > 0 ? (
                  inProgressCourses.map((course) => (
                    <div className="rounded-[24px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900" key={course.id}>
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300">
                            <BookOpen className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white">{course.title}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-300">Category: {course.category}</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-[#1152d4]">{course.progress}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div className="h-full rounded-full bg-[#1152d4]" style={{ width: `${Math.min(100, Math.max(0, course.progress))}%` }} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    You do not have an active course right now.
                  </div>
                )}
              </div>
            </section>

            <section>
              <h2 className="mb-6 text-xl font-bold dark:text-white">Learning Activity</h2>
              <div className="space-y-6">
                {activityFeed.length > 0 ? (
                  <div className="relative pl-8 before:absolute before:bottom-0 before:left-3 before:top-2 before:w-0.5 before:bg-slate-200 before:content-[''] dark:before:bg-slate-800">
                    {activityFeed.map((activityItem, index) => (
                      <div className="relative mb-8 last:mb-0" key={activityItem.id}>
                        <span className={`absolute -left-[26px] top-0 h-4 w-4 rounded-full border-4 border-white dark:border-slate-900 ${index === 0 ? 'bg-[#1152d4]' : 'bg-slate-300 dark:bg-slate-700'}`} />
                        <div className="mb-1 text-sm text-slate-500 dark:text-slate-300">{formatDate(activityItem.occurredAt)}</div>
                        <p className="text-slate-800 dark:text-slate-200">
                          {activityDescription(activityItem.type, activityItem.title, activityItem.details)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    No recent activity yet.
                  </div>
                )}
              </div>
            </section>
          </>
        ) : role === 'teacher' ? (
          <>
            <section className={`p-8 ${surfaceClass}`}>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Published Courses</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Your current teaching catalogue</p>
                </div>
                <BookOpen className="h-9 w-9 text-[#1152d4]/40" />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {teacherCourses.length > 0 ? (
                  teacherCourses.map((course) => (
                    <article className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-950/70" key={course.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white">{course.title}</h3>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#1152d4]">{course.category}</p>
                        </div>
                        <span className="rounded-full bg-[#1152d4]/10 px-3 py-1 text-xs font-bold text-[#1152d4]">
                          {Math.round(course.completionRate)}%
                        </span>
                      </div>
                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-[#1152d4]"
                          style={{ width: `${Math.min(100, Math.max(0, Math.round(course.completionRate)))}%` }}
                        />
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-slate-500 dark:text-slate-400">Students</p>
                          <p className="mt-1 font-semibold text-slate-900 dark:text-white">{course.enrollments}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 dark:text-slate-400">Sessions</p>
                          <p className="mt-1 font-semibold text-slate-900 dark:text-white">{course.sessions}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 dark:text-slate-400">Next</p>
                          <p className="mt-1 font-semibold text-slate-900 dark:text-white">{formatDate(course.nextSessionAt)}</p>
                        </div>
                      </div>
                      <button
                        className="mt-5 inline-flex cursor-pointer items-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#1152d4] hover:text-[#1152d4] dark:border-slate-700 dark:text-slate-200"
                        onClick={() => onNavigate(`/courses/${course.id}`)}
                        type="button"
                      >
                        Open course
                      </button>
                    </article>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/70 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-300 md:col-span-2">
                    No course has been published yet.
                  </div>
                )}
              </div>
            </section>

            <section className={`p-8 ${surfaceClass}`}>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Upcoming Sessions</h2>
                <button className="cursor-pointer text-sm font-semibold text-[#1152d4] hover:underline" onClick={() => onNavigate('/teacher/live-sessions')} type="button">
                  Open live manager
                </button>
              </div>

              <div className="space-y-3">
                {teacherSessions.length > 0 ? (
                  teacherSessions.map((session, index) => (
                    <div className="relative overflow-hidden rounded-[22px] border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-950/70" key={session.id}>
                      <span className="absolute left-0 top-0 h-full w-1 bg-[#1152d4]/70" />
                      <div className="flex flex-col gap-3 pl-3 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1152d4]">Session {index + 1}</p>
                          <h3 className="font-bold text-slate-900 dark:text-white">{session.courseTitle}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-300">
                            {formatDate(session.startAt)}
                          </p>
                        </div>
                        <span className="rounded-full bg-[#1152d4]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#1152d4]">
                          {session.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/70 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-300">
                    <p>No scheduled session yet.</p>
                    <button
                      className="mt-3 cursor-pointer rounded-lg bg-[#1152d4] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0f47b9]"
                      onClick={() => onNavigate('/teacher/live-session-builder')}
                      type="button"
                    >
                      Create a live session
                    </button>
                  </div>
                )}
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="rounded-[28px] border border-[#1152d4]/10 bg-[#1152d4]/5 p-8 dark:border-[#203049] dark:bg-[#101a2d]/90">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold dark:text-white">Platform Overview</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Operational snapshot connected to the admin backend</p>
                </div>
                <BarChart3 className="h-9 w-9 text-[#1152d4]/40" />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {[
                  { label: 'Users', value: String(adminDashboard?.stats.totalUsers || 0) },
                  { label: 'Active Courses', value: String(adminDashboard?.stats.activeCourses || 0) },
                  { label: 'Live Sessions', value: String(adminDashboard?.stats.liveSessions || 0) },
                ].map((item) => (
                  <div className="rounded-[24px] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900" key={item.label}>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">{item.label}</p>
                    <p className="mt-3 text-2xl font-black text-slate-900 dark:text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold dark:text-white">Recent Courses</h2>
                <button className="text-sm font-semibold text-[#1152d4] hover:underline" onClick={() => onNavigate('/admin/courses')} type="button">
                  Open course management
                </button>
              </div>

              <div className="space-y-4">
                {adminRecentCourses.length > 0 ? (
                  adminRecentCourses.map((course) => (
                    <div className="rounded-[24px] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900" key={course.id}>
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white">{course.title}</h3>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                            {course.teacherName} - {course.enrollmentCount} students - {course.averageRating.toFixed(2)} rating
                          </p>
                        </div>
                        <span className="rounded-full bg-[#1152d4]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#1152d4]">
                          {course.isArchived ? 'Archived' : 'Active'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    No recent course data available.
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
