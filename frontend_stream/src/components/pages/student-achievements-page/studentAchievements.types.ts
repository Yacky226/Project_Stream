import type { LucideIcon } from 'lucide-react';
import type { StudentDashboardCourse } from '../../../types/dashboard';

export interface StudentAchievementsPageProps {
  onNavigate: (path: string | number) => void;
  currentPath?: string;
}

export interface TrophyCard {
  id: string;
  tag: string;
  tagClassName: string;
  dateLabel: string;
  title: string;
  issuer: string;
  image: string;
}

export interface SkillBadgeCard {
  id: string;
  title: string;
  description: string;
  progress: number;
  statusLabel: string;
  icon: LucideIcon;
  accentClassName: string;
  progressClassName: string;
  labelClassName: string;
}

export interface MilestoneCard {
  id: string;
  stage: 'In Progress' | 'Locked' | 'Future';
  title: string;
  description: string;
  progress?: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  avatar: string;
  highlighted?: boolean;
}

export type DashboardCourse = StudentDashboardCourse;
