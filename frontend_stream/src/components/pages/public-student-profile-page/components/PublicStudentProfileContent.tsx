import {
  AlertCircle,
  Award,
  Bell,
  BookOpen,
  CalendarClock,
  ExternalLink,
  Flame,
  GraduationCap,
  Share2,
  Star,
} from 'lucide-react';
import { Alert, AlertDescription } from '../../../ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '../../../ui/avatar';
import { Badge } from '../../../ui/badge';
import { Button } from '../../../ui/button';
import type { PublicStudentProfileDataModel } from '../publicStudentProfile.types';
import { formatRelativeDate, getCategoryMeta, getInitials } from '../publicStudentProfile.utils';

interface PublicStudentProfileContentProps {
  model: PublicStudentProfileDataModel;
  onNavigate: (path: string | number) => void;
}

export function PublicStudentProfileContent({
  model,
  onNavigate,
}: PublicStudentProfileContentProps) {
  if (!model.profile || !model.dashboard) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f6f6f8] text-slate-900 dark:bg-[#101622] dark:text-slate-100" style={{ fontFamily: 'Lexend, system-ui, sans-serif' }}>
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/85 backdrop-blur-md dark:border-slate-800 dark:bg-[#101622]/85">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1152d4] text-white">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="text-xl font-bold tracking-tight">EduElevate</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <button type="button" onClick={() => onNavigate('/catalog')} className="text-sm text-slate-600 transition-colors hover:text-[#1152d4] dark:text-slate-400">Browse Courses</button>
            <button type="button" onClick={() => onNavigate('/live-sessions')} className="text-sm text-slate-600 transition-colors hover:text-[#1152d4] dark:text-slate-400">Live Sessions</button>
            <button type="button" onClick={() => onNavigate('/profile/public')} className="text-sm font-medium text-[#1152d4]">Public Profile</button>
          </div>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => onNavigate('/notifications')} className="relative rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
              <Bell className="h-5 w-5" />
              {model.unreadCount > 0 ? <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" /> : null}
            </button>
            <button type="button" onClick={() => onNavigate('/profile')} className="h-8 w-8 overflow-hidden rounded-full border border-slate-300">
              <Avatar className="h-8 w-8">
                <AvatarImage src={model.profile.avatar || undefined} />
                <AvatarFallback className="bg-slate-100 text-[10px] font-bold text-[#1152d4]">
                  {getInitials(model.profile.firstName, model.profile.lastName)}
                </AvatarFallback>
              </Avatar>
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {!model.publicEnabled ? (
          <Alert className="mb-8 border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-100">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Votre profil public est masque dans les parametres. Cette page sert de previsualisation.</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <aside className="space-y-6 lg:col-span-4">
            <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="relative mx-auto mb-6 h-32 w-32">
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg dark:border-slate-800">
                  <AvatarImage src={model.profile.avatar || undefined} />
                  <AvatarFallback className="bg-[#1152d4]/10 text-3xl font-bold text-[#1152d4]">
                    {getInitials(model.profile.firstName, model.profile.lastName)}
                  </AvatarFallback>
                </Avatar>
                {model.showStatus ? <div className="absolute bottom-1 right-1 h-6 w-6 rounded-full border-4 border-white bg-green-500 dark:border-slate-800" /> : null}
              </div>
              <div className="mb-3 flex items-center justify-center gap-2">
                <h1 className="text-2xl font-bold">{model.displayName}</h1>
                <Badge className="rounded-full bg-[#1152d4]/10 px-3 py-1 text-[#1152d4] hover:bg-[#1152d4]/10">Public Preview</Badge>
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{model.profile.niveau || model.level || 'Learner'}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {model.extras.bio.trim() || 'Emerging learner building practical skills through live sessions, portfolio-driven courses, and consistent progress.'}
              </p>
              <div className="mt-6 flex justify-center gap-3">
                {model.socialLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => item.url && window.open(item.url, '_blank', 'noopener,noreferrer')}
                      className="rounded-xl bg-slate-100 p-2 text-slate-600 transition-all hover:bg-[#1152d4]/10 hover:text-[#1152d4] dark:bg-slate-800 dark:text-slate-400"
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  );
                })}
                <button type="button" onClick={() => void model.handleShare()} className="rounded-xl bg-slate-100 p-2 text-slate-600 transition-all hover:bg-[#1152d4]/10 hover:text-[#1152d4] dark:bg-slate-800 dark:text-slate-400">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-100 pt-8 dark:border-slate-800">
                <div>
                  <div className="text-xl font-bold">{model.dashboard.stats.activeCourses}</div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Active Courses</div>
                </div>
                <div>
                  <div className="text-xl font-bold">{model.dashboard.stats.completedCourses}</div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Completed</div>
                </div>
              </div>
              <Button className="mt-8 w-full rounded-2xl bg-[#1152d4] py-6 font-semibold text-white hover:bg-[#0f47b9]" onClick={() => onNavigate('/profile')}>Edit Profile</Button>
              <p className="mt-3 text-xs text-slate-400">{model.shareState === 'copied' ? 'Profile link copied.' : model.shareState === 'error' ? 'Share unavailable on this device.' : 'Use this page as your public-facing preview.'}</p>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="mb-6 text-sm font-bold uppercase tracking-[0.18em]">Skill Badges</h3>
              <div className="grid grid-cols-3 gap-4">
                {model.badges.map((badge) => {
                  const Icon = badge.icon;
                  return (
                    <div key={badge.label} className={`flex flex-col items-center gap-2 ${badge.active ? '' : 'opacity-40 grayscale'}`}>
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1152d4]/10 text-[#1152d4] transition-all hover:bg-[#1152d4] hover:text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-center text-[10px] font-bold uppercase tracking-tight text-slate-500">{badge.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          <div className="space-y-8 lg:col-span-8">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="flex items-center gap-4 rounded-[24px] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <div className="rounded-2xl bg-[#1152d4]/10 p-3 text-[#1152d4]"><Award className="h-5 w-5" /></div>
                <div><div className="text-2xl font-bold">{model.completedCourses.length}</div><div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Courses Done</div></div>
              </div>
              <div className="flex items-center gap-4 rounded-[24px] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <div className="rounded-2xl bg-[#1152d4]/10 p-3 text-[#1152d4]"><Star className="h-5 w-5" /></div>
                <div><div className="text-2xl font-bold">{model.badges.filter((badge) => badge.active).length}</div><div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Skills Earned</div></div>
              </div>
              <div className="flex items-center gap-4 rounded-[24px] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <div className="rounded-2xl bg-[#1152d4]/10 p-3 text-[#1152d4]"><Flame className="h-5 w-5" /></div>
                <div><div className="text-2xl font-bold">{model.activityDays}</div><div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Active Days</div></div>
              </div>
            </div>

            <section>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-bold"><Award className="h-5 w-5 text-[#1152d4]" /> Verified Completions</h2>
                  <p className="mt-1 text-sm text-slate-500">Built from courses completed on the platform.</p>
                </div>
                <button type="button" onClick={() => onNavigate('/catalog')} className="text-sm font-semibold text-[#1152d4] hover:underline">View All</button>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {model.completedCourses.length > 0 ? model.completedCourses.slice(0, 2).map((course) => (
                  <div key={course.id} className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white transition-all hover:shadow-xl hover:shadow-[#1152d4]/5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="relative h-40 overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#1152d4]/20 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-32 w-48 flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
                          <div className="flex items-start justify-between">
                            <BookOpen className="h-3 w-3 text-[#1152d4]" />
                            <span className="font-mono text-[8px] text-slate-400">REF: {course.id}</span>
                          </div>
                          <div>
                            <div className="line-clamp-2 text-[10px] font-bold leading-tight">{course.title}</div>
                            <div className="text-[8px] text-slate-500">{model.displayName}</div>
                          </div>
                          <div className="flex items-end justify-between border-t border-slate-100 pt-1 dark:border-slate-800">
                            <span className="text-[6px] uppercase text-slate-400">EduElevate Records</span>
                            <Award className="h-3 w-3 text-green-500" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="mb-1 font-bold transition-colors group-hover:text-[#1152d4]">{course.title}</h3>
                      <p className="mb-4 text-xs text-slate-500">Completed on platform - Course ref: {course.id}</p>
                      <button type="button" onClick={() => onNavigate(`/courses/${course.id}`)} className="flex items-center gap-2 text-xs font-bold text-[#1152d4] transition-all group-hover:gap-3">
                        VIEW COURSE <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 md:col-span-2">
                    No verified completion yet. Finish a course to unlock your first public credential card.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[28px] border border-[#1152d4]/10 bg-[#1152d4]/5 p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Currently Learning</h2>
                  <p className="mt-1 text-sm text-slate-500">Courses actively in progress</p>
                </div>
                <BookOpen className="h-10 w-10 text-[#1152d4]/30" />
              </div>
              <div className="space-y-4">
                {model.currentCourses.length > 0 ? model.currentCourses.map((course) => {
                  const meta = getCategoryMeta(course.category);
                  const Icon = meta.icon;
                  return (
                    <div key={course.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                      <div className="mb-4 flex items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${meta.className}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="truncate font-semibold">{course.title}</h4>
                            <p className="text-xs text-slate-500">{course.category} - Progress tracked from your dashboard</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-[#1152d4]">{course.progress}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div className="h-full rounded-full bg-[#1152d4]" style={{ width: `${course.progress}%` }} />
                      </div>
                    </div>
                  );
                }) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
                    You do not have an active course in progress yet. Visit the catalog to start building your public portfolio.
                  </div>
                )}
              </div>
            </section>

            <section>
              <h2 className="mb-6 text-xl font-bold">Learning Activity</h2>
              {(model.dashboard.recentActivity || []).length > 0 ? (
                <div className="relative pl-8 before:absolute before:bottom-0 before:left-3 before:top-2 before:w-0.5 before:bg-slate-200 before:content-[''] dark:before:bg-slate-800">
                  {model.dashboard.recentActivity.map((activity, index) => (
                    <div key={activity.id} className={`${index === model.dashboard.recentActivity.length - 1 ? '' : 'mb-8'} relative`}>
                      <span className={`absolute -left-[26px] top-0 h-4 w-4 rounded-full border-4 border-white dark:border-slate-900 ${index === 0 ? 'bg-[#1152d4]' : 'bg-slate-200 dark:bg-slate-700'}`} />
                      <div className="mb-1 text-sm text-slate-500">{formatRelativeDate(activity.occurredAt)}</div>
                      <p className="text-slate-900 dark:text-slate-200">
                        <span className="font-bold">{activity.title}</span>
                        {activity.details ? ` - ${activity.details}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
                  No public learning activity yet. As soon as you enroll, progress, or complete courses, this feed will start telling your story.
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <footer className="mt-20 border-t border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-[#1152d4] text-white">
              <GraduationCap className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-bold">EduElevate Academic</span>
          </div>
          <p className="text-sm text-slate-500">A modern learning portfolio powered by your real course activity.</p>
          <div className="mt-6 flex justify-center gap-6">
            <button type="button" onClick={() => onNavigate('/privacy')} className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400 transition-colors hover:text-[#1152d4]">Privacy</button>
            <button type="button" onClick={() => onNavigate('/terms')} className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400 transition-colors hover:text-[#1152d4]">Terms</button>
            <button type="button" onClick={() => onNavigate('/help')} className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400 transition-colors hover:text-[#1152d4]">Help Center</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
