import {
  AdminSpaceShell,
  AdminSpaceStatus,
} from '../admin/AdminSpaceShared';
import {
  StudentSpaceShell,
  StudentSpaceStatus,
} from '../student/StudentSpaceShared';
import {
  TeacherSpaceShell,
  TeacherSpaceStatus,
} from '../teacher/TeacherSpaceShared';
import { SettingsPageContent } from './settings-page/components/SettingsPageContent';
import { useSettingsPageData } from './settings-page/useSettingsPageData';

interface SettingsPageProps {
  onNavigate: (path: string | number) => void;
  currentPath?: string;
}

export function SettingsPage({ onNavigate, currentPath }: SettingsPageProps) {
  const model = useSettingsPageData({ onNavigate });
  const pageContent = <SettingsPageContent model={model} />;

  if (model.isStudentAccountPage && model.studentShared.status !== 'ready') {
    return <StudentSpaceStatus shared={model.studentShared} />;
  }

  if (model.isTeacherAccountPage && model.teacherShared.status !== 'ready') {
    return <TeacherSpaceStatus shared={model.teacherShared} />;
  }

  if (model.isAdminAccountPage && model.adminShared.status !== 'ready') {
    return <AdminSpaceStatus shared={model.adminShared} />;
  }

  if (model.isStudentAccountPage && model.studentShared.status === 'ready') {
    return (
      <StudentSpaceShell
        currentPath={currentPath}
        onNavigate={onNavigate}
        showSearch={false}
        showHeader={false}
        headerTitle="Settings"
        headerDescription="Ajustez vos preferences de lecture, notifications et confidentialite depuis un espace coherent avec votre parcours etudiant."
        displayName={model.studentShared.displayName}
        displayLevel={model.studentShared.displayLevel}
        initials={model.studentShared.initials}
        avatarUrl={model.studentShared.avatarUrl}
        goalProgress={model.studentShared.goalProgress}
        unreadCount={model.studentShared.unreadCount}
      >
        {pageContent}
      </StudentSpaceShell>
    );
  }

  if (model.isTeacherAccountPage && model.teacherShared.status === 'ready') {
    return (
      <TeacherSpaceShell
        currentPath={currentPath}
        onNavigate={onNavigate}
        showSearch={false}
        showHeader={false}
        headerTitle="Settings"
        headerDescription="Ajustez vos preferences de lecture, notifications et confidentialite depuis un espace enseignant coherent avec le reste de votre studio."
        displayName={model.teacherShared.displayName}
        displayRole={model.teacherShared.displayRole}
        initials={model.teacherShared.initials}
        avatarUrl={model.teacherShared.avatarUrl}
        activeCourseCount={model.teacherShared.activeCourseCount}
        liveSessions={model.teacherShared.liveSessions}
        unreadCount={model.teacherShared.unreadCount}
      >
        {pageContent}
      </TeacherSpaceShell>
    );
  }

  if (model.isAdminAccountPage && model.adminShared.status === 'ready') {
    return (
      <AdminSpaceShell
        currentPath={currentPath}
        onNavigate={onNavigate}
        showSearch={false}
        showHeader={false}
        headerTitle="Settings"
        headerDescription="Gardez vos preferences, notifications et options de confidentialite dans le meme cadre que le reste de l espace administrateur."
        displayName={model.adminShared.displayName}
        displayRole={model.adminShared.displayRole}
        initials={model.adminShared.initials}
        avatarUrl={model.adminShared.avatarUrl}
        unreadCount={model.adminShared.unreadCount}
      >
        {pageContent}
      </AdminSpaceShell>
    );
  }

  return <div className="container mx-auto max-w-4xl px-4 py-8">{pageContent}</div>;
}
