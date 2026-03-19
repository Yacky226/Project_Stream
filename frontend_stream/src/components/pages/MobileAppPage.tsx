import { Apple, Bell, Download, Play, RefreshCw, Sparkles, Star, Zap } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { PublicFooterBar } from '../layout/PublicFooterBar';
import { PublicHeaderBar } from '../layout/PublicHeaderBar';
import './MobileAppPage.css';

interface MobileAppPageProps {
  onNavigate: (path: string) => void;
}

const heroMockup =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBluSMxEDcMsws6jNDKnIb92UMTI9nRyViOL3kRUTEUxdM9NuENEz5fdqwSvjvdaXg80qaiPqbDhx1HXu9X7_oEP-hwNBgyppjSgf3tSuXaFtSXO9olgnw-ETQDKU6Cwkgzj3C36SEGvFHGsmJumHkbbOA2Ca3d1zeUuDza_2SV-CwXVe058lgf9WBnMVFxFZ0BY1LRGXQnsJ5kTk1ibul1cu8603TlawnlZ1gxgXVbONJUZEPvwjFb4JnqqePt5BuSUF4uVDya7j4';

const testimonials = [
  {
    name: 'Sarah Jenkins',
    role: 'Marketing Executive',
    quote:
      'The EduElevate mobile app is a game changer. The interface is elegant and offline mode helps me learn during commutes.',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCH4q4Gje1l3F6TlTKpKiuShQvPs_Ys7wt1DexYdZqGFiHkGHmyyNiVV7z2NbmCL-d_wNRxcjY3O5Ux7oyFnJPZZEIJxSKKtsRp9TLS99ej738OlONuM_pLw21ls6WbYyINqInKC_xp7Z6Yq3X7YE_-HOaV15LwH7BtkaghaHR8GfK6hHXK6jpcgaqlvqPDn1iBRjc3uoqI55nYaPiuVwXC_qnEDtrDbRQ8vK2JG1bnuh06lm8IREaNDMW_GeXE97zoQXNStPkSlHs',
  },
  {
    name: 'David Chen',
    role: 'Software Engineer',
    quote:
      'The micro-learning format fits my schedule perfectly. I can keep momentum even during busy weeks.',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAwAXTpD-B3PU4C8du7_1ZUFmTFItHyhNAqTFHO62PssArt9ELFBJ6zekSvTjs24-tqC5W-klD-3PKVCijcdTrPzyp4_nt01GZpF9PRIc4qis_RqlJ-zIk794yd-bPoNQ7sM-r6kdlpcOxgNZrj5o28s1erJieU9I64p_PUkLGJbgWj5vtk4_IzVzvlhQeztoAqQgruSabqfjKJ0ERGqXCn8QuKc2zQ3JwCbG3ZMsXYjY2MFAj9IK3eafwmemDa1jGSXkVkLz_w_7M',
  },
  {
    name: 'Elena Rodriguez',
    role: 'Graphic Designer',
    quote:
      'Video quality is great even on limited bandwidth, and offline download makes learning addictive.',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDjSXLVZHt9t7PbulPb4jKy90-lro-1eK2S1_cH392iALGLd347Yl25ii1lBd6W742ybZfHbgG3MLo6WasgbNHbSnzTShoBv61rx5_dTm60qAGUe9y1auDhasvmittWApkUn0eUsHH9O47Ot315yDyWrFz5sLE2IJt0j-T0ZnIR_IFsYAVIwdYPL9K2Nk1cxk-R5YpW2wwsdRsoWK-V-Az5q2RVoFLmB8wHta3333jKyu1KFPzdLdJr_VHX_tSC-4EKIKTUr9X3DAI',
  },
];

const features = [
  { icon: Download, title: 'Offline Access', desc: 'Download courses and learn without internet.' },
  { icon: Zap, title: 'Micro-learning', desc: 'Short lessons designed for retention.' },
  { icon: RefreshCw, title: 'Progress Syncing', desc: 'Continue across phone, tablet and desktop.' },
  { icon: Bell, title: 'Smart Reminders', desc: 'Personalized nudges to keep your streak alive.' },
];

export function MobileAppPage({ onNavigate }: MobileAppPageProps) {
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
                <ImageWithFallback src={heroMockup} alt="Mobile app dashboard" className="ma-phone-image" />
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
              {features.map((item) => {
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
              {testimonials.map((item) => (
                <article key={item.name} className="ma-testimonial-card">
                  <div className="ma-rating">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={`${item.name}-${index}`} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="ma-quote">"{item.quote}"</p>
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
