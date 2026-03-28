import {
  AdminSpaceShell,
  AdminSpaceStatus,
} from '../admin/AdminSpaceShared';
import {
  StudentSpaceShell,
} from '../student/StudentSpaceShared';
import {
  TeacherSpaceShell,
  TeacherSpaceStatus,
} from '../teacher/TeacherSpaceShared';
import { AdminProfileBody } from './profile-page/components/AdminProfileBody';
import { ProfileOverviewBody } from './profile-page/components/ProfileOverviewBody';
import { RoleProfileBody } from './profile-page/components/RoleProfileBody';
import { useProfilePageData } from './profile-page/useProfilePageData';
import './ProfilePage.css';

interface ProfilePageProps {
  onNavigate: (path: string | number) => void;
  currentPath?: string;
}

export function ProfilePage({ onNavigate, currentPath }: ProfilePageProps) {
  const model = useProfilePageData();
  const {
    isAuthenticated,
    teacherShared,
    adminShared,
    profile,
    profileLoading,
    profileError,
    role,
    studentDashboard,
    teacherDashboard,
    studentLoading,
    teacherLoading,
    adminLoading,
    unreadCount,
    fullName,
    avatarUrl,
    initials,
    roleSubtitle,
  } = model;

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="text-slate-600">Please sign in to view your profile.</p>
        <button
          className="mt-4 rounded-lg bg-[#1152d4] px-5 py-2 text-sm font-semibold text-white"
          onClick={() => onNavigate('/auth/signin')}
          type="button"
        >
          Go to sign in
        </button>
      </div>
    );
  }

  if (profileLoading || studentLoading || teacherLoading || adminLoading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="text-slate-600">Loading profile...</p>
      </div>
    );
  }

  if (!profile || profileError) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="text-slate-600">Unable to load profile data.</p>
      </div>
    );
  }

  const surfaceClass =
    'profile-surface rounded-[28px] border border-slate-200/90 bg-white/95 shadow-sm dark:border-slate-800 dark:bg-slate-900/95';

  const profileBody = (
    <ProfileOverviewBody model={model} onNavigate={onNavigate} surfaceClass={surfaceClass} />
  );


  const roleProfileBody = (
    <RoleProfileBody model={model} onNavigate={onNavigate} surfaceClass={surfaceClass} />
  );

  const adminProfileBody = (
    <AdminProfileBody model={model} onNavigate={onNavigate} surfaceClass={surfaceClass} />
  );

  if (role === 'student') {
    return (
      <StudentSpaceShell
        currentPath={currentPath}
        onNavigate={onNavigate}
        showSearch={false}
        showHeader={false}
        headerTitle="My Profile"
        headerDescription="Retrouvez vos indicateurs, certificats et votre progression dans un profil etudiant aligne avec le reste de votre espace."
        displayName={fullName}
        displayLevel={roleSubtitle}
        initials={initials}
        avatarUrl={avatarUrl || null}
        goalProgress={studentDashboard?.stats.averageProgress || 0}
        unreadCount={unreadCount}
      >
        {roleProfileBody || profileBody}
      </StudentSpaceShell>
    );
  }

  if (role === 'teacher') {
    if (teacherShared.status !== 'ready') {
      return <TeacherSpaceStatus shared={teacherShared} />;
    }

    return (
      <TeacherSpaceShell
        currentPath={currentPath}
        onNavigate={onNavigate}
        showSearch={false}
        showHeader={false}
        headerTitle="Teacher Profile"
        headerDescription="Retrouvez vos indicateurs de cours, vos sessions a venir et votre identite publique dans un profil aligne avec le reste de votre espace enseignant."
        displayName={teacherShared.displayName}
        displayRole={teacherShared.displayRole}
        initials={teacherShared.initials}
        avatarUrl={teacherShared.avatarUrl}
        activeCourseCount={teacherDashboard?.stats.totalCourses ?? teacherShared.activeCourseCount}
        liveSessions={teacherDashboard?.stats.liveSessions ?? teacherShared.liveSessions}
        unreadCount={teacherShared.unreadCount}
      >
        {roleProfileBody || profileBody}
      </TeacherSpaceShell>
    );
  }

  if (role === 'admin') {
    if (adminShared.status !== 'ready') {
      return <AdminSpaceStatus shared={adminShared} />;
    }

    return (
      <AdminSpaceShell
        currentPath={currentPath}
        onNavigate={onNavigate}
        showSearch={false}
        showHeader={false}
        headerTitle="Admin Profile"
        headerDescription="Conservez votre identite d administration et vos indicateurs de plateforme dans le meme cadre que le reste de votre espace admin."
        displayName={adminShared.displayName}
        displayRole={adminShared.displayRole}
        initials={adminShared.initials}
        avatarUrl={adminShared.avatarUrl}
        unreadCount={adminShared.unreadCount}
      >
        {adminProfileBody || profileBody}
      </AdminSpaceShell>
    );
  }

  return <div className="mx-auto max-w-6xl px-4 py-10">{profileBody}</div>;
}

