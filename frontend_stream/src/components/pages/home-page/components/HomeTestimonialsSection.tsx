import { Star } from 'lucide-react';
import type { HomePageDataModel } from '../useHomePageData';

interface HomeTestimonialsSectionProps {
  model: HomePageDataModel;
}

export function HomeTestimonialsSection({ model }: HomeTestimonialsSectionProps) {
  return (
    <section className="el-testimonials-section">
      <div className="el-container">
        <div className="el-testimonial-header">
          <h2 className="el-section-title">What learners are saying</h2>
          <p className="el-section-subtitle">Latest reviews loaded from the backend.</p>
        </div>

        {model.reviewsLoading && <p className="el-data-state">Loading reviews...</p>}
        {!model.reviewsLoading && model.testimonials.length === 0 && (
          <p className="el-data-state">No learner review available yet.</p>
        )}

        {!model.reviewsLoading && model.testimonials.length > 0 && (
          <div className="el-testimonial-grid">
            {model.testimonials.map((testimonial) => (
              <article
                className={`el-testimonial-card${testimonial.highlight ? ' is-highlighted' : ''}`}
                key={`${testimonial.author}-${testimonial.role}`}
              >
                <div className="el-testimonial-stars">
                  {Array.from({ length: testimonial.stars }).map((_, index) => (
                    <Star
                      className="el-rating-star"
                      key={`${testimonial.author}-star-${index + 1}`}
                      size={16}
                    />
                  ))}
                </div>

                <blockquote className="el-testimonial-quote">&quot;{testimonial.quote}&quot;</blockquote>

                <div className="el-testimonial-author">
                  {testimonial.avatar ? (
                    <img
                      alt={testimonial.author}
                      className="el-testimonial-avatar"
                      src={testimonial.avatar}
                    />
                  ) : (
                    <div className="el-testimonial-avatar-fallback">
                      {testimonial.author.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="el-testimonial-name">{testimonial.author}</p>
                    <p className="el-testimonial-role">{testimonial.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
