import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { useGetCourseDetailsQuery } from '../../../store/api/liveApi';
import {
  useStudentSpaceData,
  type StudentSpaceData,
} from '../../student/StudentSpaceShared';
import { buildModules, pickCourse } from './studentLearningPath.utils';
import type { PathModule } from './studentLearningPath.types';

export interface StudentLearningPathDataModel {
  shared: StudentSpaceData;
  ready: boolean;
  dashboard: StudentSpaceData['dashboard'];
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  course: NonNullable<StudentSpaceData['dashboard']>['courses'][number] | null;
  modules: PathModule[];
  currentModule: PathModule | null;
  completedModules: PathModule[];
  progress: number;
  investedHours: number;
  nextSession:
    | NonNullable<StudentSpaceData['dashboard']>['upcomingSessions'][number]
    | null;
  details: ReturnType<typeof useGetCourseDetailsQuery>['data'];
  mentorName: string;
  mentorSpeciality: string;
  teacherPath: string;
}

export function useStudentLearningPathData(): StudentLearningPathDataModel {
  const shared = useStudentSpaceData();
  const [searchQuery, setSearchQuery] = useState('');

  const ready = shared.status === 'ready' && Boolean(shared.dashboard);
  const dashboard = shared.dashboard;
  const dashboardCourses = dashboard?.courses ?? [];
  const dashboardUpcomingSessions = dashboard?.upcomingSessions ?? [];
  const studentId = shared.profile?.id || shared.user?.id || undefined;

  const course = useMemo(
    () => pickCourse(dashboardCourses, searchQuery),
    [dashboardCourses, searchQuery],
  );

  const { data: details } = useGetCourseDetailsQuery(
    {
      courseId: course?.id || '',
      studentId,
    },
    { skip: !ready || !course },
  );

  const modules = useMemo(
    () => (course ? buildModules(course, details) : []),
    [course, details],
  );
  const currentModule = modules.find((module) => module.state === 'current') || modules[0] || null;
  const completedModules = modules.filter((module) => module.state === 'completed');
  const progress = Math.min(
    course?.status === 'TERMINE' ? 100 : course?.progress || shared.goalProgress || 0,
    100,
  );
  const totalMinutes = Math.max(modules.reduce((sum, module) => sum + module.minutes, 0), 120);
  const investedHours = ((totalMinutes * progress) / 100) / 60;

  const nextSession = course
    ? [...dashboardUpcomingSessions]
        .filter((session) => session.courseId === course.id)
        .sort(
          (a, b) =>
            new Date(a.startAt || 0).getTime() - new Date(b.startAt || 0).getTime(),
        )[0]
    : null;

  const mentorName = details?.teacherName || 'Sarah Drasner';
  const mentorSpeciality = details?.teacherSpeciality || `${course?.category || 'Course'} Mentor`;
  const teacherPath = details?.teacherId
    ? `/profile/teacher/${details.teacherId}`
    : '/student/community';

  return {
    shared,
    ready,
    dashboard,
    searchQuery,
    setSearchQuery,
    course,
    details,
    modules,
    currentModule,
    completedModules,
    progress,
    investedHours,
    nextSession,
    mentorName,
    mentorSpeciality,
    teacherPath,
  };
}
