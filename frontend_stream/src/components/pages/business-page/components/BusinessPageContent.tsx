import {
  ArrowRight,
  PlayCircle,
  Rocket,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { ImageWithFallback } from '../../../figma/ImageWithFallback';
import { PublicFooterBar } from '../../../layout/PublicFooterBar';
import { PublicHeaderBar } from '../../../layout/PublicHeaderBar';
import type { BusinessPageDataModel } from '../business.types';

interface BusinessPageContentProps {
  model: BusinessPageDataModel;
  onNavigate: (path: string) => void;
}

export function BusinessPageContent({ model, onNavigate }: BusinessPageContentProps) {
  return (
    <div className="biz-page">
      <PublicHeaderBar currentPath="/business" onNavigate={onNavigate} />
      <main className="biz-main">
        <section className="biz-hero">
          <div className="biz-shell biz-hero-grid">
            <div className="biz-hero-copy">
              <div className="biz-badge">
                <Sparkles className="h-4 w-4" />
                Enterprise-Grade Upskilling
              </div>

              <h1 className="biz-hero-title">
                Empower Your <span>Workforce</span> with elite digital learning.
              </h1>

              <p className="biz-hero-subtitle">
                Drive measurable growth with customized corporate training designed for modern
                teams, from technical mastery to leadership excellence.
              </p>

              <div className="biz-hero-actions">
                <button
                  className="biz-btn biz-btn-primary"
                  onClick={() => onNavigate('/contact')}
                  type="button"
                >
                  Start Transforming
                </button>
                <button
                  className="biz-btn biz-btn-secondary"
                  onClick={() => onNavigate('/blog')}
                  type="button"
                >
                  <PlayCircle className="h-5 w-5" />
                  Watch Tour
                </button>
              </div>

              <div className="biz-stats-grid">
                {model.stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <article className="biz-stat-card" key={stat.label}>
                      <div className="biz-stat-icon">
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="biz-stat-value">{stat.value}</p>
                      <p className="biz-stat-label">{stat.label}</p>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="biz-hero-visual">
              <div className="biz-hero-image-wrap">
                <ImageWithFallback
                  alt="Corporate team"
                  className="biz-hero-image"
                  src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1400&auto=format&fit=crop"
                />
              </div>

              <div className="biz-floating-card">
                <div className="biz-floating-icon">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="biz-floating-value">94%</p>
                  <p className="biz-floating-label">Retention Rate Increase</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="biz-trust-strip">
          <div className="biz-shell">
            <p className="biz-strip-label">Trusted by 5,000+ industry leaders</p>
            <div className="biz-logo-row">
              {model.trustBrands.map((brand) => (
                <div className="biz-logo-pill" key={brand}>
                  {brand}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="biz-benefits">
          <div className="biz-shell">
            <div className="biz-section-head">
              <h3>Strategic Benefits</h3>
              <h2>Built for High-Growth Teams</h2>
              <p>Comprehensive tools to manage, measure, and scale organizational knowledge.</p>
            </div>

            <div className="biz-benefits-grid">
              {model.benefitCards.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <article className="biz-benefit-card" key={benefit.title}>
                    <div className="biz-benefit-icon">
                      <Icon className="h-8 w-8" />
                    </div>
                    <h4>{benefit.title}</h4>
                    <p>{benefit.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="biz-case">
          <div className="biz-shell">
            <div className="biz-case-panel">
              <div className="biz-case-image-wrap">
                <ImageWithFallback
                  alt="Case study team"
                  className="biz-case-image"
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1400&auto=format&fit=crop"
                />
              </div>

              <div className="biz-case-content">
                <div className="biz-case-badge">
                  <Sparkles className="h-5 w-5" />
                  <span>Case Study</span>
                </div>

                <h2>How NexaCorp Scaled Their Engineering Team by 300%</h2>

                <p className="biz-case-quote">
                  &quot;EliteLearn became our knowledge infrastructure. We cut onboarding time in
                  half and doubled innovation scores.&quot;
                </p>

                <div className="biz-case-author">
                  <div className="biz-case-author-avatar">
                    <ImageWithFallback
                      alt="Sarah Chen"
                      className="biz-case-avatar-image"
                      src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop"
                    />
                  </div>
                  <div>
                    <p className="biz-case-author-name">Sarah Chen</p>
                    <p className="biz-case-author-role">VP Talent Development, NexaCorp</p>
                  </div>
                </div>

                <button className="biz-case-link" onClick={() => onNavigate('/blog')} type="button">
                  Read the full story
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="biz-cta">
          <div className="biz-shell biz-cta-shell">
            <div className="biz-cta-icon-wrap">
              <Rocket className="h-10 w-10" />
            </div>
            <h2>Ready to Elevate Your Organization?</h2>
            <p>Join world-class companies using EliteLearn to build the teams of tomorrow.</p>
            <div className="biz-cta-actions">
              <button
                className="biz-btn biz-btn-primary"
                onClick={() => onNavigate('/contact')}
                type="button"
              >
                Book Your Demo Now
              </button>
              <button
                className="biz-btn biz-btn-secondary"
                onClick={() => onNavigate('/catalog')}
                type="button"
              >
                Explore our catalog
              </button>
            </div>
            <p className="biz-cta-footnote">No credit card required. Personal tour in 24 hours.</p>
          </div>
        </section>
      </main>
      <PublicFooterBar onNavigate={onNavigate} />
    </div>
  );
}
