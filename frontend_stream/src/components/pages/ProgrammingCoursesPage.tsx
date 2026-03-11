import { Code2 } from 'lucide-react';
import { CategoryCoursesView } from './CategoryCoursesView';

interface ProgrammingCoursesPageProps {
  onNavigate: (path: string) => void;
}

export function ProgrammingCoursesPage({ onNavigate }: ProgrammingCoursesPageProps) {
  return (
    <CategoryCoursesView
      title="Maitrisez la programmation"
      subtitle="Cours reels de la plateforme, du niveau debutant a avance."
      badgeLabel="Programmation"
      badgeClassName="from-blue-50 to-indigo-100 dark:from-blue-950/20 dark:to-indigo-950/20"
      icon={<Code2 className="h-8 w-8 text-blue-600" />}
      matchesCategory={(course) =>
        ['programming', 'developpement', 'development', 'code', 'informatique'].some((word) =>
          course.category.toLowerCase().includes(word),
        )
      }
      onNavigate={onNavigate}
    />
  );
}
