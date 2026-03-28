import { formatStudentDateShort } from '../../student/StudentSpaceShared';
import type { DashboardCourse, LeaderboardEntry, TrophyCard } from './studentAchievements.types';

const ACHIEVEMENT_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCy5hsbVz8Uq11EyQqfirOw0tQUZGeIsryYdgnj67JFmWCcLDi5L2-iaiBDxoAmE4J8KDW4PqfSSQf-PyFnuIfuz1sAdw88jR4bXN1SiCg9ctOAogz9dmCXUulrK_4N--gvxn3rJXKfFJkOSVSfgrkUZtEGKTMAKEfRo2oTyykFewghqiO5tv5Ws3TCJzZa3huMADrtaOKGpXn__GYBtwCQsPpT5Gy38IxMb5rpcCnsGfqNlhqZDAsSxcS0uTbCqZz4aSyYv5XJc0I',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCCWP1QyAzG0uCqaKSmw0SCl_6SjPAj065ME7j7Iqd_VLjA0QvM3kveavoPHHbRdOjaKsU-foXp-5rItWU_OjDNPe1SYwDXIR5IDpuzGURSUJf5_02Huh6kDR-iuseLeU4lt1FhGqY1b3hdDmxSsLvMjcbM_wVg8bmoyAS_gBHudnc5x9Qw_F_BmPyWxG0jMUF4kGT7N7gFw0qHklgUGVlZvlQJo1FdIw3l-m8Kw-B0-l8WhFmFLynl31EHLMFjG5yw-y6Uc3GBxPA',
];

export const LEADERBOARD_SEED: LeaderboardEntry[] = [
  {
    rank: 1,
    name: 'Sarah Jenkins',
    xp: 18200,
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA4KOJhGTZWeRP00NtQGFcGUY1NHCOaDlJ0mi5sYwYuu080n8b9V5f50VIDgzIt7bXEyiM71BYFfI4hH9L3EkQtvbF7FoEcygQ-8e9EgJDqRXuiNNb_Ni8wLhd3ZTt4gjUEHFqSz7VbZtZ7JeT-q0irD6rPFwBKy3q1C-DTWCAizc4TMuAICMPME29HPXfbXkSDlTtwoBHusvLv4uu2W2-3BwifIJn57OZiCrHm73k7Lreo0YJp5w7jyUzSAGAqgd57kUIjDDWoHiY',
  },
  {
    rank: 2,
    name: 'David Chen',
    xp: 17450,
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBNKHkgE3h0K-oZMcNxZ4CkSkhDZPwT-5HES4PZel3UAd_0mB3H2B2A0t5AOWPC_ODFbg8LNIc2Mto-kw4-4urdbIEGnqbob6EvlUKGEiff1cYv4WkRLTwg6tPFIHXdfhTbcw9s2D_HTX-fsjCa7UKtAn2yGrMuT-9ITFurAjmEtfhbINMf7IjbRLU5DAejlPWJSUP9oczkZMjSjp-e-tx2omHY1JgQ1fs7Z9lzw3T4iI3HqHMUmcPV9HPgvJle_nMFmytjsXP-30g',
  },
  {
    rank: 3,
    name: 'Elena Rodriguez',
    xp: 16900,
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCkwczjmOCdKLeWWykPTFf4us3HPZlK29j-EEjv6p5sy4WeFgfVSbn_M1ofzIxNzhHzAM8dTd1SkasND1xnIH7UI2si3fxYmuWDkJWeItVJQX-wRCkDpXW9nskg2Y-VlkpU0vYgddx84-VJhIb3whENotn8gdvmiODbrLWFWoo-x68BaSy5wAv0Lu-dM0MsUtMWSUWzSlI6bwe5q2iN2m0w89BYi2ZREmJ3OcQf2HHCXan_-R9y_y_q9YcGbmX_IKIXxvVXqtGDfJQ',
  },
];

export function formatXp(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

export function getAchievementImage(index: number) {
  return ACHIEVEMENT_IMAGES[index % ACHIEVEMENT_IMAGES.length];
}

export function buildTrophyCards(courses: DashboardCourse[]): TrophyCard[] {
  const completedCourses = courses.filter((course) => course.status === 'TERMINE');
  const source = completedCourses.length >= 2 ? completedCourses.slice(0, 2) : courses.slice(0, 2);

  return source.map((course, index) => ({
    id: course.id,
    tag: course.status === 'TERMINE' ? 'Course Complete' : 'Expert Status',
    tagClassName:
      index % 2 === 0
        ? 'bg-[#1152d4]/10 text-[#1152d4]'
        : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300',
    dateLabel: formatStudentDateShort(course.enrolledAt || course.scheduledAt),
    title: course.title,
    issuer:
      course.status === 'TERMINE' ? 'Issued by Academic Board' : 'Academic Excellence Award',
    image: getAchievementImage(index),
  }));
}

export function matchesQuery(query: string, ...values: Array<string | number>) {
  if (!query) return true;
  return values.join(' ').toLowerCase().includes(query);
}
