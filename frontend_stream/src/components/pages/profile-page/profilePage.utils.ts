import type { ComponentType } from "react";
import { Award, BookOpen, Layers, Sparkles, Star } from "lucide-react";

export interface MetricCard {
  icon: ComponentType<{ className?: string }>;
  value: string;
  label: string;
}

export function getInitials(firstName?: string, lastName?: string): string {
  const first = firstName?.trim().charAt(0) || "";
  const last = lastName?.trim().charAt(0) || "";
  const initials = `${first}${last}`.toUpperCase();
  return initials || "U";
}

export function normalizeStatus(value?: string | null): string {
  return (value || "").trim().toUpperCase();
}

export function formatDate(value?: string | null): string {
  if (!value) {
    return "N/A";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "N/A";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

export function activityDescription(type: string, title: string, details?: string): string {
  const normalizedType = (type || "").toLowerCase();
  if (normalizedType === "completed") {
    return `Completed ${title}`;
  }
  if (normalizedType === "enrolled") {
    return `Enrolled in ${title}`;
  }
  if (normalizedType === "session") {
    return `Joined a live session: ${title}`;
  }
  if (normalizedType === "progress") {
    return `Progress update: ${title}`;
  }
  return details || title;
}

export const badgeIcons = [Sparkles, Layers, BookOpen, Star, Award];
