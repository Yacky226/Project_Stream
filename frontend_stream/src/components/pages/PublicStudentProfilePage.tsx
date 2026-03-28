import { PublicStudentProfileContent } from './public-student-profile-page/components/PublicStudentProfileContent';
import { PublicStudentProfileStatus } from './public-student-profile-page/components/PublicStudentProfileStatus';
import type { PublicStudentProfilePageProps } from './public-student-profile-page/publicStudentProfile.types';
import { usePublicStudentProfileData } from './public-student-profile-page/usePublicStudentProfileData';

export function PublicStudentProfilePage({ onNavigate }: PublicStudentProfilePageProps) {
  const model = usePublicStudentProfileData();

  if (model.status !== 'ready') {
    return (
      <PublicStudentProfileStatus
        status={model.status}
        errorMessage={model.errorMessage}
      />
    );
  }

  return <PublicStudentProfileContent model={model} onNavigate={onNavigate} />;
}
