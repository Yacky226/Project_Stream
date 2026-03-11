import type { LiveCourse, LiveSession } from '../types/live';

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

export interface CourseCardModel {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName: string;
  coverImage: string;
  duration: number;
  studentCount: number;
  category: string;
  isLive: boolean;
  nextSession?: {
    id: string;
    startTime: Date;
    endTime: Date;
  };
  price: number;
  level: CourseLevel;
}

function imageByCategory(category: string): string {
  const key = category.toLowerCase();
  if (key.includes('design')) {
    return 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&h=600';
  }
  if (key.includes('marketing')) {
    return 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600';
  }
  if (key.includes('photo')) {
    return 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600';
  }
  if (key.includes('business')) {
    return 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600';
  }
  return 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600';
}

function levelByCategory(category: string): CourseLevel {
  const key = category.toLowerCase();
  if (key.includes('debut') || key.includes('begin')) {
    return 'beginner';
  }
  if (key.includes('advanced') || key.includes('avance')) {
    return 'advanced';
  }
  return 'intermediate';
}

function deterministicPrice(courseId: string): number {
  const parsed = Number(courseId);
  if (!Number.isFinite(parsed)) {
    return 49;
  }
  return 39 + (parsed % 6) * 20;
}

function deterministicStudentCount(courseId: string): number {
  const parsed = Number(courseId);
  if (!Number.isFinite(parsed)) {
    return 120;
  }
  return 100 + (parsed % 20) * 35;
}

function getLiveSessionForCourse(courseId: string, sessions: LiveSession[]): LiveSession | null {
  const live = sessions.find(
    (session) =>
      String(session.courseId) === String(courseId) &&
      (session.isLive || session.status === 'LIVE'),
  );
  if (live) {
    return live;
  }

  return sessions
    .filter((session) => String(session.courseId) === String(courseId))
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0] || null;
}

export function mapCoursesToCardModels(
  courses: LiveCourse[],
  sessions: LiveSession[],
): CourseCardModel[] {
  return courses.map((course) => {
    const linkedSession = getLiveSessionForCourse(course.id, sessions);
    const isLive = Boolean(linkedSession && (linkedSession.isLive || linkedSession.status === 'LIVE'));
    const startTime = linkedSession ? new Date(linkedSession.scheduledAt) : null;

    return {
      id: course.id,
      title: course.title,
      description: course.description || 'Description non disponible.',
      instructorId: course.teacherId,
      instructorName: `Enseignant #${course.teacherId}`,
      coverImage: course.coverImage || imageByCategory(course.category),
      duration: course.durationMinutes || 90,
      studentCount: deterministicStudentCount(course.id),
      category: course.category || 'General',
      isLive,
      nextSession:
        linkedSession && startTime
          ? {
              id: linkedSession.id,
              startTime,
              endTime: new Date(startTime.getTime() + 90 * 60 * 1000),
            }
          : undefined,
      price: deterministicPrice(course.id),
      level: levelByCategory(course.category || ''),
    };
  });
}
