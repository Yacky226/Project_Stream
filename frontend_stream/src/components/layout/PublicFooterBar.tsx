import { Facebook, GraduationCap, Instagram, Twitter } from 'lucide-react';

interface PublicFooterBarProps {
  onNavigate: (path: string) => void;
}

const footerColumns = [
  {
    title: 'Platform',
    links: [
      { label: 'Browse Courses', path: '/catalog' },
      { label: 'Mentorship', path: '/search' },
      { label: 'Roadmaps', path: '/courses/categories' },
      { label: 'Pricing', path: '/business' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', path: '/business' },
      { label: 'Careers', path: '/careers' },
      { label: 'Partners', path: '/blog' },
      { label: 'Blog', path: '/blog' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', path: '/help' },
      { label: 'Privacy Policy', path: '/privacy' },
      { label: 'Terms of Service', path: '/terms' },
      { label: 'Cookie Settings', path: '/privacy' },
    ],
  },
  {
    title: 'Apps',
    links: [
      { label: 'iOS App', path: '/mobile-app' },
      { label: 'Android App', path: '/mobile-app' },
      { label: 'Web Player', path: '/' },
    ],
  },
];

export function PublicFooterBar({ onNavigate }: PublicFooterBarProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="elite-footer">
      <div className="elite-footer__inner">
        <div className="elite-footer__grid">
          <div className="elite-footer__brand-col">
            <button type="button" onClick={() => onNavigate('/')} className="elite-footer__brand">
              <span className="elite-footer__brand-icon">
                <GraduationCap className="h-5 w-5" />
              </span>
              <span className="elite-footer__brand-name">EliteLearn</span>
            </button>

            <p className="elite-footer__description">
              Empowering the next generation of digital leaders through premium education and global networking.
            </p>

            <div className="elite-footer__socials">
              <button type="button" className="elite-footer__social-btn" aria-label="Facebook">
                <Facebook className="h-4 w-4" />
              </button>
              <button type="button" className="elite-footer__social-btn" aria-label="Twitter">
                <Twitter className="h-4 w-4" />
              </button>
              <button type="button" className="elite-footer__social-btn" aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </button>
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title} className="elite-footer__column">
              <h4 className="elite-footer__column-title">{column.title}</h4>
              <ul className="elite-footer__links">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.path}-${link.label}`}>
                    <button
                      type="button"
                      onClick={() => onNavigate(link.path)}
                      className="elite-footer__link"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="elite-footer__bottom">
          <p className="elite-footer__copyright">© {currentYear} EliteLearn Inc. All rights reserved.</p>
          <div className="elite-footer__legal">
            <button type="button" onClick={() => onNavigate('/help')} className="elite-footer__legal-link">Security</button>
            <button type="button" onClick={() => onNavigate('/search')} className="elite-footer__legal-link">Sitemap</button>
            <button type="button" onClick={() => onNavigate('/privacy')} className="elite-footer__legal-link">Legal</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

