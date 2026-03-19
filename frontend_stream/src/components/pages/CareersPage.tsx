import { FormEvent, useMemo, useState } from 'react';
import { CheckCircle, Clock3, Filter, Heart, Lightbulb, MapPin, Search, Users, Verified } from 'lucide-react';
import { useSubscribeToNewsletterMutation } from '../../store/api/publicSupportApi';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { PublicFooterBar } from '../layout/PublicFooterBar';
import { PublicHeaderBar } from '../layout/PublicHeaderBar';
import './CareersPage.css';

interface CareersPageProps {
  onNavigate: (path: string) => void;
}

interface JobRole {
  id: string;
  department: 'Engineering' | 'Design' | 'Marketing';
  title: string;
  location: string;
  type: 'Full-time';
}

const valueCards = [
  {
    icon: Lightbulb,
    title: 'Innovation',
    description:
      'Pushing what is possible in EdTech through AI and immersive learning experiences.',
  },
  {
    icon: Users,
    title: 'Inclusion',
    description:
      'Building a classroom that welcomes every learner regardless of background or geography.',
  },
  {
    icon: Verified,
    title: 'Excellence',
    description:
      'Setting a high standard for pedagogy quality and platform engineering performance.',
  },
  {
    icon: Heart,
    title: 'Learner-First',
    description:
      'Every feature starts with solving a real learner need through empathy and impact.',
  },
];

const jobRoles: JobRole[] = [
  {
    id: 'eng-senior-fullstack',
    department: 'Engineering',
    title: 'Senior Full Stack Engineer',
    location: 'Remote / London',
    type: 'Full-time',
  },
  {
    id: 'design-lead-product',
    department: 'Design',
    title: 'Lead Product Designer',
    location: 'San Francisco / Hybrid',
    type: 'Full-time',
  },
  {
    id: 'eng-ai-learning-scientist',
    department: 'Engineering',
    title: 'AI Learning Scientist',
    location: 'Remote',
    type: 'Full-time',
  },
  {
    id: 'marketing-growth-manager',
    department: 'Marketing',
    title: 'Growth Marketing Manager',
    location: 'New York / Hybrid',
    type: 'Full-time',
  },
];

export function CareersPage({ onNavigate }: CareersPageProps) {
  const [selectedDepartment, setSelectedDepartment] = useState<'All' | JobRole['department']>('All');
  const [selectedLocation, setSelectedLocation] = useState<
    'All' | 'Remote' | 'London' | 'San Francisco' | 'New York'
  >('All');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterFeedback, setNewsletterFeedback] = useState<string | null>(null);

  const [subscribeToNewsletter, { isLoading: isSubscribing }] = useSubscribeToNewsletterMutation();

  const filteredRoles = useMemo(() => {
    return jobRoles.filter((role) => {
      const departmentMatch = selectedDepartment === 'All' || role.department === selectedDepartment;
      const locationMatch = selectedLocation === 'All' || role.location.includes(selectedLocation);
      return departmentMatch && locationMatch;
    });
  }, [selectedDepartment, selectedLocation]);

  const handleNewsletterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newsletterEmail.trim()) {
      setNewsletterFeedback('Please provide a valid email address.');
      return;
    }

    setNewsletterFeedback(null);

    try {
      const response = await subscribeToNewsletter({
        email: newsletterEmail.trim(),
        sourcePage: 'careers',
      }).unwrap();

      setNewsletterFeedback(response.message || 'Subscription successful.');
      setNewsletterEmail('');
    } catch (error) {
      const payload = error as { data?: { message?: string; error?: string } };
      setNewsletterFeedback(payload?.data?.message || payload?.data?.error || 'Unable to subscribe right now.');
    }
  };

  return (
    <div className="cr-page">
      <PublicHeaderBar currentPath="/careers" onNavigate={onNavigate} />

      <main className="cr-main">
        <section className="cr-hero">
          <div className="cr-shell cr-hero-grid">
            <div className="cr-hero-copy">
              <div className="cr-badge">
                <span className="cr-badge-dot" />
                WE ARE HIRING
              </div>

              <h1 className="cr-hero-title">
                Join the Future of <span>Education</span>
              </h1>

              <p className="cr-hero-subtitle">
                Shape the next generation of learners. We are looking for passionate minds to redefine
                digital academia with technology and empathy.
              </p>

              <div className="cr-hero-actions">
                <button
                  className="cr-btn cr-btn-primary"
                  onClick={() => document.getElementById('jobs')?.scrollIntoView({ behavior: 'smooth' })}
                  type="button"
                >
                  View Openings
                </button>
                <button
                  className="cr-btn cr-btn-secondary"
                  onClick={() => document.getElementById('mission')?.scrollIntoView({ behavior: 'smooth' })}
                  type="button"
                >
                  Our Mission
                </button>
              </div>
            </div>

            <div className="cr-hero-visual">
              <div className="cr-hero-image-wrap">
                <ImageWithFallback
                  alt="Team collaboration"
                  className="cr-hero-image"
                  src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&auto=format&fit=crop"
                />
                <div className="cr-hero-overlay" />
              </div>

              <div className="cr-floating-card">
                <div className="cr-floating-icon">
                  <Verified className="h-5 w-5" />
                </div>
                <div>
                  <p className="cr-floating-label">Remote Friendly</p>
                  <p className="cr-floating-value">100+ Global Team</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="cr-values">
          <div className="cr-shell">
            <div className="cr-section-head">
              <h2>Our Core Values</h2>
              <p>These principles guide every decision we make, from engineering to curriculum design.</p>
            </div>

            <div className="cr-values-grid">
              {valueCards.map((value) => {
                const Icon = value.icon;
                return (
                  <article className="cr-value-card" key={value.title}>
                    <div className="cr-value-icon">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3>{value.title}</h3>
                    <p>{value.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="cr-mission" id="mission">
          <div className="cr-shell cr-mission-grid">
            <div className="cr-gallery-grid">
              <div className="cr-gallery-col">
                <ImageWithFallback
                  alt="Team meeting"
                  className="cr-gallery-image is-lg"
                  src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=900&auto=format&fit=crop"
                />
                <ImageWithFallback
                  alt="Office workspace"
                  className="cr-gallery-image is-md"
                  src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900&auto=format&fit=crop"
                />
              </div>
              <div className="cr-gallery-col is-offset">
                <ImageWithFallback
                  alt="Collaboration"
                  className="cr-gallery-image is-md"
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&auto=format&fit=crop"
                />
                <ImageWithFallback
                  alt="Workshop"
                  className="cr-gallery-image is-lg"
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&auto=format&fit=crop"
                />
              </div>
            </div>

            <div className="cr-mission-copy">
              <h2>Life at EduFuture</h2>
              <p>
                We are a community of educators, builders, and dreamers. Growth happens when people are
                challenged, supported, and trusted to experiment.
              </p>
              <ul className="cr-checklist">
                <li>
                  <CheckCircle className="h-5 w-5" />
                  Flexible remote-first environment
                </li>
                <li>
                  <CheckCircle className="h-5 w-5" />
                  Annual learning stipend (3000+ USD)
                </li>
                <li>
                  <CheckCircle className="h-5 w-5" />
                  Equity options for full-time employees
                </li>
                <li>
                  <CheckCircle className="h-5 w-5" />
                  Weekly innovation sprint for side projects
                </li>
              </ul>

              <blockquote className="cr-quote">
                <p>
                  "The scale of impact here is incredible. You build something today, and tomorrow thousands
                  of students learn better because of it."
                </p>
                <cite>Sarah Chen, Senior Product Designer</cite>
              </blockquote>
            </div>
          </div>
        </section>

        <section className="cr-jobs" id="jobs">
          <div className="cr-shell">
            <div className="cr-jobs-head">
              <div>
                <h2>Open Positions</h2>
                <p>Join our team in London, San Francisco, New York, or Remote.</p>
              </div>

              <div className="cr-filters">
                <div className="cr-select-wrap">
                  <Filter className="cr-select-icon h-4 w-4" />
                  <select
                    className="cr-select"
                    onChange={(event) => setSelectedDepartment(event.target.value as typeof selectedDepartment)}
                    value={selectedDepartment}
                  >
                    <option value="All">All Departments</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>

                <div className="cr-select-wrap">
                  <Search className="cr-select-icon h-4 w-4" />
                  <select
                    className="cr-select"
                    onChange={(event) => setSelectedLocation(event.target.value as typeof selectedLocation)}
                    value={selectedLocation}
                  >
                    <option value="All">All Locations</option>
                    <option value="Remote">Remote</option>
                    <option value="London">London</option>
                    <option value="San Francisco">San Francisco</option>
                    <option value="New York">New York</option>
                  </select>
                </div>
              </div>
            </div>

            {filteredRoles.length > 0 ? (
              <div className="cr-job-list">
                {filteredRoles.map((role) => (
                  <article className="cr-job-card" key={role.id}>
                    <div>
                      <span className="cr-job-department">{role.department}</span>
                      <h3>{role.title}</h3>
                      <div className="cr-job-meta">
                        <span>
                          <MapPin className="h-4 w-4" />
                          {role.location}
                        </span>
                        <span>
                          <Clock3 className="h-4 w-4" />
                          {role.type}
                        </span>
                      </div>
                    </div>

                    <button
                      className="cr-btn cr-btn-ghost"
                      onClick={() => onNavigate('/contact')}
                      type="button"
                    >
                      View Role
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="cr-empty-state">No role matches the selected filters.</div>
            )}

            <div className="cr-open-application">
              <p>Do not see the right role?</p>
              <button onClick={() => onNavigate('/contact')} type="button">
                Send us an open application
              </button>
            </div>
          </div>
        </section>

        <section className="cr-newsletter">
          <div className="cr-shell">
            <div className="cr-newsletter-panel">
              <h2>Stay in the loop</h2>
              <p>
                Subscribe to our talent newsletter to get notified about new openings and life at EduFuture.
              </p>

              <form className="cr-newsletter-form" onSubmit={handleNewsletterSubmit}>
                <input
                  onChange={(event) => setNewsletterEmail(event.target.value)}
                  placeholder="Enter your email"
                  type="email"
                  value={newsletterEmail}
                />
                <button disabled={isSubscribing} type="submit">
                  {isSubscribing ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>

              {newsletterFeedback && <p className="cr-newsletter-feedback">{newsletterFeedback}</p>}
            </div>
          </div>
        </section>
      </main>

      <PublicFooterBar onNavigate={onNavigate} />
    </div>
  );
}
