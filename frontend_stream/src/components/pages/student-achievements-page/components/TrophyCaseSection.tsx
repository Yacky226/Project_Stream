import { ImageWithFallback } from '../../../figma/ImageWithFallback';
import type { TrophyCard } from '../studentAchievements.types';

interface TrophyCaseSectionProps {
  cards: TrophyCard[];
  onNavigate: (path: string | number) => void;
}

export function TrophyCaseSection({ cards, onNavigate }: TrophyCaseSectionProps) {
  return (
    <section className="student-achievements-section">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Trophy Case</h2>
        <button
          type="button"
          onClick={() => onNavigate('/profile/public')}
          className="text-sm font-semibold text-[#1152d4] hover:underline"
        >
          View All
        </button>
      </div>

      {cards.length ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {cards.map((card) => (
            <div
              key={card.id}
              className="student-achievements-trophy-card group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-800">
                <div className="absolute inset-0 bg-gradient-to-br from-[#1152d4]/5 to-transparent" />
                <ImageWithFallback
                  src={card.image}
                  alt={card.title}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="px-5 pb-5">
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${card.tagClassName}`}
                  >
                    {card.tag}
                  </span>
                  <span className="text-xs italic text-slate-400">{card.dateLabel}</span>
                </div>
                <h4 className="mb-1 text-lg font-bold">{card.title}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">{card.issuer}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
          No trophy matches your current search.
        </div>
      )}
    </section>
  );
}
