import { ExternalLink, Mail, MapPin, MessageCircle, Send, Users } from 'lucide-react';
import { PublicFooterBar } from '../../../layout/PublicFooterBar';
import { PublicHeaderBar } from '../../../layout/PublicHeaderBar';
import type { ContactPageDataModel } from '../contact.types';

interface ContactPageContentProps {
  model: ContactPageDataModel;
  onNavigate: (path: string) => void;
}

export function ContactPageContent({ model, onNavigate }: ContactPageContentProps) {
  return (
    <div className="ctp-page">
      <PublicHeaderBar currentPath="/contact" onNavigate={onNavigate} />

      <main className="ctp-main ctp-container">
        <section className="ctp-hero">
          <h1>Get in Touch</h1>
          <p>
            Our advisors and support specialists are ready to guide your learning journey. Tell us
            what you need and we will get back to you quickly.
          </p>
        </section>

        <section className="ctp-layout">
          <article className="ctp-form-card">
            <form className="ctp-form" onSubmit={model.onSubmit}>
              <div className="ctp-form-grid">
                <label>
                  <span>Full Name</span>
                  <input
                    onChange={(event) => model.onFieldChange('fullName', event.target.value)}
                    placeholder="Jane Doe"
                    required
                    type="text"
                    value={model.formState.fullName}
                  />
                </label>

                <label>
                  <span>Email Address</span>
                  <input
                    onChange={(event) => model.onFieldChange('email', event.target.value)}
                    placeholder="jane@university.edu"
                    required
                    type="email"
                    value={model.formState.email}
                  />
                </label>
              </div>

              <label>
                <span>Subject</span>
                <select
                  onChange={(event) =>
                    model.onFieldChange(
                      'subject',
                      event.target.value as (typeof model.formState)['subject'],
                    )
                  }
                  value={model.formState.subject}
                >
                  {model.subjectOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Message</span>
                <textarea
                  onChange={(event) => model.onFieldChange('message', event.target.value)}
                  placeholder="How can we help you today?"
                  required
                  rows={5}
                  value={model.formState.message}
                />
              </label>

              <button className="ctp-submit" disabled={model.isSubmitting} type="submit">
                <Send size={16} />
                {model.isSubmitting ? 'Sending...' : 'Send Message'}
              </button>

              {model.feedback ? <p className="ctp-feedback">{model.feedback}</p> : null}
              {model.error ? <p className="ctp-feedback is-error">{model.error}</p> : null}
            </form>
          </article>

          <aside className="ctp-sidebar">
            <div className="ctp-info-list">
              <div className="ctp-info-item">
                <span className="ctp-info-icon">
                  <Mail size={18} />
                </span>
                <div>
                  <h3>Support Email</h3>
                  <p>Response {model.responseWindow}</p>
                  <a href={`mailto:${model.supportEmail}`}>{model.supportEmail}</a>
                </div>
              </div>

              <div className="ctp-info-item">
                <span className="ctp-info-icon">
                  <MapPin size={18} />
                </span>
                <div>
                  <h3>Office Address</h3>
                  <p>
                    {model.officeAddressLines.map((line) => (
                      <span key={line}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </p>
                </div>
              </div>

              <div className="ctp-info-item">
                <span className="ctp-info-icon">
                  <Users size={18} />
                </span>
                <div>
                  <h3>Social Media</h3>
                  <div className="ctp-social-links">
                    {model.socialLinks.map((link) => (
                      <a aria-label={link.label} href={link.href} key={link.label}>
                        <link.icon size={16} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="ctp-map">
              <img
                alt="Modern abstract map illustration showing campus location"
                src={model.mapImageUrl}
              />
              <div className="ctp-map-overlay">
                <span>View on Google Maps</span>
                <ExternalLink size={15} />
              </div>
            </div>
          </aside>
        </section>

        <section className="ctp-support-banner">
          <div className="ctp-support-copy">
            <h2>Need a faster response?</h2>
            <p>Our live chat agents are online and ready to help you in real-time.</p>
          </div>
          <button onClick={() => onNavigate('/help')} type="button">
            <MessageCircle size={18} />
            Start Live Chat
          </button>
        </section>
      </main>

      <button
        aria-label="Open chat"
        className="ctp-floating-chat"
        onClick={() => onNavigate('/help')}
        type="button"
      >
        <MessageCircle size={24} />
      </button>

      <PublicFooterBar onNavigate={onNavigate} />
    </div>
  );
}
