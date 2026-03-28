import { HeaderRedux } from '../layout/HeaderRedux';
import { TeacherProfileCourses } from './teacher-profile/components/TeacherProfileCourses';
import { TeacherProfileFooter } from './teacher-profile/components/TeacherProfileFooter';
import { TeacherProfileHeader } from './teacher-profile/components/TeacherProfileHeader';
import { TeacherProfileReviews } from './teacher-profile/components/TeacherProfileReviews';
import { TeacherProfileSidebar } from './teacher-profile/components/TeacherProfileSidebar';
import { TeacherProfileStats } from './teacher-profile/components/TeacherProfileStats';
import type { TeacherProfileProps } from './teacher-profile/teacherProfile.types';
import { useTeacherProfileData } from './teacher-profile/useTeacherProfileData';
import './TeacherProfile.css';

export function TeacherProfile({
  teacherId,
  onNavigate,
  currentPath = `/profile/teacher/${teacherId}`,
}: TeacherProfileProps) {
  const model = useTeacherProfileData({ teacherId });

  if (!model.teacherIdValid) {
    return (
      <div className="teacher-profile-page mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="text-slate-600">Invalid instructor identifier.</p>
      </div>
    );
  }

  return (
    <div className="teacher-profile-page min-h-screen bg-[#f6f6f8] text-slate-900">
      <HeaderRedux onNavigate={onNavigate} currentPath={currentPath} />

      <main className="mx-auto w-full max-w-[1300px] px-4 py-8 lg:px-8">
        <TeacherProfileHeader model={model} />
        <TeacherProfileStats model={model} />

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <TeacherProfileSidebar model={model} />
          <div className="space-y-8 lg:col-span-8">
            <TeacherProfileCourses model={model} onNavigate={onNavigate} />
            <TeacherProfileReviews model={model} onNavigate={onNavigate} />
          </div>
        </div>
      </main>

      <TeacherProfileFooter onNavigate={onNavigate} />
    </div>
  );
}
