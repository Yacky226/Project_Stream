import { ArrowRight, Mail, MessageCircle, Search } from 'lucide-react';
import { PublicFooterBar } from '../../../layout/PublicFooterBar';
import { PublicHeaderBar } from '../../../layout/PublicHeaderBar';
import type { HelpPageDataModel } from '../help.types';
import { HELP_CATEGORY_ICON_MAP, resolveCategoryIconKey } from '../help.utils';

interface HelpPageContentProps {
  model: HelpPageDataModel;
  onNavigate: (path: string) => void;
}

export function HelpPageContent({ model, onNavigate }: HelpPageContentProps) {
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
                Search our library of articles and guides to solve issues faster and get the most
                out of your learning journey.
              </p>

              <div className="hcp-search-wrap">
                <Search size={18} />
                <input
                  onChange={(event) => model.onSearchChange(event.target.value)}
                  placeholder="Describe your issue or ask a question..."
                  type="text"
                  value={model.searchTerm}
                />
                <button type="button">Search</button>
              </div>
            </div>
          </div>
        </section>

        <section className="hcp-section hcp-container">
          <div className="hcp-section-head">
            <h2>Browse by Category</h2>
            <button onClick={() => onNavigate('/help')} type="button">
              View all topics
            </button>
          </div>

          {model.isLoading ? <p className="hcp-state">Loading help content...</p> : null}
          {model.isError ? <p className="hcp-state">Unable to load help categories.</p> : null}
          {!model.isLoading && !model.isError && model.filteredCategories.length === 0 ? (
            <p className="hcp-state">No category matches your search.</p>
          ) : null}

          {!model.isLoading && model.filteredCategories.length > 0 ? (
            <div className="hcp-category-grid">
              {model.filteredCategories.map((category) => {
                const iconKey = resolveCategoryIconKey(category.icon);
                const Icon = HELP_CATEGORY_ICON_MAP[iconKey] || HELP_CATEGORY_ICON_MAP.course;

                return (
                  <button
                    className="hcp-category-card"
                    key={category.id}
                    onClick={() => model.onCategoryAction(category)}
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
          ) : null}
        </section>

        <section className="hcp-faq hcp-container" id="faqs">
          <div className="hcp-faq-head">
            <h2>Frequently Asked Questions</h2>
            <p>Quick answers to common questions from our community.</p>
          </div>

          {model.filteredFaqs.length === 0 ? (
            <p className="hcp-state">No FAQ found for your query.</p>
          ) : null}

          {model.filteredFaqs.length > 0 ? (
            <div className="hcp-faq-list">
              {model.filteredFaqs.map((faq, index) => (
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
          ) : null}
        </section>

        <section className="hcp-contact hcp-container" id="contact-support">
          <div className="hcp-contact-card">
            <div className="hcp-contact-copy">
              <h2>Still need help? Our team is here for you.</h2>
              <p>
                If you could not find the answer, contact our support team and we will assist you
                quickly.
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
              <strong>{model.resolutionRate}%</strong>
              <span>Resolution Rate</span>
              <p>Support email: {model.supportEmail}</p>
              <p>Average response: {model.responseWindow}</p>
            </div>
          </div>
        </section>
      </main>

      <section className="hcp-footer">
        <div className="hcp-container">
          <div className="hcp-newsletter">
            <div>
              <h3>Stay Updated</h3>
              <p>Join our newsletter for product updates, learning tips, and platform news.</p>
            </div>

            <form onSubmit={model.onNewsletterSubmit}>
              <input
                onChange={(event) => model.onNewsletterEmailChange(event.target.value)}
                placeholder="Enter your email address"
                type="email"
                value={model.newsletterEmail}
              />
              <button disabled={model.isSubscribing} type="submit">
                {model.isSubscribing ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>

            {model.newsletterFeedback ? <p className="hcp-feedback">{model.newsletterFeedback}</p> : null}
            {model.newsletterError ? <p className="hcp-feedback is-error">{model.newsletterError}</p> : null}
          </div>
        </div>
      </section>

      <PublicFooterBar onNavigate={onNavigate} />
    </div>
  );
}
