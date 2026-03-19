import { useMemo } from 'react';
import {
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Flame,
  GraduationCap,
  Layers,
  Link as LinkIcon,
  Mail,
  Sparkles,
  Star,
  User,
} from 'lucide-react';
import { useAppSelector } from '../../hooks/redux';
import { normalizeUserRole } from '../../lib/roleUtils';
import {
  useGetProfileQuery,
  useGetStudentLevelQuery,
  useGetTeacherSpecialtyQuery,
  useGetUnreadNotificationCountQuery,
} from '../../store/api/userApi';
import {
  useGetAdminDashboardQuery,
  useGetStudentDashboardQuery,
  useGetTeacherDashboardQuery,
} from '../../store/api/dashboardApi';
import {
  AdminSpaceShell,
  AdminSpaceStatus,
  useAdminSpaceData,
} from '../admin/AdminSpaceShared';
import {
  StudentSpaceShell,
} from '../student/StudentSpaceShared';
import {
  TeacherSpaceShell,
  TeacherSpaceStatus,
  useTeacherSpaceData,
} from '../teacher/TeacherSpaceShared';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface ProfilePageProps {
  onNavigate: (path: string | number) => void;
  currentPath?: string;
}

interface MetricCard {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
}

function getInitials(firstName?: string, lastName?: string): string {
  const first = firstName?.trim().charAt(0) || '';
  const last = lastName?.trim().charAt(0) || '';
  const initials = `${first}${last}`.toUpperCase();
  return initials || 'U';
}

function normalizeStatus(value?: string | null): string {
  return (value || '').trim().toUpperCase();
}

function formatDate(value?: string | null): string {
  if (!value) {
    return 'N/A';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'N/A';
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed);
}

function activityDescription(type: string, title: string, details?: string): string {
  const normalizedType = (type || '').toLowerCase();
  if (normalizedType === 'completed') {
    return `Completed ${title}`;
  }
  if (normalizedType === 'enrolled') {
    return `Enrolled in ${title}`;
  }
  if (normalizedType === 'session') {
    return `Joined a live session: ${title}`;
  }
  if (normalizedType === 'progress') {
    return `Progress update: ${title}`;
  }
  return details || title;
}

const badgeIcons = [Sparkles, Layers, BookOpen, Star, Award];

export function ProfilePage({ onNavigate, currentPath }: ProfilePageProps) {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const teacherShared = useTeacherSpaceData();
  const adminShared = useAdminSpaceData({ includeDashboard: false });

  const { data: profile, isLoading: profileLoading, error: profileError } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated,
  });

  const role = normalizeUserRole(profile?.role || user?.role);

  const { data: studentLevel } = useGetStudentLevelQuery(undefined, {
    skip: !profile || role !== 'student' || Boolean(profile.niveau),
  });

  const { data: teacherSpecialty } = useGetTeacherSpecialtyQuery(undefined, {
    skip: !profile || role !== 'teacher' || Boolean(profile.specialite),
  });

  const { data: studentDashboard, isLoading: studentLoading } = useGetStudentDashboardQuery(undefined, {
    skip: !profile || role !== 'student',
  });

  const { data: teacherDashboard, isLoading: teacherLoading } = useGetTeacherDashboardQuery(undefined, {
    skip: !profile || role !== 'teacher',
  });

  const { data: adminDashboard, isLoading: adminLoading } = useGetAdminDashboardQuery(undefined, {
    skip: !profile || role !== 'admin',
  });
  const { data: unreadCount = 0 } = useGetUnreadNotificationCountQuery(undefined, {
    skip: !isAuthenticated || role !== 'student',
  });

  const fullName = `${profile?.firstName || user?.firstName || ''} ${profile?.lastName || user?.lastName || ''}`.trim() || 'Learner';
  const avatarUrl = profile?.avatar || user?.avatar || '';
  const initials = getInitials(profile?.firstName || user?.firstName, profile?.lastName || user?.lastName);

  const roleSubtitle = useMemo(() => {
    if (role === 'teacher') {
      return profile?.specialite || teacherSpecialty || 'Instructor profile';
    }
    if (role === 'admin') {
      return 'Platform administration';
    }
    return profile?.niveau || studentLevel || 'Student profile';
  }, [profile?.niveau, profile?.specialite, role, studentLevel, teacherSpecialty]);

  const metrics = useMemo<MetricCard[]>(() => {
    if (role === 'teacher' && teacherDashboard) {
      return [
        { icon: GraduationCap, value: String(teacherDashboard.stats.totalCourses), label: 'Courses Published' },
        { icon: User, value: String(teacherDashboard.stats.totalStudents), label: 'Students Reached' },
        { icon: BarChart3, value: `${teacherDashboard.stats.averageCompletionRate}%`, label: 'Completion Rate' },
      ];
    }

    if (role === 'admin' && adminDashboard) {
      return [
        { icon: User, value: String(adminDashboard.stats.totalUsers), label: 'Total Users' },
        { icon: GraduationCap, value: String(adminDashboard.stats.totalCourses), label: 'Courses' },
        { icon: BarChart3, value: `${adminDashboard.stats.averageCompletionRate}%`, label: 'Completion Rate' },
      ];
    }

    if (studentDashboard) {
      const uniqueSkills = new Set(studentDashboard.courses.map((course) => course.category).filter(Boolean));
      return [
        { icon: Award, value: String(studentDashboard.stats.completedCourses), label: 'Courses Done' },
        { icon: Star, value: String(uniqueSkills.size), label: 'Skills Earned' },
        { icon: Flame, value: String(studentDashboard.stats.activeCourses), label: 'Active Courses' },
      ];
    }

    return [
      { icon: GraduationCap, value: '0', label: 'Courses Done' },
      { icon: Star, value: '0', label: 'Skills Earned' },
      { icon: Flame, value: '0', label: 'Active Courses' },
    ];
  }, [adminDashboard, role, studentDashboard, teacherDashboard]);

  const completedCourses = useMemo(() => {
    if (!studentDashboard) {
      return [];
    }
    return studentDashboard.courses
      .filter((course) => normalizeStatus(course.status) === 'TERMINE' || course.progress >= 100)
      .slice(0, 2);
  }, [studentDashboard]);

  const inProgressCourses = useMemo(() => {
    if (!studentDashboard) {
      return [];
    }
    return studentDashboard.courses
      .filter((course) => normalizeStatus(course.status) !== 'TERMINE' && course.progress < 100)
      .slice(0, 2);
  }, [studentDashboard]);

  const skillBadges = useMemo(() => {
    if (studentDashboard && studentDashboard.courses.length > 0) {
      return Array.from(new Set(studentDashboard.courses.map((course) => course.category).filter(Boolean))).slice(0, 5);
    }

    if (role === 'teacher') {
      return [profile?.specialite || teacherSpecialty || 'Mentorship'];
    }

    if (role === 'admin') {
      return ['Operations', 'Monitoring', 'Security'];
    }

    return [profile?.niveau || studentLevel || 'Learning'];
  }, [profile?.niveau, profile?.specialite, role, studentDashboard, studentLevel, teacherSpecialty]);

  const activityFeed = useMemo(() => {
    if (!studentDashboard?.recentActivity?.length) {
      return [];
    }
    return studentDashboard.recentActivity.slice(0, 3);
  }, [studentDashboard]);
  const teacherCourses = teacherDashboard?.courses.slice(0, 4) || [];
  const teacherSessions = teacherDashboard?.upcomingSessions.slice(0, 4) || [];
  const adminRecentCourses = adminDashboard?.recentCourses.slice(0, 4) || [];

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="text-slate-600">Please sign in to view your profile.</p>
        <button
          className="mt-4 rounded-lg bg-[#1152d4] px-5 py-2 text-sm font-semibold text-white"
          onClick={() => onNavigate('/auth/signin')}
          type="button"
        >
          Go to sign in
        </button>
      </div>
    );
  }

  if (profileLoading || studentLoading || teacherLoading || adminLoading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="text-slate-600">Loading profile...</p>
      </div>
    );
  }

  if (!profile || profileError) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="text-slate-600">Unable to load profile data.</p>
      </div>
    );
  }

  const profileBody = (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <aside className="space-y-6 lg:col-span-4">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="relative mx-auto mb-6 h-32 w-32">
            {avatarUrl ? (
              <ImageWithFallback
                alt={fullName}
                className="h-full w-full rounded-full border-4 border-white object-cover shadow-lg dark:border-slate-900"
                src={avatarUrl}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full border-4 border-white bg-[#1152d4]/10 text-3xl font-bold text-[#1152d4] shadow-lg dark:border-slate-900">
                {initials}
              </div>
            )}
            <span className="absolute bottom-1 right-1 h-6 w-6 rounded-full border-4 border-white bg-emerald-500 dark:border-slate-900" />
          </div>

          <h1 className="text-2xl font-bold dark:text-white">{fullName}</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{roleSubtitle}</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-300">
            {role === 'teacher'
              ? 'Public instructor identity connected to your live backend profile and published courses.'
              : role === 'admin'
                ? 'Administration profile synchronized with platform analytics.'
                : 'Learning portfolio synchronized with your student dashboard.'}
          </p>

          <div className="mt-6 flex justify-center gap-4">
            <button className="rounded-lg bg-slate-100 p-2 text-slate-600 transition hover:bg-[#1152d4]/10 hover:text-[#1152d4] dark:bg-slate-800 dark:text-slate-300" type="button">
              <LinkIcon className="h-4 w-4" />
            </button>
            <button className="rounded-lg bg-slate-100 p-2 text-slate-600 transition hover:bg-[#1152d4]/10 hover:text-[#1152d4] dark:bg-slate-800 dark:text-slate-300" type="button">
              <Mail className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-100 pt-8 dark:border-slate-800">
            <div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">{metrics[0]?.value || '0'}</div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{metrics[0]?.label || 'Primary'}</div>
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">{metrics[1]?.value || '0'}</div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{metrics[1]?.label || 'Secondary'}</div>
            </div>
          </div>

          <button
            className="mt-8 w-full rounded-lg bg-[#1152d4] py-3 text-sm font-semibold text-white shadow-lg shadow-[#1152d4]/20 transition hover:opacity-90"
            onClick={() => onNavigate('/settings')}
            type="button"
          >
            Manage profile
          </button>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-6 text-sm font-bold uppercase tracking-[0.16em] text-slate-900 dark:text-white">Skill Badges</h3>
          <div className="grid grid-cols-3 gap-4">
            {skillBadges.map((badge, index) => {
              const Icon = badgeIcons[index % badgeIcons.length];
              return (
                <div className="flex flex-col items-center gap-2" key={badge}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1152d4]/10 text-[#1152d4]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-center text-[10px] font-bold uppercase tracking-tight text-slate-500 dark:text-slate-300">{badge}</span>
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      <div className="space-y-8 lg:col-span-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div className="flex items-center gap-4 rounded-[28px] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900" key={metric.label}>
                <div className="rounded-lg bg-[#1152d4]/10 p-3">
                  <Icon className="h-5 w-5 text-[#1152d4]" />
                </div>
                <div>
                  <div className="text-2xl font-bold dark:text-white">{metric.value}</div>
                  <div className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-300">{metric.label}</div>
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
            <section className="rounded-[28px] border border-[#1152d4]/10 bg-[#1152d4]/5 p-8 dark:border-[#203049] dark:bg-[#101a2d]/90">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold dark:text-white">Published Courses</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Your current teaching catalogue</p>
                </div>
                <BookOpen className="h-9 w-9 text-[#1152d4]/40" />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {teacherCourses.length > 0 ? (
                  teacherCourses.map((course) => (
                    <article className="rounded-[24px] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900" key={course.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white">{course.title}</h3>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#1152d4]">{course.category}</p>
                        </div>
                        <span className="rounded-full bg-[#1152d4]/10 px-3 py-1 text-xs font-bold text-[#1152d4]">
                          {Math.round(course.completionRate)}%
                        </span>
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
                    </article>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 md:col-span-2">
                    No course has been published yet.
                  </div>
                )}
              </div>
            </section>

            <section>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold dark:text-white">Upcoming Sessions</h2>
                <button className="text-sm font-semibold text-[#1152d4] hover:underline" onClick={() => onNavigate('/teacher/live-sessions')} type="button">
                  Open live manager
                </button>
              </div>

              <div className="space-y-4">
                {teacherSessions.length > 0 ? (
                  teacherSessions.map((session) => (
                    <div className="rounded-[24px] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900" key={session.id}>
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white">{session.courseTitle}</h3>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                            {formatDate(session.startAt)}
                          </p>
                        </div>
                        <span className="rounded-full bg-[#1152d4]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#1152d4]">
                          {session.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    No scheduled session yet.
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

  if (role === 'student') {
    return (
      <StudentSpaceShell
        currentPath={currentPath}
        onNavigate={onNavigate}
        showSearch={false}
        headerTitle="My Profile"
        headerDescription="Retrouvez vos indicateurs, certificats et votre progression dans un profil etudiant aligne avec le reste de votre espace."
        displayName={fullName}
        displayLevel={roleSubtitle}
        initials={initials}
        avatarUrl={avatarUrl || null}
        goalProgress={studentDashboard?.stats.averageProgress || 0}
        unreadCount={unreadCount}
      >
        {profileBody}
      </StudentSpaceShell>
    );
  }

  if (role === 'teacher') {
    if (teacherShared.status !== 'ready') {
      return <TeacherSpaceStatus shared={teacherShared} />;
    }

    return (
      <TeacherSpaceShell
        currentPath={currentPath}
        onNavigate={onNavigate}
        showSearch={false}
        headerTitle="Teacher Profile"
        headerDescription="Retrouvez vos indicateurs de cours, vos sessions a venir et votre identite publique dans un profil aligne avec le reste de votre espace enseignant."
        displayName={teacherShared.displayName}
        displayRole={teacherShared.displayRole}
        initials={teacherShared.initials}
        avatarUrl={teacherShared.avatarUrl}
        activeCourseCount={teacherShared.activeCourseCount}
        liveSessions={teacherShared.liveSessions}
        unreadCount={teacherShared.unreadCount}
      >
        {profileBody}
      </TeacherSpaceShell>
    );
  }

  if (role === 'admin') {
    if (adminShared.status !== 'ready') {
      return <AdminSpaceStatus shared={adminShared} />;
    }

    return (
      <AdminSpaceShell
        currentPath={currentPath}
        onNavigate={onNavigate}
        showSearch={false}
        headerTitle="Admin Profile"
        headerDescription="Conservez votre identite d administration et vos indicateurs de plateforme dans le meme cadre que le reste de votre espace admin."
        displayName={adminShared.displayName}
        displayRole={adminShared.displayRole}
        initials={adminShared.initials}
        avatarUrl={adminShared.avatarUrl}
        unreadCount={adminShared.unreadCount}
      >
        {profileBody}
      </AdminSpaceShell>
    );
  }

  return <div className="mx-auto max-w-6xl px-4 py-10">{profileBody}</div>;
}
