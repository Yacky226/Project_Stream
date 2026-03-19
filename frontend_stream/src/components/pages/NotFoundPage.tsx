import {
  BookOpen,
  Home,
  LayoutDashboard,
  TriangleAlert,
} from 'lucide-react';
import { PublicFooterBar } from '../layout/PublicFooterBar';
import { PublicHeaderBar } from '../layout/PublicHeaderBar';
import './NotFoundPage.css';

interface NotFoundPageProps {
  onNavigate: (path: string) => void;
}

export function NotFoundPage({ onNavigate }: NotFoundPageProps) {
  return (
    <div className="nfp-page">
      <PublicHeaderBar currentPath="/404" onNavigate={onNavigate} />

      <main className="nfp-main">
        <div className="nfp-bg-blur nfp-bg-blur-one"></div>
        <div className="nfp-bg-blur nfp-bg-blur-two"></div>

        <section className="nfp-content">
          <div className="nfp-illustration">
            <div className="nfp-illustration-inner">
              <BookOpen size={84} />
              <span className="nfp-alert-badge">
                <TriangleAlert size={26} />
              </span>
              <div className="nfp-dots" aria-hidden="true">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>

          <div className="nfp-copy">
            <p>Error 404</p>
            <h1>Oops! You wandered off the curriculum</h1>
            <p>
              Looks like this lesson is still being written. Let us get you back on track
              with the right pages.
            </p>
          </div>

          <div className="nfp-actions">
            <button className="nfp-primary" onClick={() => onNavigate('/')} type="button">
              <Home size={16} />
              Back to Homepage
            </button>
            <button onClick={() => onNavigate('/catalog')} type="button">
              <BookOpen size={16} />
              Browse Catalog
            </button>
            <button onClick={() => onNavigate('/dashboard')} type="button">
              <LayoutDashboard size={16} />
              Student Dashboard
            </button>
          </div>
        </section>
      </main>

      <PublicFooterBar onNavigate={onNavigate} />
    </div>
  );
}
