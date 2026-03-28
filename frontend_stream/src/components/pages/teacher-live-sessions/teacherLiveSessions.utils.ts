export function buildTeacherStudioPath(
  courseId: string | number,
  sessionId: string | number,
) {
  return `/teacher/live/${courseId}/${sessionId}`;
}

export function getTeacherLiveSessionsErrorMessage(
  error: unknown,
  fallback: string,
) {
  if (!error || typeof error !== 'object') return fallback;
  const payload = error as {
    data?: { message?: string; error?: string };
    error?: string;
    message?: string;
  };
  return payload.data?.message || payload.data?.error || payload.error || payload.message || fallback;
}
