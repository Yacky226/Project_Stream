export const VIDEO_PLACEHOLDER =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBAybo5y7TrqfDC1NxN6PNZMRdZ3SxgN9mihA10rKnnkllHWCSCTQ_Vl0o6lrs2_xfUwjoARxkWWPXTyl6S1QDeMO87M_Gk06Ob3KXgxwCrbX0WUnliGp2JPjF4sEQkyVuIUjTb0zXEPEA9T9d3oHqzZcI5DpCgwTDiIjURWFIGCtxCts0xqWnmkt3QUV98mUxTsHDPaguDqGepRwITMMdmEEv16wsIn1o3KWjOz33l58iJTrq56iUEKwhbydRAO58L8EnsiAktV0M";
export const DEMO_STUDENT_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDGie28-WMW3qnehNeXOobHcKw2I584-jjwSH7WPHLp7mx21BfIFaJbjJ4LC6qETnAu_iHA4_IuVRwWwJTV6SlubaMClNrmE0DdYJ9xbkga-WDxEG5eR3DFhHXtrENj-5Zm06uRE0Q1x8-ezDdpnqSMseIBRSPO9L-Tz0Qypum6uo4o96mT8FaM2Er-c9bgK2ito2ls54QxdEFFXp5i_xnoVF1Qt9Eg-mlJosowyI58UiPbQLLC3ohAHV4YubQ7bi2O3kATBXTtMN8";
export const DEMO_STUDENT_AVATAR_2 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCazQ2EGYJfpQavGrK8g49scUHe7vp2K-Typ3uZ9_0owAga-KiqYBq0b9v4m_0ZKNvO_V8zqHlhskSxKuLkvsIDj2AQu7gw4ssau-WoQuesKNLwdDiJVC9x7m8JNJJ73vt8P0e_6Ls-7_mUY9s3qd4moD7q1ar54Q52YVlpRBuxEqJs2ZFF5li7TBbBIgVzrZmsb3DYtIA18H6YUqLfkor9jUpjl-Cffp4TprnvHo2T7wsEvrTR--JRjXbMUE9sQ084bMmbq1tCj5s";
export const LIVE_CHAT_POLLING_MS = 1000;

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function toSafeString(value: unknown, fallback = "") {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return fallback;
  return String(value);
}

export function toNameInitials(value: unknown) {
  const normalized = toSafeString(value, "ME").trim();
  const parts = normalized.split(/\s+/).filter(Boolean);
  if (!parts.length) return "ME";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

export function formatPlayback(minutesTotal: number) {
  const safe = Math.max(0, Math.round(minutesTotal));
  const hours = Math.floor(safe / 60);
  const minutes = safe % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
}

export function formatChatTimestamp(value: unknown) {
  const normalized = toSafeString(value, "");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return "--:--";
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatTimeLabel(value: string | null) {
  if (!value) {
    return "Session pending";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Session pending";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
