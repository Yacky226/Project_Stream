import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  Flame,
  GraduationCap,
  Radio,
  Share2,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useGetCoursesQuery } from '../../store/api/liveApi';
import {
  editorialPosts,
  formatEditorialDate,
  getEditorialCategories,
  getEditorialCategoryTone,
  getFeaturedEditorialPost,
  getPopularEditorialPosts,
  type EditorialPost,
} from '../../lib/editorialContent';
import { copyToClipboard } from '../../lib/utils';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Button } from '../ui/button';
import {
  StudentSpaceShell,
  StudentSpaceStatus,
  formatStudentDate,
  getStudentCategoryMeta,
  useStudentSpaceData,
} from '../student/StudentSpaceShared';

interface StudentCommunityPageProps {
  onNavigate: (path: string | number) => void;
  currentPath?: string;
}

export function StudentCommunityPage({
  onNavigate,
  currentPath,
}: StudentCommunityPageProps) {
  const shared = useStudentSpaceData();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [visibleCount, setVisibleCount] = useState(4);
  const [selectedPost, setSelectedPost] = useState<EditorialPost | null>(null);

  const ready = shared.status === 'ready' && shared.dashboard;
  const { data: catalogCourses = [] } = useGetCoursesQuery(undefined, {
    skip: !ready,
  });

  if (!ready) {
    return <StudentSpaceStatus shared={shared} />;
  }

  const categories = useMemo(() => getEditorialCategories(editorialPosts), []);
  const featuredPost = useMemo(() => getFeaturedEditorialPost(editorialPosts), []);
  const popularPosts = useMemo(() => getPopularEditorialPosts(3, editorialPosts), []);
  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredPosts = editorialPosts.filter((post) => {
    const matchesCategory = activeCategory === 'all' || post.category === activeCategory;
    const matchesQuery =
      !normalizedSearch ||
      [post.title, post.excerpt, ...post.tags].join(' ').toLowerCase().includes(normalizedSearch);
    return matchesCategory && matchesQuery;
  });

  const showHero = activeCategory === 'all' && !normalizedSearch;
  const listPosts = showHero
    ? filteredPosts.filter((post) => post.id !== featuredPost.id)
    : filteredPosts;
  const visiblePosts = listPosts.slice(0, visibleCount);
  const hasMore = visibleCount < listPosts.length;

  useEffect(() => {
    setVisibleCount(4);
  }, [activeCategory, searchQuery]);

  const learningPicks = catalogCourses
    .filter(
      (course) => !new Set(shared.dashboard.courses.map((item) => String(item.id))).has(String(course.id)),
    )
    .sort((a, b) => {
      const currentCategories = new Set(
        shared.dashboard.courses.map((course) => course.category.toLowerCase()),
      );
      const aMatch = currentCategories.has(a.category.toLowerCase()) ? 1 : 0;
      const bMatch = currentCategories.has(b.category.toLowerCase()) ? 1 : 0;
      if (aMatch !== bMatch) return bMatch - aMatch;
      return new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime();
    })
    .slice(0, 3);

  const handleShare = async (post: EditorialPost) => {
    const shareUrl = `${window.location.origin}/student/community#${post.id}`;
    if (navigator.share) {
      await navigator.share({ title: post.title, text: post.excerpt, url: shareUrl });
      return;
    }
    await copyToClipboard(shareUrl);
  };

  return (
    <StudentSpaceShell
      currentPath={currentPath}
      onNavigate={onNavigate}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search articles, tags, mentors..."
      displayName={shared.displayName}
      displayLevel={shared.displayLevel}
      initials={shared.initials}
      avatarUrl={shared.avatarUrl}
      goalProgress={shared.goalProgress}
      unreadCount={shared.unreadCount}
    >
      <div className="space-y-8">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">
              Community
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
              Editorial picks, mentor entry points, and live learning moments tailored for students.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl border border-[#1152d4]/10 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Articles</p>
              <p className="mt-1 text-2xl font-bold text-[#1152d4]">{editorialPosts.length}</p>
            </div>
            <div className="rounded-2xl border border-[#1152d4]/10 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Upcoming lives</p>
              <p className="mt-1 text-2xl font-bold text-[#1152d4]">{shared.dashboard.stats.upcomingSessions}</p>
            </div>
            <div className="rounded-2xl border border-[#1152d4]/10 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Active courses</p>
              <p className="mt-1 text-2xl font-bold text-[#1152d4]">{shared.dashboard.stats.activeCourses}</p>
            </div>
          </div>
        </section>

        {showHero ? (
          <section className="overflow-hidden rounded-[32px] bg-slate-900">
            <div className="relative min-h-[360px]">
              <ImageWithFallback
                src={featuredPost.image}
                alt={featuredPost.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#101622] via-[#101622]/60 to-[#101622]/20" />
              <div className="relative flex min-h-[360px] flex-col justify-end p-6 lg:p-10">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white ${getEditorialCategoryTone(featuredPost.category)}`}>
                    {featuredPost.category}
                  </span>
                  <span className="text-sm font-medium text-slate-300">{featuredPost.readTime}</span>
                </div>
                <h2 className="mt-5 max-w-4xl text-3xl font-black leading-tight text-white lg:text-5xl">
                  {featuredPost.title}
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">{featuredPost.excerpt}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button
                    className="rounded-2xl bg-[#1152d4] text-white hover:bg-[#0f47b9]"
                    onClick={() => setSelectedPost(featuredPost)}
                  >
                    Read spotlight
                  </Button>
                  <Button variant="outline" className="rounded-2xl border-white/20 bg-white/10 text-white hover:bg-white/15" onClick={() => void handleShare(featuredPost)}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <div className="flex flex-col gap-12 lg:flex-row">
          <div className="flex-1 space-y-8">
            <section className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActiveCategory(category.id)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeCategory === category.id
                      ? 'bg-[#1152d4] text-white'
                      : 'bg-white text-slate-600 hover:text-[#1152d4] dark:bg-slate-900 dark:text-slate-300'
                  }`}
                >
                  {category.label} ({category.count})
                </button>
              ))}
            </section>

            <section>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-950 dark:text-white">Editorial feed</h2>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                    Student-facing content derived from the public blog dataset.
                  </p>
                </div>
                <Button variant="outline" className="rounded-2xl" onClick={() => onNavigate('/blog')}>
                  Open public blog
                </Button>
              </div>

              {visiblePosts.length ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {visiblePosts.map((post) => (
                    <article
                      key={post.id}
                      className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="aspect-video overflow-hidden">
                        <ImageWithFallback src={post.image} alt={post.title} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                      </div>
                      <div className="p-5">
                        <div className="mb-3 flex items-center gap-2">
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white ${getEditorialCategoryTone(post.category)}`}>
                            {post.category}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">{formatEditorialDate(post.publishedAt)}</span>
                        </div>
                        <h3 className="text-xl font-bold leading-snug text-slate-950 dark:text-white">{post.title}</h3>
                        <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-300">{post.excerpt}</p>
                        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{post.readTime}</span>
                          <Button variant="ghost" className="rounded-2xl px-0 text-[#1152d4] hover:bg-transparent hover:text-[#0f47b9]" onClick={() => setSelectedPost(post)}>
                            Read more
                          </Button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
                  No editorial content matches this search yet.
                </div>
              )}

              {hasMore ? (
                <div className="mt-8 flex justify-center">
                  <Button variant="outline" className="rounded-2xl" onClick={() => setVisibleCount((current) => current + 4)}>
                    Load more
                  </Button>
                </div>
              ) : null}
            </section>
          </div>

          <aside className="w-full space-y-6 lg:w-80">
            <div className="rounded-[28px] border border-[#1152d4]/10 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-[#1152d4]" />
                <h2 className="text-lg font-bold text-slate-950 dark:text-white">Upcoming live for you</h2>
              </div>
              <div className="mt-5 space-y-4">
                {shared.dashboard.upcomingSessions.length ? (
                  shared.dashboard.upcomingSessions.slice(0, 3).map((session) => (
                    <button
                      key={session.id}
                      type="button"
                      onClick={() =>
                        session.isLive
                          ? onNavigate(`/courses/${session.courseId}/live/${session.id}`)
                          : onNavigate(`/courses/${session.courseId}`)
                      }
                      className="w-full rounded-2xl border border-slate-200 p-4 text-left transition hover:border-[#1152d4]/30 dark:border-slate-800"
                    >
                      <p className="font-semibold text-slate-950 dark:text-white">{session.courseTitle}</p>
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                        {formatStudentDate(session.startAt)}
                      </p>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-300">
                    No upcoming session is linked to your current enrollments.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-[28px] border border-[#1152d4]/10 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[#1152d4]" />
                <h2 className="text-lg font-bold text-slate-950 dark:text-white">Recommended next</h2>
              </div>
              <div className="mt-5 space-y-4">
                {learningPicks.length ? (
                  learningPicks.map((course) => {
                    const categoryMeta = getStudentCategoryMeta(course.category);
                    return (
                      <button
                        key={course.id}
                        type="button"
                        onClick={() => onNavigate(`/courses/${course.id}`)}
                        className="w-full rounded-2xl border border-slate-200 p-4 text-left transition hover:border-[#1152d4]/30 dark:border-slate-800"
                      >
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${categoryMeta.pillClass}`}>
                          {course.category}
                        </span>
                        <p className="mt-3 font-semibold text-slate-950 dark:text-white">{course.title}</p>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                          Next scheduled touchpoint: {formatStudentDate(course.scheduledAt)}
                        </p>
                      </button>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-300">
                    The catalog has no extra recommendation to highlight right now.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-[28px] bg-[#1152d4] p-6 text-white shadow-xl shadow-[#1152d4]/20">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <h2 className="text-lg font-bold">Need mentor guidance?</h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/85">
                Browse mentors and extend what you read here into concrete next steps.
              </p>
              <Button className="mt-5 rounded-2xl bg-white text-[#1152d4] hover:bg-slate-100" onClick={() => onNavigate('/search')}>
                Browse mentors
              </Button>
            </div>

            <div className="rounded-[28px] border border-[#1152d4]/10 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-[#1152d4]" />
                <h2 className="text-lg font-bold text-slate-950 dark:text-white">Popular today</h2>
              </div>
              <div className="mt-5 space-y-4">
                {popularPosts.map((post) => (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => setSelectedPost(post)}
                    className="flex w-full items-center gap-3 rounded-2xl text-left"
                  >
                    <div className="h-14 w-14 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
                      <ImageWithFallback src={post.image} alt={post.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-semibold text-slate-950 dark:text-white">{post.title}</p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        {post.category} - {post.readTime}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {selectedPost ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="mx-auto my-10 max-w-4xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setSelectedPost(null)} className="text-sm font-semibold text-slate-500 transition hover:text-[#1152d4]">
                  Close
                </button>
                <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white ${getEditorialCategoryTone(selectedPost.category)}`}>
                  {selectedPost.category}
                </span>
              </div>
              <Button variant="outline" className="rounded-2xl" onClick={() => void handleShare(selectedPost)}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>

            <div className="p-6">
              <div className="overflow-hidden rounded-[24px] bg-slate-100 dark:bg-slate-800">
                <ImageWithFallback src={selectedPost.image} alt={selectedPost.title} className="aspect-video w-full object-cover" />
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                <span>{formatEditorialDate(selectedPost.publishedAt)}</span>
                <span>{selectedPost.readTime}</span>
                <span className="inline-flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  {selectedPost.views.toLocaleString()} views
                </span>
              </div>

              <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                {selectedPost.title}
              </h2>
              <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">{selectedPost.excerpt}</p>
              <div className="mt-6 whitespace-pre-line text-base leading-8 text-slate-700 dark:text-slate-200">
                {selectedPost.content}
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                {selectedPost.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:text-slate-300">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">
                <Button className="rounded-2xl bg-[#1152d4] text-white hover:bg-[#0f47b9]" onClick={() => onNavigate('/search')}>
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Find a mentor
                </Button>
                <Button variant="outline" className="rounded-2xl" onClick={() => onNavigate('/student/live')}>
                  <CalendarClock className="mr-2 h-4 w-4" />
                  Check live sessions
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </StudentSpaceShell>
  );
}
