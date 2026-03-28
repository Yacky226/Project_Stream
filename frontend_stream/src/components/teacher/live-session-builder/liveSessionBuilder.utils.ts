import { toLocalDateTimeInput } from '../../live/liveSession.utils';

export type BuilderStep = 1 | 2 | 3;
export type SessionMode = 'new' | 'existing';
export type StreamType = 'livekit';
export type VisibilityMode = 'public' | 'private';
export type AudienceLevel = 'all' | 'beginner' | 'intermediate' | 'advanced';
export type PricingMode = 'free' | 'paid';

export interface LiveBuilderDraft {
  step: BuilderStep;
  sessionMode: SessionMode;
  selectedCourseId: string;
  title: string;
  description: string;
  category: string;
  scheduledAt: string;
  thumbnailName: string;
  streamType: StreamType;
  enableLiveChat: boolean;
  enableQnaModeration: boolean;
  allowReactions: boolean;
  recordingEnabled: boolean;
  cloudBackup: boolean;
  visibility: VisibilityMode;
  resolution: string;
  targetLevel: AudienceLevel;
  maxParticipants: string;
  unlimitedParticipants: boolean;
  prerequisites: string[];
  pricingMode: PricingMode;
  currency: string;
  basePrice: string;
  earlyBirdEnabled: boolean;
  earlyBirdDiscount: string;
}

export interface LocalSessionMetadata {
  savedAt: string;
  mode: SessionMode;
  title: string;
  description: string;
  category: string;
  thumbnailName: string;
  streamType: StreamType;
  enableLiveChat: boolean;
  enableQnaModeration: boolean;
  allowReactions: boolean;
  cloudBackup: boolean;
  visibility: VisibilityMode;
  targetLevel: AudienceLevel;
  maxParticipants: string;
  unlimitedParticipants: boolean;
  prerequisites: string[];
  pricingMode: PricingMode;
  currency: string;
  basePrice: string;
  earlyBirdEnabled: boolean;
  earlyBirdDiscount: string;
  linkedCourseId: string;
  linkedCourseTitle: string | null;
}

export const LIVE_BUILDER_STORAGE_KEY = 'teacher-live-builder-draft-v1';
export const LIVE_BUILDER_METADATA_KEY = 'teacher-live-session-metadata-v1';

export const CATEGORY_OPTIONS = [
  'Science & Technology',
  'Mathematics',
  'Humanities',
  'Business & Economics',
  'Arts & Design',
  'Development',
  'Design',
  'Marketing',
];

export const RESOLUTION_OPTIONS = ['720p', '1080p', '1440p'];
export const CURRENCY_OPTIONS = ['USD', 'EUR', 'GBP'];

export const TARGET_LEVEL_OPTIONS: Array<{ value: AudienceLevel; label: string }> = [
  { value: 'all', label: 'All levels' },
  { value: 'beginner', label: 'Beginner only' },
  { value: 'intermediate', label: 'Intermediate only' },
  { value: 'advanced', label: 'Advanced only' },
];

export function createDefaultDraft(): LiveBuilderDraft {
  const targetDate = new Date(Date.now() + 48 * 60 * 60 * 1000);

  return {
    step: 1,
    sessionMode: 'new',
    selectedCourseId: '',
    title: '',
    description: '',
    category: 'Science & Technology',
    scheduledAt: toLocalDateTimeInput(targetDate.toISOString()),
    thumbnailName: '',
    streamType: 'livekit',
    enableLiveChat: true,
    enableQnaModeration: false,
    allowReactions: true,
    recordingEnabled: true,
    cloudBackup: true,
    visibility: 'public',
    resolution: '1080p',
    targetLevel: 'all',
    maxParticipants: '50',
    unlimitedParticipants: false,
    prerequisites: ['Basic communication', 'Stable internet connection'],
    pricingMode: 'free',
    currency: 'USD',
    basePrice: '',
    earlyBirdEnabled: true,
    earlyBirdDiscount: '20',
  };
}

export function persistSessionMetadata(sessionId: string, metadata: LocalSessionMetadata) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const raw = window.localStorage.getItem(LIVE_BUILDER_METADATA_KEY);
    const existing = raw ? (JSON.parse(raw) as Record<string, LocalSessionMetadata>) : {};
    const nextEntries = Object.entries({ [sessionId]: metadata, ...existing }).slice(0, 20);
    window.localStorage.setItem(
      LIVE_BUILDER_METADATA_KEY,
      JSON.stringify(Object.fromEntries(nextEntries)),
    );
  } catch {
    // Best effort local persistence only.
  }
}

export function formatSchedule(value: string) {
  if (!value) return 'Not scheduled yet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not scheduled yet';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function broadcastLabel(streamType: StreamType) {
  if (streamType === 'livekit') return 'LIVEKIT';
  return 'LIVEKIT';
}

export function stepLabel(step: BuilderStep) {
  if (step === 1) return 'Basic Information';
  if (step === 2) return 'Technical Setup';
  return 'Audience & Pricing';
}

export function stepDescription(step: BuilderStep) {
  if (step === 1) return 'Define the public-facing basics of your session.';
  if (step === 2) return 'Choose how you will broadcast and manage interactivity.';
  return 'Set audience rules before publishing the live session.';
}

export function progressForStep(step: BuilderStep) {
  if (step === 1) return 33;
  if (step === 2) return 66;
  return 100;
}

export function stepToPath(step: BuilderStep) {
  if (step === 2) return '/teacher/live-session-builder/technical';
  if (step === 3) return '/teacher/live-session-builder/audience';
  return '/teacher/live-session-builder';
}

export function stepFromPath(path?: string): BuilderStep {
  if (path?.includes('/teacher/live-session-builder/audience')) return 3;
  if (path?.includes('/teacher/live-session-builder/technical')) return 2;
  return 1;
}

export function validateStepOne(draft: LiveBuilderDraft) {
  if (draft.sessionMode === 'existing' && !draft.selectedCourseId) {
    return 'Select an existing course before moving to technical setup.';
  }
  if (!draft.title.trim()) {
    return draft.sessionMode === 'new'
      ? 'Add a title for the course and first live session.'
      : 'Add a session title for your audience.';
  }
  if (!draft.description.trim()) return 'Add a short description so learners know what to expect.';
  if (!draft.category) return 'Choose a category for this session.';
  if (!draft.scheduledAt) return 'Choose the date and time of the live session.';
  return null;
}

export function validateStepThree(draft: LiveBuilderDraft) {
  if (!draft.unlimitedParticipants) {
    const limit = Number(draft.maxParticipants);
    if (!Number.isFinite(limit) || limit <= 0) {
      return 'Set a valid participant limit or enable unlimited capacity.';
    }
  }
  if (draft.pricingMode === 'paid') {
    const price = Number(draft.basePrice);
    if (!Number.isFinite(price) || price <= 0) {
      return 'Set a valid price before publishing a paid session.';
    }
  }
  if (draft.earlyBirdEnabled) {
    const discount = Number(draft.earlyBirdDiscount);
    if (!Number.isFinite(discount) || discount <= 0 || discount >= 100) {
      return 'Early bird discount must stay between 1% and 99%.';
    }
  }
  return null;
}
