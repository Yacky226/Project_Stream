import { Share2 } from 'lucide-react';
import {
  getEditorialCategoryTone,
  type EditorialPost,
} from '../../../../lib/editorialContent';
import { ImageWithFallback } from '../../../figma/ImageWithFallback';
import { Button } from '../../../ui/button';

interface StudentCommunityHeroProps {
  post: EditorialPost;
  onOpenPost: (post: EditorialPost) => void;
  onSharePost: (post: EditorialPost) => Promise<void>;
}

export function StudentCommunityHero({
  post,
  onOpenPost,
  onSharePost,
}: StudentCommunityHeroProps) {
  return (
    <section className="overflow-hidden rounded-[32px] bg-slate-900">
      <div className="relative min-h-[360px]">
        <ImageWithFallback
          src={post.image}
          alt={post.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#101622] via-[#101622]/60 to-[#101622]/20" />
        <div className="relative flex min-h-[360px] flex-col justify-end p-6 lg:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white ${getEditorialCategoryTone(post.category)}`}>
              {post.category}
            </span>
            <span className="text-sm font-medium text-slate-300">{post.readTime}</span>
          </div>
          <h2 className="mt-5 max-w-4xl text-3xl font-black leading-tight text-white lg:text-5xl">
            {post.title}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">{post.excerpt}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              className="rounded-2xl bg-[#1152d4] text-white hover:bg-[#0f47b9]"
              onClick={() => onOpenPost(post)}
            >
              Read spotlight
            </Button>
            <Button
              variant="outline"
              className="rounded-2xl border-white/20 bg-white/10 text-white hover:bg-white/15"
              onClick={() => void onSharePost(post)}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
