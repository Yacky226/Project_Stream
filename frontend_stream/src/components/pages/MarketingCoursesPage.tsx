import { Megaphone } from 'lucide-react';
import { CategoryCoursesView } from './CategoryCoursesView';

interface MarketingCoursesPageProps {
  onNavigate: (path: string) => void;
}

export function MarketingCoursesPage({ onNavigate }: MarketingCoursesPageProps) {
  return (
    <CategoryCoursesView
      title="Boostez vos competences marketing"
      subtitle="Parcourez les cours marketing reels disponibles sur la plateforme."
      badgeLabel="Marketing"
      badgeClassName="from-emerald-50 to-teal-100 dark:from-emerald-950/20 dark:to-teal-950/20"
      icon={<Megaphone className="h-8 w-8 text-emerald-600" />}
      matchesCategory={(course) =>
        ['marketing', 'growth', 'communication', 'seo', 'business'].some((word) =>
          course.category.toLowerCase().includes(word),
        )
      }
      onNavigate={onNavigate}
    />
  );
}
