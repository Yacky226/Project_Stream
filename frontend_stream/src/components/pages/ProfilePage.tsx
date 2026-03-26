import { useMemo } from 'react';
import {
  Award,
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  Camera,
  CheckCircle2,
  CreditCard,
  Flame,
  GraduationCap,
  HelpCircle,
  Layers,
  Link as LinkIcon,
  Mail,
  MapPin,
  Sparkles,
  Shield,
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
import './ProfilePage.css';

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
  const teacherShared = useTeacherSpaceData({ includeDashboard: false });
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
  const adminRecentInscriptions = adminDashboard?.recentInscriptions.slice(0, 6) || [];

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

  const surfaceClass =
    'profile-surface rounded-[28px] border border-slate-200/90 bg-white/95 shadow-sm dark:border-slate-800 dark:bg-slate-900/95';
  const teacherPublicProfileId =
    role === 'teacher'
      ? profile?.id || user?.id || null
      : null;
  const teacherPublicProfilePath = teacherPublicProfileId
    ? `/profile/teacher/${teacherPublicProfileId}`
    : null;
  const profilePublicPath =
    role === 'teacher'
      ? teacherPublicProfilePath
      : role === 'student'
        ? '/profile/public'
        : null;

  const profileBody = (
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

  const roleProfileSignals = [
    Boolean(profile?.firstName),
    Boolean(profile?.lastName),
    Boolean(profile?.email),
    Boolean(avatarUrl),
    Boolean(profile?.bio),
    Boolean(profile?.location),
    Boolean(roleSubtitle && roleSubtitle !== 'Instructor profile' && roleSubtitle !== 'Student profile'),
    role === 'teacher' ? teacherCourses.length > 0 : inProgressCourses.length + completedCourses.length > 0,
    role === 'teacher' ? teacherSessions.length > 0 : activityFeed.length > 0,
  ];
  const roleProfileStrength = Math.max(
    35,
    Math.min(100, Math.round((roleProfileSignals.filter(Boolean).length / roleProfileSignals.length) * 100)),
  );
  const roleProfileHint =
    roleProfileStrength >= 90
      ? 'Excellent profile quality. Keep your information up to date.'
      : roleProfileStrength >= 70
        ? role === 'teacher'
          ? 'Your profile is almost complete. Add a richer bio and links.'
          : 'Your profile is almost complete. Add social links and activity details.'
        : role === 'teacher'
          ? 'Add more details so students can trust your public profile faster.'
          : 'Add more details so instructors and peers can better understand your learning journey.';
  const joinedOn = formatDate(profile?.createdAt);
  const profileLocation = profile?.location || 'Location not set';
  const profileBio =
    profile?.bio ||
    (role === 'teacher'
      ? 'Describe your teaching style, your expertise, and what students can expect in your courses.'
      : 'Share your learning goals, areas of focus, and what you are building right now.');
  const roleDashboardPath = role === 'teacher' ? '/teacher/dashboard' : '/dashboard';

  const roleProfileBody =
    role === 'teacher' || role === 'student' ? (
      <div className="app-profile-page profile-settings-layout mx-auto w-full max-w-5xl space-y-8">
        <section className={`profile-settings-toolbar p-4 ${surfaceClass}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="inline-flex items-center justify-center rounded-xl bg-[#1152d4] text-white"
                style={{ width: '38px', height: '38px' }}
              >
                <User className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                User Profile &amp; Settings
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-[#1152d4]/10 hover:text-[#1152d4] dark:bg-slate-800 dark:text-slate-300"
                style={{ width: '40px', height: '40px' }}
                onClick={() => onNavigate('/notifications')}
                type="button"
              >
                <Bell className="h-5 w-5" />
              </button>
              <button
                className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-[#1152d4]/10 hover:text-[#1152d4] dark:bg-slate-800 dark:text-slate-300"
                style={{ width: '40px', height: '40px' }}
                onClick={() => onNavigate('/help')}
                type="button"
              >
                <HelpCircle className="h-5 w-5" />
              </button>
              <div
                className="flex items-center justify-center rounded-full border border-[#1152d4]/30 bg-[#1152d4]/10 text-xs font-bold text-[#1152d4]"
                style={{ width: '40px', height: '40px' }}
              >
                {initials}
              </div>
            </div>
          </div>
        </section>

        <section className={`profile-settings-hero p-6 ${surfaceClass}`}>
          <div className="flex flex-wrap items-center gap-6">
            <div className="relative shrink-0" style={{ width: '128px', height: '128px' }}>
              <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-lg dark:border-slate-800 dark:bg-slate-800">
                {avatarUrl ? (
                  <ImageWithFallback
                    alt={fullName}
                    className="h-full w-full object-cover"
                    src={avatarUrl}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#1152d4]/10 text-2xl font-bold text-[#1152d4]">
                    {initials}
                  </div>
                )}
              </div>
              <button
                className="absolute bottom-0 right-0 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[#1152d4] text-white shadow-lg transition hover:scale-105 dark:border-slate-900"
                onClick={() => onNavigate('/settings')}
                type="button"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            <div className="min-w-0 flex-1 text-left">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{fullName}</h1>
              <p className="font-medium text-slate-500 dark:text-slate-300">{roleSubtitle}</p>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {profileLocation}
                </span>
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  Joined {joinedOn}
                </span>
              </div>
            </div>

            <div className="ml-auto flex shrink-0 flex-col gap-2" style={{ width: '260px', maxWidth: '100%' }}>
              <button
                className={`inline-flex w-full items-center justify-center rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-all ${
                  profilePublicPath
                    ? 'cursor-pointer bg-[#1152d4] shadow-md shadow-[#1152d4]/20 hover:bg-[#0f47b9]'
                    : 'cursor-not-allowed bg-slate-400/60'
                }`}
                disabled={!profilePublicPath}
                onClick={() => {
                  if (profilePublicPath) {
                    onNavigate(profilePublicPath);
                  }
                }}
                type="button"
              >
                View Public Profile
              </button>
              <button
                className="inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-slate-100 px-6 py-2.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                onClick={() => onNavigate('/settings')}
                type="button"
              >
                Export Data
              </button>
            </div>
          </div>
        </section>

        <div className="profile-settings-tabs-wrap overflow-x-auto">
          <nav className="profile-settings-tabs flex min-w-max border-b border-slate-200 dark:border-slate-800">
            <button className="inline-flex cursor-pointer items-center gap-2 border-b-2 border-[#1152d4] px-6 py-4 text-sm font-semibold text-[#1152d4]" type="button">
              <User className="h-4 w-4" />
              Personal Info
            </button>
            <button className="inline-flex cursor-pointer items-center gap-2 border-b-2 border-transparent px-6 py-4 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200" type="button">
              <Shield className="h-4 w-4" />
              Security
            </button>
            <button className="inline-flex cursor-pointer items-center gap-2 border-b-2 border-transparent px-6 py-4 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200" type="button">
              <CreditCard className="h-4 w-4" />
              Billing
            </button>
            <button className="inline-flex cursor-pointer items-center gap-2 border-b-2 border-transparent px-6 py-4 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200" type="button">
              <Bell className="h-4 w-4" />
              Notifications
            </button>
          </nav>
        </div>

        <div className="profile-settings-main-grid grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="profile-settings-main space-y-8 lg:col-span-2">
            <section className={`profile-settings-card p-6 ${surfaceClass}`}>
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
                <User className="h-5 w-5 text-[#1152d4]" />
                Basic Details
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name</label>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 transition focus:border-[#1152d4] focus:outline-none focus:ring-2 focus:ring-[#1152d4]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    defaultValue={profile?.firstName || ''}
                    readOnly
                    type="text"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</label>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 transition focus:border-[#1152d4] focus:outline-none focus:ring-2 focus:ring-[#1152d4]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    defaultValue={profile?.lastName || ''}
                    readOnly
                    type="text"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                  <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
                    <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                    <input
                      className="w-full border-0 bg-transparent text-slate-800 outline-none dark:text-slate-100"
                      defaultValue={profile?.email || ''}
                      readOnly
                      style={{ marginLeft: '10px' }}
                      type="email"
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Bio</label>
                  <textarea
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 transition focus:border-[#1152d4] focus:outline-none focus:ring-2 focus:ring-[#1152d4]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    defaultValue={profileBio}
                    readOnly
                    rows={4}
                  />
                  <p className="text-xs text-slate-400">Profile fields are currently synced from backend profile settings.</p>
                </div>
              </div>
            </section>

            <section className={`profile-settings-card p-6 ${surfaceClass}`}>
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
                <LinkIcon className="h-5 w-5 text-[#1152d4]" />
                Social Connections
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Twitter / X', placeholder: '@username' },
                  { label: 'LinkedIn', placeholder: 'linkedin.com/in/your-name' },
                  { label: 'Personal Website', placeholder: 'https://your-portfolio.com' },
                ].map((field) => (
                  <div className="flex items-center gap-4" key={field.label}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                      <LinkIcon className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{field.label}</label>
                      <input
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-slate-700 transition focus:border-[#1152d4] focus:outline-none focus:ring-2 focus:ring-[#1152d4]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        defaultValue=""
                        placeholder={field.placeholder}
                        readOnly
                        type="text"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="flex justify-end gap-4 pb-6">
              <button
                className="cursor-pointer rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                onClick={() => onNavigate(roleDashboardPath)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="cursor-pointer rounded-xl bg-[#1152d4] px-8 py-3 text-sm font-bold text-white shadow-lg shadow-[#1152d4]/20 transition-all hover:bg-[#0f47b9]"
                onClick={() => onNavigate('/settings')}
                type="button"
              >
                Save Changes
              </button>
            </div>
          </div>

          <aside className="profile-settings-side space-y-6">
            <div className="profile-strength-card rounded-xl border border-[#1152d4]/20 bg-[#1152d4]/5 p-6 dark:bg-[#1152d4]/10">
              <h4 className="mb-4 flex items-center gap-2 font-bold text-[#1152d4]">
                <BarChart3 className="h-4 w-4" />
                Profile Strength
              </h4>
              <div className="mb-4 h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-800">
                <div className="h-2.5 rounded-full bg-[#1152d4]" style={{ width: `${roleProfileStrength}%` }} />
              </div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                {roleProfileStrength}% complete
              </p>
              <p className="mb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {roleProfileHint}
              </p>
              <button
                className="cursor-pointer text-sm font-bold text-[#1152d4] hover:underline"
                onClick={() => onNavigate('/settings')}
                type="button"
              >
                Complete now
              </button>
            </div>

            <div className={`profile-privacy-card rounded-xl p-6 ${surfaceClass}`}>
              <h4 className="mb-4 font-bold text-slate-900 dark:text-slate-100">Privacy</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Public Profile</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Allow users to find you</p>
                  </div>
                  <button
                    className="relative cursor-pointer rounded-full bg-[#1152d4]"
                    style={{ width: '44px', height: '24px' }}
                    type="button"
                  >
                    <span
                      className="absolute rounded-full bg-white shadow-sm"
                      style={{ width: '18px', height: '18px', top: '3px', left: '23px' }}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Show Activity</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Share what you&apos;re up to</p>
                  </div>
                  <button
                    className="relative cursor-pointer rounded-full bg-slate-300 dark:bg-slate-700"
                    style={{ width: '44px', height: '24px' }}
                    type="button"
                  >
                    <span
                      className="absolute rounded-full bg-white shadow-sm"
                      style={{ width: '18px', height: '18px', top: '3px', left: '3px' }}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="profile-help-card relative overflow-hidden rounded-xl bg-slate-900 p-6 text-white">
              <div className="relative z-10">
                <h4 className="mb-2 font-bold">Need Help?</h4>
                <p className="mb-4 text-xs text-slate-300">
                  Our support team is available to help you with your profile settings.
                </p>
                <button
                  className="w-full cursor-pointer rounded-lg bg-white py-2 text-sm font-bold text-slate-900 transition-colors hover:bg-slate-100"
                  onClick={() => onNavigate('/contact')}
                  type="button"
                >
                  Contact Support
                </button>
              </div>
              <div className="pointer-events-none absolute -bottom-5 -right-4 opacity-10">
                <HelpCircle className="h-20 w-20" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    ) : null;

  const adminProfileBody =
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
    ) : null;

  if (role === 'student') {
    return (
      <StudentSpaceShell
        currentPath={currentPath}
        onNavigate={onNavigate}
        showSearch={false}
        showHeader={false}
        headerTitle="My Profile"
        headerDescription="Retrouvez vos indicateurs, certificats et votre progression dans un profil etudiant aligne avec le reste de votre espace."
        displayName={fullName}
        displayLevel={roleSubtitle}
        initials={initials}
        avatarUrl={avatarUrl || null}
        goalProgress={studentDashboard?.stats.averageProgress || 0}
        unreadCount={unreadCount}
      >
        {roleProfileBody || profileBody}
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
        showHeader={false}
        headerTitle="Teacher Profile"
        headerDescription="Retrouvez vos indicateurs de cours, vos sessions a venir et votre identite publique dans un profil aligne avec le reste de votre espace enseignant."
        displayName={teacherShared.displayName}
        displayRole={teacherShared.displayRole}
        initials={teacherShared.initials}
        avatarUrl={teacherShared.avatarUrl}
        activeCourseCount={teacherDashboard?.stats.totalCourses ?? teacherShared.activeCourseCount}
        liveSessions={teacherDashboard?.stats.liveSessions ?? teacherShared.liveSessions}
        unreadCount={teacherShared.unreadCount}
      >
        {roleProfileBody || profileBody}
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
        showHeader={false}
        headerTitle="Admin Profile"
        headerDescription="Conservez votre identite d administration et vos indicateurs de plateforme dans le meme cadre que le reste de votre espace admin."
        displayName={adminShared.displayName}
        displayRole={adminShared.displayRole}
        initials={adminShared.initials}
        avatarUrl={adminShared.avatarUrl}
        unreadCount={adminShared.unreadCount}
      >
        {adminProfileBody || profileBody}
      </AdminSpaceShell>
    );
  }

  return <div className="mx-auto max-w-6xl px-4 py-10">{profileBody}</div>;
}
