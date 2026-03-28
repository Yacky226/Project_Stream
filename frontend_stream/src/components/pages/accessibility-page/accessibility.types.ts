import type { LucideIcon } from 'lucide-react';

export interface AccessibilityPageProps {
  onNavigate: (path: string) => void;
}

export interface AccessibilityFeature {
  category: string;
  icon: LucideIcon;
  colorClass: string;
  backgroundClass: string;
  items: string[];
}

export interface AccessibilityStandard {
  name: string;
  description: string;
  status: string;
  level: string;
}

export interface AccessibilityTool {
  name: string;
  description: string;
  icon: LucideIcon;
  compatibility: string;
}

export interface AccessibilityImprovement {
  title: string;
  description: string;
  icon: LucideIcon;
  colorClass: string;
}

export interface AccessibilityPageDataModel {
  features: AccessibilityFeature[];
  standards: AccessibilityStandard[];
  tools: AccessibilityTool[];
  reportChannels: string[];
  reportDetails: string[];
  improvements: AccessibilityImprovement[];
}
