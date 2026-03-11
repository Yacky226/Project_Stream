import { GraduationCap } from 'lucide-react';
import { CategoryCoursesView } from './CategoryCoursesView';

interface BeginnerCoursesPageProps {
  onNavigate: (path: string) => void;
}

export function BeginnerCoursesPage({ onNavigate }: BeginnerCoursesPageProps) {
  return (
    <CategoryCoursesView
      title="Commencez votre apprentissage"
      subtitle="Selection de cours accessibles pour debuter sereinement."
      badgeLabel="Debutant"
      badgeClassName="from-orange-50 to-yellow-100 dark:from-orange-950/20 dark:to-yellow-950/20"
      icon={<GraduationCap className="h-8 w-8 text-orange-600" />}
      matchesCategory={(course) =>
        course.level === 'beginner' ||
        ['debut', 'initiation', 'basics', 'fundamentals'].some((word) =>
          course.category.toLowerCase().includes(word),
        )
      }
      onNavigate={onNavigate}
    />
  );
}
