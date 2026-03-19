import { useMemo } from 'react';
import {
  Award,
  BarChart3,
  Bell,
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
} from '../../store/api/userApi';
import {
  useGetAdminDashboardQuery,
  useGetStudentDashboardQuery,
  useGetTeacherDashboardQuery,
} from '../../store/api/dashboardApi';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface ProfilePageProps {
  onNavigate: (path: string | number) => void;
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

export function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const { data: profile, isLoading: profileLoading, error: profileError } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated,
  });

  const role = normalizeUserRole(profile?.role);

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

  return (
    <div className="min-h-screen bg-[#f6f6f8] font-[Lexend,sans-serif] text-slate-900">
      <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button className="flex items-center gap-2" onClick={() => onNavigate('/')} type="button">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-[#1152d4] text-white">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="text-xl font-bold tracking-tight">EduElevate</span>
          </button>

          <div className="hidden items-center gap-8 md:flex">
            <button className="text-sm text-slate-600 hover:text-[#1152d4]" onClick={() => onNavigate('/catalog')} type="button">Browse Courses</button>
            <button className="text-sm text-slate-600 hover:text-[#1152d4]" onClick={() => onNavigate('/search')} type="button">Mentors</button>
            <button className="text-sm font-semibold text-[#1152d4]" onClick={() => onNavigate('/profile')} type="button">Profile</button>
          </div>

          <div className="flex items-center gap-4">
            <button className="rounded-full p-2 text-slate-500 hover:bg-slate-100" type="button">
              <Bell className="h-5 w-5" />
            </button>
            <button className="h-8 w-8 overflow-hidden rounded-full border border-slate-300 bg-slate-200" onClick={() => onNavigate('/profile')} type="button">
              {avatarUrl ? <ImageWithFallback alt={fullName} className="h-full w-full object-cover" src={avatarUrl} /> : <span className="text-[11px] font-bold text-[#1152d4]">{initials}</span>}
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <aside className="space-y-6 lg:col-span-4">
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div className="relative mx-auto mb-6 h-32 w-32">
                {avatarUrl ? (
                  <ImageWithFallback alt={fullName} className="h-full w-full rounded-full border-4 border-white object-cover shadow-lg" src={avatarUrl} />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full border-4 border-white bg-[#1152d4]/10 text-3xl font-bold text-[#1152d4] shadow-lg">
                    {initials}
                  </div>
                )}
                <span className="absolute bottom-1 right-1 h-6 w-6 rounded-full border-4 border-white bg-emerald-500" />
              </div>

              <h1 className="text-2xl font-bold">{fullName}</h1>
              <p className="mt-2 text-sm text-slate-500">{roleSubtitle}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                {role === 'teacher'
                  ? 'Public instructor identity connected to your live backend profile and published courses.'
                  : role === 'admin'
                    ? 'Administration profile synchronized with platform analytics.'
                    : 'Learning portfolio synchronized with your student dashboard.'}
              </p>

              <div className="mt-6 flex justify-center gap-4">
                <button className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-[#1152d4]/10 hover:text-[#1152d4]" type="button">
                  <LinkIcon className="h-4 w-4" />
                </button>
                <button className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-[#1152d4]/10 hover:text-[#1152d4]" type="button">
                  <Mail className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-100 pt-8">
                <div>
                  <div className="text-xl font-bold text-slate-900">{metrics[0]?.value || '0'}</div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{metrics[0]?.label || 'Primary'}</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-900">{metrics[1]?.value || '0'}</div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{metrics[1]?.label || 'Secondary'}</div>
                </div>
              </div>

              <button
                className="mt-8 w-full rounded-lg bg-[#1152d4] py-3 text-sm font-semibold text-white shadow-lg shadow-[#1152d4]/20 hover:opacity-90"
                onClick={() => onNavigate('/settings')}
                type="button"
              >
                Manage profile
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-6 text-sm font-bold uppercase tracking-[0.16em] text-slate-900">Skill Badges</h3>
              <div className="grid grid-cols-3 gap-4">
                {skillBadges.map((badge, index) => {
                  const Icon = badgeIcons[index % badgeIcons.length];
                  return (
                    <div className="flex flex-col items-center gap-2" key={badge}>
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1152d4]/10 text-[#1152d4]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-center text-[10px] font-bold uppercase tracking-tight text-slate-500">{badge}</span>
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
                  <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-6" key={metric.label}>
                    <div className="rounded-lg bg-[#1152d4]/10 p-3">
                      <Icon className="h-5 w-5 text-[#1152d4]" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{metric.value}</div>
                      <div className="text-xs font-semibold uppercase text-slate-500">{metric.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <section>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xl font-bold">
                  <CheckCircle2 className="h-5 w-5 text-[#1152d4]" />
                  Verified Certificates
                </h2>
                <button className="text-sm font-semibold text-[#1152d4] hover:underline" onClick={() => onNavigate('/courses')} type="button">
                  View All
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {completedCourses.length > 0 ? (
                  completedCourses.map((course) => (
                    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:shadow-xl hover:shadow-[#1152d4]/5" key={course.id}>
                      <div className="relative h-40 bg-slate-100">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1152d4]/20 to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex h-32 w-48 flex-col justify-between rounded border border-slate-200 bg-white p-4 shadow-2xl">
                            <div className="flex items-start justify-between">
                              <GraduationCap className="h-3 w-3 text-[#1152d4]" />
                              <span className="font-mono text-[8px] text-slate-400">ID: CERT-{course.id}</span>
                            </div>
                            <div>
                              <div className="text-[10px] font-bold leading-tight text-slate-900">{course.title}</div>
                              <div className="text-[8px] text-slate-500">{fullName}</div>
                            </div>
                            <div className="flex items-end justify-between border-t border-slate-100 pt-1">
                              <span className="text-[6px] uppercase text-slate-400">EduElevate Academic</span>
                              <CheckCircle2 className="h-[10px] w-[10px] text-emerald-500" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-5">
                        <h3 className="mb-1 font-bold text-slate-900">{course.title}</h3>
                        <p className="mb-4 text-xs text-slate-500">Completed: {formatDate(course.scheduledAt || course.enrolledAt)}</p>
                        <button className="text-xs font-bold text-[#1152d4]" onClick={() => onNavigate(`/courses/${course.id}`)} type="button">
                          VIEW CREDENTIAL
                        </button>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500 md:col-span-2">
                    No completed course yet. Finish a course to unlock your first verified credential card.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-xl border border-[#1152d4]/10 bg-[#1152d4]/5 p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Currently Learning</h2>
                  <p className="mt-1 text-sm text-slate-500">Courses in progress</p>
                </div>
                <BookOpen className="h-9 w-9 text-[#1152d4]/40" />
              </div>

              <div className="space-y-4">
                {inProgressCourses.length > 0 ? (
                  inProgressCourses.map((course) => (
                    <div className="rounded-lg border border-slate-200 bg-white p-4" key={course.id}>
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded bg-amber-100 text-amber-600">
                            <BookOpen className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900">{course.title}</h4>
                            <p className="text-xs text-slate-500">Category: {course.category}</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-[#1152d4]">{course.progress}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-[#1152d4]" style={{ width: `${Math.min(100, Math.max(0, course.progress))}%` }} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
                    You do not have an active course right now.
                  </div>
                )}
              </div>
            </section>

            <section>
              <h2 className="mb-6 text-xl font-bold">Learning Activity</h2>
              <div className="space-y-6">
                {activityFeed.length > 0 ? (
                  <div className="relative pl-8 before:absolute before:bottom-0 before:left-3 before:top-2 before:w-0.5 before:bg-slate-200 before:content-['']">
                    {activityFeed.map((activityItem, index) => (
                      <div className="relative mb-8 last:mb-0" key={activityItem.id}>
                        <span className={`absolute -left-[26px] top-0 h-4 w-4 rounded-full border-4 border-white ${index === 0 ? 'bg-[#1152d4]' : 'bg-slate-300'}`} />
                        <div className="mb-1 text-sm text-slate-500">{formatDate(activityItem.occurredAt)}</div>
                        <p className="text-slate-800">
                          {activityDescription(activityItem.type, activityItem.title, activityItem.details)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
                    No recent activity yet.
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="mt-16 border-t border-slate-200 bg-white py-10">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-[#1152d4] text-white">
              <GraduationCap className="h-[14px] w-[14px]" />
            </div>
            <span className="text-sm font-bold text-slate-900">EduElevate Academic</span>
          </div>
          <p className="text-sm text-slate-500">Copyright {new Date().getFullYear()} EduElevate. Professional learning portfolios.</p>
          <div className="mt-6 flex justify-center gap-6">
            <button className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-[#1152d4]" onClick={() => onNavigate('/privacy')} type="button">Privacy</button>
            <button className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-[#1152d4]" onClick={() => onNavigate('/terms')} type="button">Terms</button>
            <button className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-[#1152d4]" onClick={() => onNavigate('/help')} type="button">Help Center</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
