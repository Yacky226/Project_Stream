import { CalendarClock, GraduationCap, Share2, TrendingUp } from 'lucide-react';
import {
  formatEditorialDate,
  getEditorialCategoryTone,
  type EditorialPost,
} from '../../../../lib/editorialContent';
import { ImageWithFallback } from '../../../figma/ImageWithFallback';
import { Button } from '../../../ui/button';

interface StudentCommunityPostModalProps {
  post: EditorialPost | null;
  onClose: () => void;
  onSharePost: (post: EditorialPost) => Promise<void>;
  onNavigate: (path: string | number) => void;
}

export function StudentCommunityPostModal({
  post,
  onClose,
  onSharePost,
  onNavigate,
}: StudentCommunityPostModalProps) {
  if (!post) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="mx-auto my-10 max-w-4xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} className="text-sm font-semibold text-slate-500 transition hover:text-[#1152d4]">
              Close
            </button>
            <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white ${getEditorialCategoryTone(post.category)}`}>
              {post.category}
            </span>
          </div>
          <Button variant="outline" className="rounded-2xl" onClick={() => void onSharePost(post)}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>

        <div className="p-6">
          <div className="overflow-hidden rounded-[24px] bg-slate-100 dark:bg-slate-800">
            <ImageWithFallback src={post.image} alt={post.title} className="aspect-video w-full object-cover" />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span>{formatEditorialDate(post.publishedAt)}</span>
            <span>{post.readTime}</span>
            <span className="inline-flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {post.views.toLocaleString()} views
            </span>
          </div>

          <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
            {post.title}
          </h2>
          <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">{post.excerpt}</p>
          <div className="mt-6 whitespace-pre-line text-base leading-8 text-slate-700 dark:text-slate-200">
            {post.content}
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
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
  );
}
