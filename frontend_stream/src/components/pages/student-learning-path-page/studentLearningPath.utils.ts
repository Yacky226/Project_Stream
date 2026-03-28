import type { LiveCourseDetails } from '../../../types/live';
import type { DashboardCourse, PathModule } from './studentLearningPath.types';

export const FALLBACK_COVER =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDbMVny5GyEoropXhjpTCyYnfpNWUMhZb8N-IpGeSxwUs6WDbrXj2Mel6HpZAgwDfAD64BRopuOAQcmmH0KSBnxUcwTZsY_dWtDvAQLrxvi3-0IyWbTbQPWyg-H2NPBEmn8vBXcae9g0HGxjR4MVNVrQheR59VN9_LI0jAJXEI9cBx_2l08Y1zFAsImRxwPgc5AsIgczgUhPZD1j37ervSwW_n7fB87v3Ugg78shjloDW_jFy3ePslfVx8ZSfCnAYfayagpYhfHzUE';

export const MENTOR_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC-Cl1tbQB8uzD0YdLql33JpTXghHD6Df_9uYkh7dRGORLhsMjFp9lpC_iy07AEDEK_9UIkiz4k8xWa26YIWNx6sLMMqLsy_pASb2ahtRZhh5s44VoRpMrdqN6mic66CQ8HLc9ub3opI3xChlJW0W3BIFVc0Y2XwF7CTCDCgUqGlNiOy0W0WG097NEwo7Z-oo_sQJuaH0LpPMtz_8_Uh7gDvvx4dAXB7cME2VpkqKOu1vDEiIrk7xbWqKerb9JcHOpEo0je2aiwNII';

export function formatDate(value?: string | null) {
  if (!value) return 'Flexible schedule';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Flexible schedule';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatMinutes(value: number) {
  if (value < 60) return `${value} mins`;
  const hours = value / 60;
  return `${hours % 1 === 0 ? hours.toFixed(0) : hours.toFixed(1)} hours`;
}

export function pickCourse(courses: DashboardCourse[], search: string) {
  const q = search.trim().toLowerCase();
  return (
    [...courses]
      .filter((course) => course.status !== 'ABANDONNE')
      .filter((course) =>
        q
          ? [course.title, course.description, course.category]
              .join(' ')
              .toLowerCase()
              .includes(q)
          : true,
      )
      .sort((a, b) => {
        const aActive = a.status === 'ACTIF' ? 1 : 0;
        const bActive = b.status === 'ACTIF' ? 1 : 0;
        if (aActive !== bActive) return bActive - aActive;
        if (a.progress !== b.progress) return b.progress - a.progress;
        return (
          new Date(b.enrolledAt || b.scheduledAt || 0).getTime() -
          new Date(a.enrolledAt || a.scheduledAt || 0).getTime()
        );
      })[0] || null
  );
}

export function buildModules(course: DashboardCourse, details?: LiveCourseDetails | null): PathModule[] {
  const sections = [...(details?.sections || [])].sort((a, b) => a.order - b.order);
  if (!sections.length) {
    const currentIndex = course.progress >= 67 ? 2 : course.progress >= 34 ? 1 : 0;
    return [
      {
        id: `${course.id}-1`,
        title: `Foundations of ${course.category}`,
        description: 'Build the principles and shared vocabulary for the path.',
        state: currentIndex > 0 ? 'completed' : 'current',
        order: 1,
        remainingLessons: currentIndex > 0 ? 0 : 4,
        minutes: 95,
      },
      {
        id: `${course.id}-2`,
        title: `${course.category} Research & Synthesis`,
        description: 'Turn analysis into structured decisions and practical outputs.',
        state: currentIndex > 1 ? 'completed' : currentIndex === 1 ? 'current' : 'locked',
        order: 2,
        remainingLessons: currentIndex > 1 ? 0 : 8,
        minutes: 270,
      },
      {
        id: `${course.id}-3`,
        title: `${course.category} Architecture`,
        description: 'Move from isolated lessons to scalable execution and system thinking.',
        state: currentIndex === 2 ? 'current' : 'locked',
        order: 3,
        remainingLessons: 6,
        minutes: 180,
      },
    ];
  }

  const states = sections.map((section) => {
    const lessons = [...section.lessons].sort((a, b) => a.order - b.order);
    const completedLessons = lessons.filter((lesson) => lesson.completed).length;
    return {
      section,
      lessons,
      completedLessons,
      done: lessons.length > 0 && completedLessons === lessons.length,
    };
  });

  const currentIndex = Math.max(states.findIndex((item) => !item.done), 0);

  return states.map((item, index) => {
    const remainingLessons = item.done ? 0 : Math.max(item.lessons.length - item.completedLessons, 1);
    const incompleteMinutes =
      item.lessons
        .filter((lesson) => !lesson.completed)
        .reduce((sum, lesson) => sum + (lesson.durationMinutes || 0), 0) ||
      item.lessons.reduce((sum, lesson) => sum + (lesson.durationMinutes || 0), 0) ||
      Math.max(item.lessons.length, 1) * 20;

    return {
      id: item.section.id,
      title: item.section.title,
      description:
        item.section.description ||
        `Continue through ${item.section.title.toLowerCase()} to unlock the next stage.`,
      state: index < currentIndex ? 'completed' : index === currentIndex ? 'current' : 'locked',
      order: index + 1,
      remainingLessons,
      minutes: incompleteMinutes,
    };
  });
}
