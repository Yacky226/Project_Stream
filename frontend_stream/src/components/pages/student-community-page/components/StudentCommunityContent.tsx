import { editorialPosts } from '../../../../lib/editorialContent';
import type { StudentCommunityDataModel } from '../studentCommunity.types';
import { StudentCommunityEditorialFeed } from './StudentCommunityEditorialFeed';
import { StudentCommunityHeader } from './StudentCommunityHeader';
import { StudentCommunityHero } from './StudentCommunityHero';
import { StudentCommunityPostModal } from './StudentCommunityPostModal';
import { StudentCommunitySidebar } from './StudentCommunitySidebar';

interface StudentCommunityContentProps {
  model: StudentCommunityDataModel;
  onNavigate: (path: string | number) => void;
}

export function StudentCommunityContent({ model, onNavigate }: StudentCommunityContentProps) {
  return (
    <>
      <div className="space-y-8">
        <StudentCommunityHeader
          totalArticles={editorialPosts.length}
          upcomingSessions={model.shared.dashboard?.stats.upcomingSessions || 0}
          activeCourses={model.shared.dashboard?.stats.activeCourses || 0}
        />

        {model.showHero ? (
          <StudentCommunityHero
            post={model.featuredPost}
            onOpenPost={model.openPost}
            onSharePost={model.handleShare}
          />
        ) : null}

        <div className="flex flex-col gap-12 lg:flex-row">
          <div className="flex-1">
            <StudentCommunityEditorialFeed
              categories={model.categories}
              activeCategory={model.activeCategory}
              visiblePosts={model.visiblePosts}
              hasMore={model.hasMore}
              onChangeCategory={model.setActiveCategory}
              onOpenPost={model.openPost}
              onNavigate={onNavigate}
              onLoadMore={model.loadMore}
            />
          </div>
          <StudentCommunitySidebar
            shared={model.shared}
            popularPosts={model.popularPosts}
            learningPicks={model.learningPicks}
            onNavigate={onNavigate}
            onOpenPost={model.openPost}
          />
        </div>
      </div>

      <StudentCommunityPostModal
        post={model.selectedPost}
        onClose={model.closePost}
        onSharePost={model.handleShare}
        onNavigate={onNavigate}
      />
    </>
  );
}
