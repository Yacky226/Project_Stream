import type { CareersDepartment, CareersLocation, JobRole } from './careers.types';

export function filterJobRoles(
  roles: JobRole[],
  selectedDepartment: 'All' | CareersDepartment,
  selectedLocation: 'All' | CareersLocation,
): JobRole[] {
  return roles.filter((role) => {
    const departmentMatch = selectedDepartment === 'All' || role.department === selectedDepartment;
    const locationMatch = selectedLocation === 'All' || role.location.includes(selectedLocation);
    return departmentMatch && locationMatch;
  });
}
