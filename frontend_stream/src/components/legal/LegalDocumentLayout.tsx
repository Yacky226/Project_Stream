import { useEffect, useState } from 'react';
import type { KeyboardEvent } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Printer,
  Search,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface LegalBulletItem {
  title?: string;
  text: string;
}

export interface LegalCallout {
  title: string;
  body: string;
}

export interface LegalSection {
  id: string;
  title: string;
  navLabel: string;
  icon: LucideIcon;
  paragraphs?: string[];
  bullets?: LegalBulletItem[];
  checklist?: string[];
  callout?: LegalCallout;
  addressLines?: string[];
}

interface LegalDocumentLayoutProps {
  onNavigate: (path: string) => void;
  title: string;
  subtitle: string;
  lastUpdated: string;
  printLabel: string;
  sections: LegalSection[];
  supportTitle: string;
  supportDescription: string;
  supportActionLabel: string;
  supportAction: () => void;
  activeFooterLink: 'privacy' | 'terms';
}

const HEADER_LINKS = [
  { label: 'Courses', path: '/catalog' },
  { label: 'Business', path: '/business' },
  { label: 'Resources', path: '/blog' },
  { label: 'Contact', path: '/contact' },
];

function SidebarLink({
  active,
  label,
  href,
  Icon,
  onClick,
}: {
  active: boolean;
  label: string;
  href: string;
  Icon: LucideIcon;
  onClick: () => void;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
        active
          ? 'bg-[#1152d4]/10 text-[#1152d4] shadow-sm'
          : 'text-slate-600 hover:bg-slate-100 hover:text-[#1152d4]'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </a>
  );
}

export function LegalDocumentLayout({
  onNavigate,
  title,
  subtitle,
  lastUpdated,
  printLabel,
  sections,
  supportTitle,
  supportDescription,
  supportActionLabel,
  supportAction,
  activeFooterLink,
}: LegalDocumentLayoutProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? '');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

        if (visible?.target?.id) {
          setActiveSection(visible.target.id);
        }
      },
      {
        rootMargin: '-20% 0px -55% 0px',
        threshold: [0.1, 0.25, 0.5],
      },
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [sections]);

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onNavigate('/search');
    }
  };

  return (
    <div
      className="min-h-screen bg-[#fafafb] text-slate-900"
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      <div className="relative flex min-h-screen flex-col overflow-x-hidden">
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/85 px-6 py-4 backdrop-blur-md lg:px-20">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div className="flex items-center gap-8">
              <button
                type="button"
                onClick={() => onNavigate('/')}
                className="flex items-center gap-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1152d4] text-white">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <h2
                  className="text-xl font-bold tracking-tight text-slate-900"
                  style={{ fontFamily: 'Lexend, system-ui, sans-serif' }}
                >
                  EduElevate
                </h2>
              </button>

              <nav className="hidden items-center gap-8 md:flex">
                {HEADER_LINKS.map((link) => (
                  <button
                    key={link.path}
                    type="button"
                    onClick={() => onNavigate(link.path)}
                    className="text-sm font-medium text-slate-600 transition-colors hover:text-[#1152d4]"
                  >
                    {link.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <label className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="h-10 w-64 rounded-xl border-none bg-slate-100 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#1152d4]/20"
                  placeholder="Search documentation..."
                  type="text"
                />
              </label>
              <button
                type="button"
                onClick={() => onNavigate('/auth/signin')}
                className="rounded-xl bg-[#1152d4] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#0f47b9]"
              >
                Sign In
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-20">
          <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <nav className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500">
                <button type="button" onClick={() => onNavigate('/')} className="hover:text-[#1152d4]">
                  Home
                </button>
                <ChevronRight className="h-4 w-4" />
                <span className="text-slate-900">{title}</span>
              </nav>
              <h1
                className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl"
                style={{ fontFamily: 'Lexend, system-ui, sans-serif' }}
              >
                {title}
              </h1>
              <p className="mt-4 text-lg text-slate-600">{subtitle}</p>
            </div>

            <div className="flex flex-col items-end gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
              >
                <Printer className="h-4 w-4" />
                {printLabel}
              </button>
              <span className="text-xs font-medium text-slate-400">Last Updated: {lastUpdated}</span>
            </div>
          </div>

          <div className="flex flex-col gap-10 lg:flex-row">
            <aside className="hidden h-fit w-64 shrink-0 flex-col gap-2 lg:sticky lg:top-28 lg:flex">
              <p className="mb-2 px-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                On this page
              </p>
              {sections.map((section) => (
                <SidebarLink
                  key={section.id}
                  active={activeSection === section.id}
                  label={section.navLabel}
                  href={`#${section.id}`}
                  Icon={section.icon}
                  onClick={() => setActiveSection(section.id)}
                />
              ))}

              <div className="mt-8 rounded-[24px] border border-[#1152d4]/10 bg-[#1152d4]/5 p-6">
                <p className="text-sm font-bold text-[#1152d4]">{supportTitle}</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{supportDescription}</p>
                <button
                  type="button"
                  onClick={supportAction}
                  className="mt-4 text-xs font-bold text-[#1152d4] underline"
                >
                  {supportActionLabel}
                </button>
              </div>
            </aside>

            <div className="flex-1 rounded-[28px] border border-slate-100 bg-white p-8 shadow-sm md:p-12">
              {sections.map((section, index) => {
                const SectionIcon = section.icon;
                return (
                  <section
                    key={section.id}
                    id={section.id}
                    className={index === sections.length - 1 ? 'scroll-mt-28' : 'mb-12 scroll-mt-28'}
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-[#1152d4]/10 p-2 text-[#1152d4]">
                        <SectionIcon className="h-5 w-5" />
                      </div>
                      <h2
                        className="text-2xl font-bold text-slate-900"
                        style={{ fontFamily: 'Lexend, system-ui, sans-serif' }}
                      >
                        {section.title}
                      </h2>
                    </div>

                    <div className="mt-6 space-y-4 leading-relaxed text-slate-600">
                      {section.paragraphs?.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}

                      {section.bullets?.length ? (
                        <ul className="list-outside list-disc space-y-3 pl-5 marker:text-[#1152d4]">
                          {section.bullets.map((bullet) => (
                            <li key={`${bullet.title || 'item'}-${bullet.text}`}>
                              {bullet.title ? (
                                <>
                                  <strong className="text-slate-800">{bullet.title}</strong>{' '}
                                  <span>{bullet.text}</span>
                                </>
                              ) : (
                                <span>{bullet.text}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : null}

                      {section.callout ? (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                          <div className="flex items-start gap-4">
                            <BookOpen className="mt-0.5 h-5 w-5 text-[#1152d4]" />
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{section.callout.title}</p>
                              <p className="mt-1 text-sm text-slate-500">{section.callout.body}</p>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {section.checklist?.length ? (
                        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          {section.checklist.map((item) => (
                            <li
                              key={item}
                              className="flex items-center gap-3 rounded-xl border border-slate-100 p-4"
                            >
                              <CheckCircle2 className="h-5 w-5 text-[#1152d4]/70" />
                              <span className="text-sm font-medium text-slate-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}

                      {section.addressLines?.length ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm italic text-slate-600">
                          {section.addressLines.map((line) => (
                            <div key={line}>{line}</div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </main>

        <footer className="mt-auto border-t border-slate-200 bg-white px-6 py-12 lg:px-20">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
              <button
                type="button"
                onClick={() => onNavigate('/')}
                className="flex items-center gap-3"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1152d4] text-white">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <span
                  className="font-bold text-slate-900"
                  style={{ fontFamily: 'Lexend, system-ui, sans-serif' }}
                >
                  EduElevate
                </span>
              </button>

              <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-slate-500">
                <button
                  type="button"
                  onClick={() => onNavigate('/terms')}
                  className={activeFooterLink === 'terms' ? 'text-[#1152d4]' : 'transition-colors hover:text-[#1152d4]'}
                >
                  Terms of Service
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/privacy')}
                  className={activeFooterLink === 'privacy' ? 'text-[#1152d4]' : 'transition-colors hover:text-[#1152d4]'}
                >
                  Privacy Policy
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/accessibility')}
                  className="transition-colors hover:text-[#1152d4]"
                >
                  Accessibility
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/help')}
                  className="transition-colors hover:text-[#1152d4]"
                >
                  Help Center
                </button>
              </div>

              <p className="text-sm text-slate-400">© 2026 EduElevate Inc. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
