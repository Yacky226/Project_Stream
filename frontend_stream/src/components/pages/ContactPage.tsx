import { useState, type FormEvent } from 'react';
import {
  Camera,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Send,
  Users,
} from 'lucide-react';
import {
  useGetHelpCenterContentQuery,
  useSubmitContactRequestMutation,
  type ContactSubjectValue,
} from '../../store/api/publicSupportApi';
import { PublicFooterBar } from '../layout/PublicFooterBar';
import { PublicHeaderBar } from '../layout/PublicHeaderBar';
import './ContactPage.css';

interface ContactPageProps {
  onNavigate: (path: string) => void;
}

interface ContactFormState {
  email: string;
  fullName: string;
  message: string;
  subject: ContactSubjectValue;
}

const subjectOptions: Array<{ label: string; value: ContactSubjectValue }> = [
  { label: 'General Inquiry', value: 'GENERAL_INQUIRY' },
  { label: 'Course Admissions', value: 'COURSE_ADMISSIONS' },
  { label: 'Technical Support', value: 'TECHNICAL_SUPPORT' },
  { label: 'Partnership Opportunities', value: 'PARTNERSHIP_OPPORTUNITIES' },
  { label: 'Other', value: 'OTHER' },
];

export function ContactPage({ onNavigate }: ContactPageProps) {
  const [formState, setFormState] = useState<ContactFormState>({
    email: '',
    fullName: '',
    message: '',
    subject: 'GENERAL_INQUIRY',
  });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: helpCenterContent } = useGetHelpCenterContentQuery();
  const [submitContactRequest, { isLoading }] = useSubmitContactRequestMutation();

  const supportEmail = helpCenterContent?.supportEmail || 'hello@edupremium.edu';
  const responseWindow = helpCenterContent?.responseWindow || 'within 24 hours';
  const handleChange = <K extends keyof ContactFormState>(key: K, value: ContactFormState[K]) => {
    setFormState((previous) => ({ ...previous, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const fullName = formState.fullName.trim();
    const email = formState.email.trim();
    const message = formState.message.trim();

    if (!fullName || !email || !message) {
      setFeedback(null);
      setError('Please fill in all required fields.');
      return;
    }

    try {
      const result = await submitContactRequest({
        email,
        fullName,
        message,
        sourcePage: 'CONTACT_PAGE',
        subject: formState.subject,
      }).unwrap();

      setError(null);
      setFeedback(result.message || 'Your message has been sent successfully.');
      setFormState({
        email: '',
        fullName: '',
        message: '',
        subject: 'GENERAL_INQUIRY',
      });
    } catch {
      setFeedback(null);
      setError('Unable to send your message at the moment. Please try again.');
    }
  };

  return (
    <div className="ctp-page">
      <PublicHeaderBar currentPath="/contact" onNavigate={onNavigate} />

      <main className="ctp-main ctp-container">
        <section className="ctp-hero">
          <h1>Get in Touch</h1>
          <p>
            Our advisors and support specialists are ready to guide your learning journey.
            Tell us what you need and we will get back to you quickly.
          </p>
        </section>

        <section className="ctp-layout">
          <article className="ctp-form-card">
            <form className="ctp-form" onSubmit={handleSubmit}>
              <div className="ctp-form-grid">
                <label>
                  <span>Full Name</span>
                  <input
                    onChange={(event) => handleChange('fullName', event.target.value)}
                    placeholder="Jane Doe"
                    required
                    type="text"
                    value={formState.fullName}
                  />
                </label>

                <label>
                  <span>Email Address</span>
                  <input
                    onChange={(event) => handleChange('email', event.target.value)}
                    placeholder="jane@university.edu"
                    required
                    type="email"
                    value={formState.email}
                  />
                </label>
              </div>

              <label>
                <span>Subject</span>
                <select
                  onChange={(event) => handleChange('subject', event.target.value as ContactSubjectValue)}
                  value={formState.subject}
                >
                  {subjectOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Message</span>
                <textarea
                  onChange={(event) => handleChange('message', event.target.value)}
                  placeholder="How can we help you today?"
                  required
                  rows={5}
                  value={formState.message}
                />
              </label>

              <button className="ctp-submit" disabled={isLoading} type="submit">
                <Send size={16} />
                {isLoading ? 'Sending...' : 'Send Message'}
              </button>

              {feedback && <p className="ctp-feedback">{feedback}</p>}
              {error && <p className="ctp-feedback is-error">{error}</p>}
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
                  <p>Response {responseWindow}</p>
                  <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
                </div>
              </div>

              <div className="ctp-info-item">
                <span className="ctp-info-icon">
                  <MapPin size={18} />
                </span>
                <div>
                  <h3>Office Address</h3>
                  <p>
                    University Innovation Hub
                    <br />
                    42 Learning Way, Ste 300
                    <br />
                    Palo Alto, CA 94301
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
                    <a aria-label="Website" href="#">
                      <Globe size={16} />
                    </a>
                    <a aria-label="Community" href="#">
                      <Users size={16} />
                    </a>
                    <a aria-label="Gallery" href="#">
                      <Camera size={16} />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="ctp-map">
              <img
                alt="Modern abstract map illustration showing campus location"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzEPVwO8c3mPoi7ZuTYJff5MSKrS7eTcGkYSbUzSZ4WcwZlet-_b8h6yTYe-BmXHnL0Fz2ghbCWb3hzExSSUNHz8pd0mJLfC2n9mnzobND5aY_0uLHMXFqmjf9FuXGa157TklIJPatDcEMosQOPRwFNmqx11bsI77vS2VVgrILZHonFMY-aZGllv2sBW9ODBqFn5Tvh9DmUgOcP7n4cqjKUE3HePsh6b7ybJs1dqqsoqVpAEeLU3R6M1PQhSMxabgILiWU0RsZJ6s"
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
            <p>
              Our live chat agents are online and ready to help you in real-time.
            </p>
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
