import { Apple, Play, Sparkles, Star } from 'lucide-react';
import { ImageWithFallback } from '../../../figma/ImageWithFallback';
import { PublicFooterBar } from '../../../layout/PublicFooterBar';
import { PublicHeaderBar } from '../../../layout/PublicHeaderBar';
import type { MobileAppPageDataModel } from '../mobileApp.types';

interface MobileAppPageContentProps {
  model: MobileAppPageDataModel;
  onNavigate: (path: string) => void;
}

export function MobileAppPageContent({ model, onNavigate }: MobileAppPageContentProps) {
  return (
    <div className="ma-page">
      <PublicHeaderBar currentPath="/mobile-app" onNavigate={onNavigate} />

      <main className="ma-main">
        <section className="ma-hero">
          <div className="ma-shell ma-hero-grid">
            <div className="ma-hero-copy">
              <div className="ma-badge">
                <Sparkles className="h-4 w-4" />
                Awarded Best Mobile Learning App 2024
              </div>
              <h1 className="ma-hero-title">
                Learn Anywhere with <span>EduElevate</span>
              </h1>
              <p className="ma-hero-subtitle">
                Master new skills on the go with a premium mobile experience: offline access,
                interactive lessons, and seamless progress sync.
              </p>
              <div className="ma-store-actions">
                <button type="button" className="ma-store-btn is-dark">
                  <Apple className="h-8 w-8" />
                  <div>
                    <p>Download on the</p>
                    <strong>App Store</strong>
                  </div>
                </button>
                <button type="button" className="ma-store-btn is-dark">
                  <Play className="h-8 w-8" />
                  <div>
                    <p>Get it on</p>
                    <strong>Google Play</strong>
                  </div>
                </button>
              </div>
            </div>

            <div className="ma-hero-visual">
              <div className="ma-phone">
                <ImageWithFallback
                  src={model.heroMockup}
                  alt="Mobile app dashboard"
                  className="ma-phone-image"
                />
                <div className="ma-phone-overlay" />
                <div className="ma-floating-card ma-top-card">
                  <div className="ma-floating-icon">
                    <Play className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="ma-floating-title">Next Lesson</p>
                    <p className="ma-floating-subtitle">Advanced UI Design (12:40)</p>
                  </div>
                </div>
                <div className="ma-floating-card ma-bottom-card">
                  <div className="ma-progress-track">
                    <div className="ma-progress-value" />
                  </div>
                  <p className="ma-floating-title">Course Progress: 75%</p>
                </div>
              </div>
              <div className="ma-hero-glow" />
            </div>
          </div>
        </section>

        <section className="ma-features">
          <div className="ma-shell">
            <div className="ma-section-head">
              <h2>Tailored for Mobile Excellence</h2>
              <p>Education that fits into your lifestyle, not the other way around.</p>
            </div>
            <div className="ma-features-grid">
              {model.features.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="ma-feature-card">
                    <div className="ma-feature-icon">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="ma-testimonials">
          <div className="ma-shell">
            <div className="ma-section-head ma-section-head-left">
              <h2>Loved by 50,000+ Students</h2>
              <p>Real stories from learners who use EduElevate every day.</p>
            </div>
            <div className="ma-testimonials-grid">
              {model.testimonials.map((item) => (
                <article key={item.name} className="ma-testimonial-card">
                  <div className="ma-rating">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={`${item.name}-${index}`} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="ma-quote">&quot;{item.quote}&quot;</p>
                  <div className="ma-author">
                    <ImageWithFallback src={item.avatar} alt={item.name} className="ma-author-avatar" />
                    <div>
                      <h4>{item.name}</h4>
                      <p>{item.role}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="ma-cta">
              <h3>Ready to learn on mobile?</h3>
              <p>Start now and continue your progress across every device.</p>
              <button type="button" className="ma-cta-btn" onClick={() => onNavigate('/catalog')}>
                Explore Courses
              </button>
            </div>
          </div>
        </section>
      </main>

      <PublicFooterBar onNavigate={onNavigate} />
    </div>
  );
}
