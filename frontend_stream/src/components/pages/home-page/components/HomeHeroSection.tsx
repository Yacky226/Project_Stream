import { Search } from 'lucide-react';
import { ImageWithFallback } from '../../../figma/ImageWithFallback';
import type { HomePageDataModel } from '../useHomePageData';

interface HomeHeroSectionProps {
  model: HomePageDataModel;
}

export function HomeHeroSection({ model }: HomeHeroSectionProps) {
  return (
    <section className="el-hero-section">
      <div className="el-container">
        <div className="el-hero-grid">
          <div className="el-hero-content">
            <div className="el-hero-badge">
              <span className="el-hero-badge-dot-wrap">
                <span className="el-hero-badge-dot-ping"></span>
                <span className="el-hero-badge-dot"></span>
              </span>
              Join active students
            </div>

            <h1 className="el-hero-title">
              Master the Skills of <span className="el-primary-text">Tomorrow</span>
            </h1>

            <p className="el-hero-subtitle">
              Unlock your potential with expert-led courses designed for the future of work.
              Learn faster with real learner feedback and updated course content.
            </p>

            <div className="el-hero-search-wrap">
              <Search className="el-hero-search-icon" size={20} />
              <input
                className="el-hero-search-input"
                placeholder="What do you want to learn?"
                type="text"
              />
              <button
                className="el-hero-search-btn"
                onClick={() => model.onNavigate('/catalog')}
                type="button"
              >
                Explore
              </button>
            </div>

            <div className="el-category-tags">
              {model.categoryTags.length > 0 ? (
                model.categoryTags.map((category) => (
                  <span className="el-category-tag" key={category}>
                    {category}
                  </span>
                ))
              ) : (
                <span className="el-category-tag">Backend synced</span>
              )}
            </div>
          </div>

          <div className="el-hero-visual-wrap">
            <div className="el-hero-visual-card">
              {model.heroImage ? (
                <ImageWithFallback
                  alt="Featured learning experience"
                  className="el-hero-image"
                  src={model.heroImage}
                />
              ) : (
                <div className="el-hero-image-fallback">No featured image yet</div>
              )}
              <div className="el-hero-image-overlay"></div>
              <div className="el-live-pill">
                <div className="el-live-avatars">
                  {model.liveAvatars.map((avatar) => (
                    <img alt="Learner avatar" className="el-live-avatar" key={avatar} src={avatar} />
                  ))}
                </div>
                <p className="el-live-text">Latest learner reviews</p>
              </div>
            </div>
            <div className="el-hero-blur el-hero-blur-top"></div>
            <div className="el-hero-blur el-hero-blur-bottom"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
