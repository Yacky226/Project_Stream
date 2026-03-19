import { useMemo, useState, type FormEvent } from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  CreditCard,
  LifeBuoy,
  Mail,
  MessageCircle,
  Rocket,
  Search,
  Settings,
  Smartphone,
  User,
} from 'lucide-react';
import {
  useGetHelpCenterContentQuery,
  useSubscribeToNewsletterMutation,
  type HelpCenterCategory,
} from '../../store/api/publicSupportApi';
import { PublicFooterBar } from '../layout/PublicFooterBar';
import { PublicHeaderBar } from '../layout/PublicHeaderBar';
import './HelpPage.css';

interface HelpPageProps {
  onNavigate: (path: string) => void;
}

const categoryIconMap = {
  account: User,
  certifications: Award,
  course: BookOpen,
  payments: CreditCard,
  rocket_launch: Rocket,
  school: BookOpen,
  settings: Settings,
  smartphone: Smartphone,
  support: LifeBuoy,
  technical: Settings,
} as const;

function resolveCategoryIcon(rawIcon: string) {
  const key = rawIcon.trim().toLowerCase().replace(/\s+/g, '_');
  const mapped = categoryIconMap[key as keyof typeof categoryIconMap];
  return mapped || BookOpen;
}

function matchesSearch(value: string, search: string): boolean {
  return value.toLowerCase().includes(search.toLowerCase());
}

export function HelpPage({ onNavigate }: HelpPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterFeedback, setNewsletterFeedback] = useState<string | null>(null);
  const [newsletterError, setNewsletterError] = useState<string | null>(null);

  const { data, isError, isLoading } = useGetHelpCenterContentQuery();
  const [subscribeToNewsletter, { isLoading: isSubscribing }] =
    useSubscribeToNewsletterMutation();

  const categories = data?.categories ?? [];
  const faqs = data?.faqs ?? [];
  const supportEmail = data?.supportEmail || 'support@edupremium.com';
  const responseWindow = data?.responseWindow || 'within 24 hours';
  const resolutionRate = data?.resolutionRate ?? 98;
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) {
      return categories;
    }

    return categories.filter(
      (category) =>
        matchesSearch(category.title, searchTerm) ||
        matchesSearch(category.description, searchTerm),
    );
  }, [categories, searchTerm]);

  const filteredFaqs = useMemo(() => {
    if (!searchTerm.trim()) {
      return faqs;
    }

    return faqs.filter(
      (faq) =>
        matchesSearch(faq.question, searchTerm) ||
        matchesSearch(faq.answer, searchTerm),
    );
  }, [faqs, searchTerm]);

  const handleCategoryAction = (category: HelpCenterCategory) => {
    if (category.actionType === 'navigate' && category.actionValue) {
      onNavigate(category.actionValue);
      return;
    }

    const targetId = category.actionValue.replace('#', '');
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleNewsletterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const email = newsletterEmail.trim();
    if (!email || !email.includes('@')) {
      setNewsletterFeedback(null);
      setNewsletterError('Please enter a valid email.');
      return;
    }

    try {
      const result = await subscribeToNewsletter({
        email,
        sourcePage: 'HELP_PAGE',
      }).unwrap();

      setNewsletterError(null);
      setNewsletterFeedback(result.message || 'Subscription successful.');
      setNewsletterEmail('');
    } catch {
      setNewsletterFeedback(null);
      setNewsletterError('Unable to subscribe right now.');
    }
  };

  return (
    <div className="hcp-page">
      <PublicHeaderBar currentPath="/help" onNavigate={onNavigate} />

      <main className="hcp-main">
        <section className="hcp-hero">
          <div className="hcp-container">
            <div className="hcp-hero-content">
              <span>Knowledge Base</span>
              <h1>How can we help you today?</h1>
              <p>
                Search our library of articles and guides to solve issues faster and get
                the most out of your learning journey.
              </p>

              <div className="hcp-search-wrap">
                <Search size={18} />
                <input
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Describe your issue or ask a question..."
                  type="text"
                  value={searchTerm}
                />
                <button type="button">Search</button>
              </div>
            </div>
          </div>
        </section>

        <section className="hcp-section hcp-container">
          <div className="hcp-section-head">
            <h2>Browse by Category</h2>
            <button onClick={() => onNavigate('/help')} type="button">View all topics</button>
          </div>

          {isLoading && <p className="hcp-state">Loading help content...</p>}
          {isError && <p className="hcp-state">Unable to load help categories.</p>}
          {!isLoading && !isError && filteredCategories.length === 0 && (
            <p className="hcp-state">No category matches your search.</p>
          )}

          {!isLoading && filteredCategories.length > 0 && (
            <div className="hcp-category-grid">
              {filteredCategories.map((category) => {
                const Icon = resolveCategoryIcon(category.icon);

                return (
                  <button
                    className="hcp-category-card"
                    key={category.id}
                    onClick={() => handleCategoryAction(category)}
                    type="button"
                  >
                    <span className="hcp-category-icon">
                      <Icon size={18} />
                    </span>
                    <h3>{category.title}</h3>
                    <p>{category.description}</p>
                    <span className="hcp-category-link">
                      Explore
                      <ArrowRight size={14} />
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="hcp-faq hcp-container" id="faqs">
          <div className="hcp-faq-head">
            <h2>Frequently Asked Questions</h2>
            <p>Quick answers to common questions from our community.</p>
          </div>

          {filteredFaqs.length === 0 && <p className="hcp-state">No FAQ found for your query.</p>}

          {filteredFaqs.length > 0 && (
            <div className="hcp-faq-list">
              {filteredFaqs.map((faq, index) => (
                <details className="hcp-faq-item" key={faq.id} open={index === 0}>
                  <summary>
                    <h4>{faq.question}</h4>
                    <ArrowRight size={16} />
                  </summary>
                  <div>
                    <p>{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          )}
        </section>

        <section className="hcp-contact hcp-container" id="contact-support">
          <div className="hcp-contact-card">
            <div className="hcp-contact-copy">
              <h2>Still need help? Our team is here for you.</h2>
              <p>
                If you could not find the answer, contact our support team and we will
                assist you quickly.
              </p>
              <div className="hcp-contact-actions">
                <button onClick={() => onNavigate('/contact')} type="button">
                  <Mail size={16} /> Contact Support
                </button>
                <button onClick={() => onNavigate('/contact')} type="button">
                  <MessageCircle size={16} /> Live Chat
                </button>
              </div>
            </div>

            <div className="hcp-contact-metric">
              <strong>{resolutionRate}%</strong>
              <span>Resolution Rate</span>
              <p>Support email: {supportEmail}</p>
              <p>Average response: {responseWindow}</p>
            </div>
          </div>
        </section>
      </main>

      <section className="hcp-footer">
        <div className="hcp-container">
          <div className="hcp-newsletter">
            <div>
              <h3>Stay Updated</h3>
              <p>
                Join our newsletter for product updates, learning tips, and platform news.
              </p>
            </div>

            <form onSubmit={handleNewsletterSubmit}>
              <input
                onChange={(event) => setNewsletterEmail(event.target.value)}
                placeholder="Enter your email address"
                type="email"
                value={newsletterEmail}
              />
              <button disabled={isSubscribing} type="submit">
                {isSubscribing ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>

            {newsletterFeedback && <p className="hcp-feedback">{newsletterFeedback}</p>}
            {newsletterError && <p className="hcp-feedback is-error">{newsletterError}</p>}
          </div>
        </div>
      </section>

      <PublicFooterBar onNavigate={onNavigate} />
    </div>
  );
}
