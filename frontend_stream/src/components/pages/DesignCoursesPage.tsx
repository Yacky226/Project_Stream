import { Palette } from 'lucide-react';
import { CategoryCoursesView } from './CategoryCoursesView';

interface DesignCoursesPageProps {
  onNavigate: (path: string) => void;
}

export function DesignCoursesPage({ onNavigate }: DesignCoursesPageProps) {
  return (
    <CategoryCoursesView
      title="Developpez votre creativite"
      subtitle="Cours design connectes aux vraies donnees du backend."
      badgeLabel="Design"
      badgeClassName="from-purple-50 to-pink-100 dark:from-purple-950/20 dark:to-pink-950/20"
      icon={<Palette className="h-8 w-8 text-purple-600" />}
      matchesCategory={(course) =>
        ['design', 'ui', 'ux', 'graphique', 'artistique'].some((word) =>
          course.category.toLowerCase().includes(word),
        )
      }
      onNavigate={onNavigate}
    />
  );
}
