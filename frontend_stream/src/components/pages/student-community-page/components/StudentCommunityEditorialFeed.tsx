import { ArrowRight } from 'lucide-react';
import {
  formatEditorialDate,
  getEditorialCategoryTone,
  type EditorialPost,
} from '../../../../lib/editorialContent';
import { ImageWithFallback } from '../../../figma/ImageWithFallback';
import { Button } from '../../../ui/button';

interface EditorialCategory {
  id: string;
  label: string;
  count: number;
}

interface StudentCommunityEditorialFeedProps {
  categories: EditorialCategory[];
  activeCategory: string;
  visiblePosts: EditorialPost[];
  hasMore: boolean;
  onChangeCategory: (categoryId: string) => void;
  onOpenPost: (post: EditorialPost) => void;
  onNavigate: (path: string | number) => void;
  onLoadMore: () => void;
}

export function StudentCommunityEditorialFeed({
  categories,
  activeCategory,
  visiblePosts,
  hasMore,
  onChangeCategory,
  onOpenPost,
  onNavigate,
  onLoadMore,
}: StudentCommunityEditorialFeedProps) {
  return (
    <section className="space-y-8">
      <section className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onChangeCategory(category.id)}
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
            <ArrowRight className="ml-2 h-4 w-4" />
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
                    <Button
                      variant="ghost"
                      className="rounded-2xl px-0 text-[#1152d4] hover:bg-transparent hover:text-[#0f47b9]"
                      onClick={() => onOpenPost(post)}
                    >
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
            <Button variant="outline" className="rounded-2xl" onClick={onLoadMore}>
              Load more
            </Button>
          </div>
        ) : null}
      </section>
    </section>
  );
}
