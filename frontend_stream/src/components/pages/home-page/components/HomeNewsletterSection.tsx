import type { HomePageDataModel } from '../useHomePageData';

interface HomeNewsletterSectionProps {
  model: HomePageDataModel;
}

export function HomeNewsletterSection({ model }: HomeNewsletterSectionProps) {
  return (
    <section className="el-newsletter-section">
      <div className="el-container">
        <div className="el-newsletter-card">
          <div className="el-newsletter-content">
            <h2 className="el-newsletter-title">Ready to take the next step?</h2>
            <p className="el-newsletter-subtitle">
              Join our weekly newsletter for exclusive early access to new courses and free learning
              resources.
            </p>

            <form className="el-newsletter-form" onSubmit={(event) => void model.handleNewsletterSubmit(event)}>
              <input
                className="el-newsletter-input"
                onChange={(event) => model.setNewsletterEmail(event.target.value)}
                placeholder="Enter your email"
                type="email"
                value={model.newsletterEmail}
              />
              <button className="el-newsletter-btn" disabled={model.isNewsletterSubmitting} type="submit">
                {model.isNewsletterSubmitting ? 'Submitting...' : 'Subscribe'}
              </button>
            </form>

            {model.newsletterFeedback && (
              <p className="el-newsletter-feedback">{model.newsletterFeedback}</p>
            )}
            {model.newsletterError && (
              <p className="el-newsletter-feedback is-error">{model.newsletterError}</p>
            )}
          </div>

          <div className="el-newsletter-glow el-newsletter-glow-right"></div>
          <div className="el-newsletter-glow el-newsletter-glow-left"></div>
        </div>
      </div>
    </section>
  );
}
