import { useMemo, useState } from 'react';
import {
  ChevronRight,
  Cookie,
  Database,
  Info,
  Mail,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import { PublicFooterBar } from '../layout/PublicFooterBar';
import { PublicHeaderBar } from '../layout/PublicHeaderBar';
import './PrivacyPage.css';

interface PrivacyPageProps {
  onNavigate: (path: string) => void;
}

interface PrivacySection {
  id: string;
  paragraphs: string[];
  title: string;
}

const policySections: PrivacySection[] = [
  {
    id: 'introduction',
    title: '1. Introduction',
    paragraphs: [
      'Welcome to EduElevate. We are committed to protecting your personal information and your privacy rights.',
      'This notice explains what we collect, how we use it, and what rights you have in relation to your information.',
    ],
  },
  {
    id: 'data-collection',
    title: '2. Data Collection',
    paragraphs: [
      'We collect information you provide directly when creating an account, purchasing courses, or contacting support.',
      'We also collect technical and usage information to keep the service secure and improve your learning experience.',
      'Automatically collected data may include logs, device information, and approximate location based on IP.',
    ],
  },
  {
    id: 'cookie-policy',
    title: '3. Cookie Policy',
    paragraphs: [
      'We use cookies and similar technologies to maintain sessions, remember preferences, and improve product performance.',
      'You can configure your browser settings to refuse or remove cookies, but some features may not work properly.',
    ],
  },
  {
    id: 'your-rights',
    title: '4. Your Rights',
    paragraphs: [
      'Depending on your jurisdiction, you may request access, correction, deletion, or portability of your personal data.',
      'You may also object to certain processing activities and withdraw consent where processing relies on consent.',
    ],
  },
  {
    id: 'contact',
    title: '5. Contact Us',
    paragraphs: [
      'If you have any questions about this policy, contact us at privacy@eduelevate.com.',
      'You may also write to our legal team for formal requests related to privacy and compliance matters.',
    ],
  },
];

const sidebarItems = [
  { id: 'introduction', label: 'Introduction', icon: Info },
  { id: 'data-collection', label: 'Data Collection', icon: Database },
  { id: 'cookie-policy', label: 'Cookie Policy', icon: Cookie },
  { id: 'your-rights', label: 'Your Rights', icon: ShieldCheck },
  { id: 'contact', label: 'Contact Us', icon: Mail },
];

export function PrivacyPage({ onNavigate }: PrivacyPageProps) {
  const [activeSection, setActiveSection] = useState('introduction');

  const lastUpdated = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
  }, []);

  const handleJump = (sectionId: string) => {
    setActiveSection(sectionId);
    const target = document.getElementById(sectionId);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="pvp-page">
      <PublicHeaderBar currentPath="/privacy" onNavigate={onNavigate} />

      <main className="pvp-main pvp-container">
        <div className="pvp-headline">
          <div>
            <nav className="pvp-breadcrumb" aria-label="Breadcrumb">
              <button onClick={() => onNavigate('/')} type="button">Home</button>
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
            <span>Last Updated: {lastUpdated}</span>
          </div>
        </div>

        <div className="pvp-layout">
          <aside className="pvp-sidebar" aria-label="On this page">
            <p>On this page</p>
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  className={`pvp-sidebar-link${isActive ? ' is-active' : ''}`}
                  key={item.id}
                  onClick={() => handleJump(item.id)}
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
              <button onClick={() => onNavigate('/contact')} type="button">legal@eduelevate.com</button>
            </div>
          </aside>

          <article className="pvp-article">
            {policySections.map((section) => (
              <section className="pvp-article-section" id={section.id} key={section.id}>
                <h2>{section.title}</h2>
                <div>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}

                  {section.id === 'data-collection' && (
                    <ul>
                      <li>
                        <strong>Log and Usage Data:</strong> diagnostic and performance information.
                      </li>
                      <li>
                        <strong>Device Data:</strong> browser, operating system, and client metadata.
                      </li>
                      <li>
                        <strong>Location Data:</strong> approximate location based on network identifiers.
                      </li>
                    </ul>
                  )}

                  {section.id === 'cookie-policy' && (
                    <div className="pvp-info-box">
                      <Info size={16} />
                      <div>
                        <h3>Control your cookies</h3>
                        <p>
                          Most browsers accept cookies by default. You can change settings to remove or
                          block cookies.
                        </p>
                      </div>
                    </div>
                  )}

                  {section.id === 'your-rights' && (
                    <div className="pvp-rights-grid">
                      <div>Request access to your data</div>
                      <div>Request rectification</div>
                      <div>Request erasure</div>
                      <div>Object to processing</div>
                    </div>
                  )}

                  {section.id === 'contact' && (
                    <address>
                      EduElevate Legal Department
                      <br />
                      123 Education Plaza, Suite 400
                      <br />
                      San Francisco, CA 94103
                      <br />
                      United States
                    </address>
                  )}
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
