import { useMemo } from "react";
import { Award, BarChart3, Flame, GraduationCap, Star, User } from "lucide-react";
import { useAppSelector } from "../../../hooks/redux";
import { normalizeUserRole } from "../../../lib/roleUtils";
import {
  useGetProfileQuery,
  useGetStudentLevelQuery,
  useGetTeacherSpecialtyQuery,
  useGetUnreadNotificationCountQuery,
} from "../../../store/api/userApi";
import {
  useGetAdminDashboardQuery,
  useGetStudentDashboardQuery,
  useGetTeacherDashboardQuery,
} from "../../../store/api/dashboardApi";
import { useAdminSpaceData } from "../../admin/AdminSpaceShared";
import { useTeacherSpaceData } from "../../teacher/TeacherSpaceShared";
import { formatDate, getInitials, normalizeStatus, type MetricCard } from "./profilePage.utils";

export function useProfilePageData() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const teacherShared = useTeacherSpaceData({ includeDashboard: false });
  const adminShared = useAdminSpaceData({ includeDashboard: false });

  const { data: profile, isLoading: profileLoading, error: profileError } = useGetProfileQuery(
    undefined,
    {
      skip: !isAuthenticated,
    },
  );

  const role = normalizeUserRole(profile?.role || user?.role);

  const { data: studentLevel } = useGetStudentLevelQuery(undefined, {
    skip: !profile || role !== "student" || Boolean(profile.niveau),
  });

  const { data: teacherSpecialty } = useGetTeacherSpecialtyQuery(undefined, {
    skip: !profile || role !== "teacher" || Boolean(profile.specialite),
  });

  const { data: studentDashboard, isLoading: studentLoading } = useGetStudentDashboardQuery(
    undefined,
    {
      skip: !profile || role !== "student",
    },
  );

  const { data: teacherDashboard, isLoading: teacherLoading } = useGetTeacherDashboardQuery(
    undefined,
    {
      skip: !profile || role !== "teacher",
    },
  );

  const { data: adminDashboard, isLoading: adminLoading } = useGetAdminDashboardQuery(undefined, {
    skip: !profile || role !== "admin",
  });

  const { data: unreadCount = 0 } = useGetUnreadNotificationCountQuery(undefined, {
    skip: !isAuthenticated || role !== "student",
  });

  const fullName =
    `${profile?.firstName || user?.firstName || ""} ${
      profile?.lastName || user?.lastName || ""
    }`.trim() || "Learner";
  const avatarUrl = profile?.avatar || user?.avatar || "";
  const initials = getInitials(profile?.firstName || user?.firstName, profile?.lastName || user?.lastName);

  const roleSubtitle = useMemo(() => {
    if (role === "teacher") {
      return profile?.specialite || teacherSpecialty || "Instructor profile";
    }
    if (role === "admin") {
      return "Platform administration";
    }
    return profile?.niveau || studentLevel || "Student profile";
  }, [profile?.niveau, profile?.specialite, role, studentLevel, teacherSpecialty]);

  const metrics = useMemo<MetricCard[]>(() => {
    if (role === "teacher" && teacherDashboard) {
      return [
        {
          icon: GraduationCap,
          value: String(teacherDashboard.stats.totalCourses),
          label: "Courses Published",
        },
        {
          icon: User,
          value: String(teacherDashboard.stats.totalStudents),
          label: "Students Reached",
        },
        {
          icon: BarChart3,
          value: `${teacherDashboard.stats.averageCompletionRate}%`,
          label: "Completion Rate",
        },
      ];
    }

    if (role === "admin" && adminDashboard) {
      return [
        { icon: User, value: String(adminDashboard.stats.totalUsers), label: "Total Users" },
        { icon: GraduationCap, value: String(adminDashboard.stats.totalCourses), label: "Courses" },
        {
          icon: BarChart3,
          value: `${adminDashboard.stats.averageCompletionRate}%`,
          label: "Completion Rate",
        },
      ];
    }

    if (studentDashboard) {
      const uniqueSkills = new Set(
        studentDashboard.courses.map((course) => course.category).filter(Boolean),
      );
      return [
        {
          icon: Award,
          value: String(studentDashboard.stats.completedCourses),
          label: "Courses Done",
        },
        { icon: Star, value: String(uniqueSkills.size), label: "Skills Earned" },
        {
          icon: Flame,
          value: String(studentDashboard.stats.activeCourses),
          label: "Active Courses",
        },
      ];
    }

    return [
      { icon: GraduationCap, value: "0", label: "Courses Done" },
      { icon: Star, value: "0", label: "Skills Earned" },
      { icon: Flame, value: "0", label: "Active Courses" },
    ];
  }, [adminDashboard, role, studentDashboard, teacherDashboard]);

  const completedCourses = useMemo(() => {
    if (!studentDashboard) {
      return [];
    }
    return studentDashboard.courses
      .filter((course) => normalizeStatus(course.status) === "TERMINE" || course.progress >= 100)
      .slice(0, 2);
  }, [studentDashboard]);

  const inProgressCourses = useMemo(() => {
    if (!studentDashboard) {
      return [];
    }
    return studentDashboard.courses
      .filter((course) => normalizeStatus(course.status) !== "TERMINE" && course.progress < 100)
      .slice(0, 2);
  }, [studentDashboard]);

  const skillBadges = useMemo(() => {
    if (studentDashboard && studentDashboard.courses.length > 0) {
      return Array.from(
        new Set(studentDashboard.courses.map((course) => course.category).filter(Boolean)),
      ).slice(0, 5);
    }

    if (role === "teacher") {
      return [profile?.specialite || teacherSpecialty || "Mentorship"];
    }

    if (role === "admin") {
      return ["Operations", "Monitoring", "Security"];
    }

    return [profile?.niveau || studentLevel || "Learning"];
  }, [profile?.niveau, profile?.specialite, role, studentDashboard, studentLevel, teacherSpecialty]);

  const activityFeed = useMemo(() => {
    if (!studentDashboard?.recentActivity?.length) {
      return [];
    }
    return studentDashboard.recentActivity.slice(0, 3);
  }, [studentDashboard]);

  const teacherCourses = teacherDashboard?.courses.slice(0, 4) || [];
  const teacherSessions = teacherDashboard?.upcomingSessions.slice(0, 4) || [];
  const adminRecentCourses = adminDashboard?.recentCourses.slice(0, 4) || [];
  const adminRecentInscriptions = adminDashboard?.recentInscriptions.slice(0, 6) || [];

  const teacherPublicProfileId = role === "teacher" ? profile?.id || user?.id || null : null;
  const teacherPublicProfilePath = teacherPublicProfileId
    ? `/profile/teacher/${teacherPublicProfileId}`
    : null;
  const profilePublicPath =
    role === "teacher" ? teacherPublicProfilePath : role === "student" ? "/profile/public" : null;
  const joinedOn = formatDate(profile?.createdAt);
  const profileLocation = profile?.location || "Location not set";
  const profileBio =
    profile?.bio ||
    (role === "teacher"
      ? "Describe your teaching style, your expertise, and what students can expect in your courses."
      : "Share your learning goals, areas of focus, and what you are building right now.");
  const roleDashboardPath = role === "teacher" ? "/teacher/dashboard" : "/dashboard";
  const roleProfileSignals = [
    Boolean(profile?.firstName),
    Boolean(profile?.lastName),
    Boolean(profile?.email),
    Boolean(avatarUrl),
    Boolean(profile?.bio),
    Boolean(profile?.location),
    Boolean(roleSubtitle && roleSubtitle !== "Instructor profile" && roleSubtitle !== "Student profile"),
    role === "teacher"
      ? teacherCourses.length > 0
      : inProgressCourses.length + completedCourses.length > 0,
    role === "teacher" ? teacherSessions.length > 0 : activityFeed.length > 0,
  ];
  const roleProfileStrength = Math.max(
    35,
    Math.min(100, Math.round((roleProfileSignals.filter(Boolean).length / roleProfileSignals.length) * 100)),
  );
  const roleProfileHint =
    roleProfileStrength >= 90
      ? "Excellent profile quality. Keep your information up to date."
      : roleProfileStrength >= 70
        ? role === "teacher"
          ? "Your profile is almost complete. Add a richer bio and links."
          : "Your profile is almost complete. Add social links and activity details."
        : role === "teacher"
          ? "Add more details so students can trust your public profile faster."
          : "Add more details so instructors and peers can better understand your learning journey.";

  return {
    user,
    isAuthenticated,
    teacherShared,
    adminShared,
    profile,
    profileLoading,
    profileError,
    role,
    studentLevel,
    teacherSpecialty,
    studentDashboard,
    teacherDashboard,
    adminDashboard,
    studentLoading,
    teacherLoading,
    adminLoading,
    unreadCount,
    fullName,
    avatarUrl,
    initials,
    roleSubtitle,
    metrics,
    completedCourses,
    inProgressCourses,
    skillBadges,
    activityFeed,
    teacherCourses,
    teacherSessions,
    adminRecentCourses,
    adminRecentInscriptions,
    teacherPublicProfilePath,
    profilePublicPath,
    joinedOn,
    profileLocation,
    profileBio,
    roleDashboardPath,
    roleProfileStrength,
    roleProfileHint,
  };
}

export type ProfilePageDataModel = ReturnType<typeof useProfilePageData>;
