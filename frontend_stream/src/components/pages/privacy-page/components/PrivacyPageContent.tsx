import { ChevronRight, Info, Printer } from 'lucide-react';
import { PublicFooterBar } from '../../../layout/PublicFooterBar';
import { PublicHeaderBar } from '../../../layout/PublicHeaderBar';
import type { PrivacyPageDataModel } from '../privacy.types';

interface PrivacyPageContentProps {
  model: PrivacyPageDataModel;
  onNavigate: (path: string) => void;
}

export function PrivacyPageContent({ model, onNavigate }: PrivacyPageContentProps) {
  return (
    <div className="pvp-page">
      <PublicHeaderBar currentPath="/privacy" onNavigate={onNavigate} />

      <main className="pvp-main pvp-container">
        <div className="pvp-headline">
          <div>
            <nav className="pvp-breadcrumb" aria-label="Breadcrumb">
              <button onClick={() => onNavigate('/')} type="button">
                Home
              </button>
              <ChevronRight size={14} />
              <span>Privacy Policy</span>
            </nav>

            <h1>Privacy Policy</h1>
            <p>Your privacy and data security are our highest priority.</p>
          </div>

          <div className="pvp-headline-actions">
            <button className="pvp-print" onClick={() => window.print()} type="button">
              <Printer size={16} />
              Print Policy
            </button>
            <span>Last Updated: {model.lastUpdated}</span>
          </div>
        </div>

        <div className="pvp-layout">
          <aside className="pvp-sidebar" aria-label="On this page">
            <p>On this page</p>
            {model.sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = model.activeSection === item.id;
              return (
                <button
                  className={`pvp-sidebar-link${isActive ? ' is-active' : ''}`}
                  key={item.id}
                  onClick={() => model.onJumpToSection(item.id)}
                  type="button"
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="pvp-legal-box">
              <h3>Need legal help?</h3>
              <p>Contact our legal team for specific compliance and data requests.</p>
              <button onClick={() => onNavigate('/contact')} type="button">
                legal@eduelevate.com
              </button>
            </div>
          </aside>

          <article className="pvp-article">
            {model.sections.map((section) => (
              <section className="pvp-article-section" id={section.id} key={section.id}>
                <h2>{section.title}</h2>
                <div>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}

                  {section.id === 'data-collection' ? (
                    <ul>
                      {model.dataCollectionHighlights.map((highlight) => {
                        const [label, detail] = highlight.split(':');
                        return (
                          <li key={highlight}>
                            <strong>{label}:</strong> {detail?.trim()}
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}

                  {section.id === 'cookie-policy' ? (
                    <div className="pvp-info-box">
                      <Info size={16} />
                      <div>
                        <h3>Control your cookies</h3>
                        <p>
                          Most browsers accept cookies by default. You can change settings to remove
                          or block cookies.
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {section.id === 'your-rights' ? (
                    <div className="pvp-rights-grid">
                      {model.rightsHighlights.map((item) => (
                        <div key={item}>{item}</div>
                      ))}
                    </div>
                  ) : null}

                  {section.id === 'contact' ? (
                    <address>
                      {model.contactAddressLines.map((line) => (
                        <span key={line}>
                          {line}
                          <br />
                        </span>
                      ))}
                    </address>
                  ) : null}
                </div>
              </section>
            ))}
          </article>
        </div>
      </main>

      <PublicFooterBar onNavigate={onNavigate} />
    </div>
  );
}
