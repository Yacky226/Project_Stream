import type { ChangeEvent } from 'react';

export type BuilderStep = 1 | 2 | 3 | 4;
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type VisibilityMode = 'public' | 'private' | 'protected';
export type PricingMode = 'free' | 'paid';
export type LessonType = 'VIDEO' | 'PDF' | 'QUIZ' | 'ARTICLE';

export interface LessonDraft {
  id: string;
  title: string;
  type: LessonType;
  duration: string;
  meta: string;
}

export interface SectionDraft {
  id: string;
  title: string;
  description: string;
  lessons: LessonDraft[];
}

export interface CourseBuilderDraft {
  step: BuilderStep;
  title: string;
  subtitle: string;
  category: string;
  level: CourseLevel;
  thumbnailName: string;
  launchDate: string;
  sections: SectionDraft[];
  visibility: VisibilityMode;
  pricingMode: PricingMode;
  regularPrice: string;
  currency: string;
  discountedPrice: string;
  seoTitle: string;
  metaDescription: string;
  issueCertificate: boolean;
  password: string;
}

export interface ChecklistItem {
  label: string;
  done: boolean;
}

export const COURSE_BUILDER_STORAGE_KEY = 'teacher-course-builder-draft-v1';

export const CATEGORY_OPTIONS = ['Development', 'Design', 'Business', 'Marketing'];

export const LEVEL_OPTIONS: Array<{ value: CourseLevel; label: string }> = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export const LESSON_TYPE_OPTIONS: LessonType[] = ['VIDEO', 'PDF', 'QUIZ', 'ARTICLE'];

export const VISIBILITY_OPTIONS: Array<{ value: VisibilityMode; title: string; description: string }> = [
  {
    value: 'public',
    title: 'Public',
    description: 'Le cours peut etre decouvert, recherche et rejoint librement.',
  },
  {
    value: 'private',
    title: 'Private',
    description: 'Le cours reste accessible via lien direct ou invitation uniquement.',
  },
  {
    value: 'protected',
    title: 'Password Protected',
    description: 'Le cours necessite un mot de passe avant acces au contenu.',
  },
];

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptyLesson(index = 1): LessonDraft {
  return {
    id: createId('lesson'),
    title: `Nouvelle lecon ${index}`,
    type: 'VIDEO',
    duration: '',
    meta: '',
  };
}

export function createEmptySection(index = 1): SectionDraft {
  return {
    id: createId('section'),
    title: `Section ${index}`,
    description: '',
    lessons: [createEmptyLesson(1)],
  };
}

export function createDefaultDraft(): CourseBuilderDraft {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  const hours = String(tomorrow.getHours()).padStart(2, '0');
  const minutes = String(tomorrow.getMinutes()).padStart(2, '0');

  return {
    step: 1,
    title: '',
    subtitle: '',
    category: 'Development',
    level: 'beginner',
    thumbnailName: '',
    launchDate: `${year}-${month}-${day}T${hours}:${minutes}`,
    sections: [createEmptySection(1)],
    visibility: 'public',
    pricingMode: 'paid',
    regularPrice: '',
    currency: 'USD',
    discountedPrice: '',
    seoTitle: '',
    metaDescription: '',
    issueCertificate: true,
    password: '',
  };
}

export function formatDurationFromMinutes(totalMinutes: number) {
  if (totalMinutes <= 0) {
    return '0h';
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

export function toBackendLessonType(type: LessonType): 'VIDEO' | 'TEXTE' | 'QUIZ' {
  if (type === 'QUIZ') {
    return 'QUIZ';
  }
  if (type === 'VIDEO') {
    return 'VIDEO';
  }
  return 'TEXTE';
}

export function parseLessonDurationMinutes(value: string): number | undefined {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }
  return Math.round(parsed);
}

export function stepLabel(step: BuilderStep) {
  switch (step) {
    case 1:
      return 'Basic Info';
    case 2:
      return 'Curriculum';
    case 3:
      return 'Settings';
    case 4:
      return 'Publish';
    default:
      return 'Builder';
  }
}

export function stepToPath(step: BuilderStep) {
  if (step === 2) return '/teacher/course-builder/curriculum';
  if (step === 3) return '/teacher/course-builder/settings';
  if (step === 4) return '/teacher/course-builder/publish';
  return '/teacher/course-builder';
}

export function stepFromPath(path?: string): BuilderStep {
  if (path?.includes('/teacher/course-builder/publish')) return 4;
  if (path?.includes('/teacher/course-builder/settings')) return 3;
  if (path?.includes('/teacher/course-builder/curriculum')) return 2;
  return 1;
}

export function countTotalLessons(sections: SectionDraft[]) {
  return sections.reduce((count, section) => count + section.lessons.length, 0);
}

export function countTotalVideoMinutes(sections: SectionDraft[]) {
  return sections.reduce((total, section) => {
    return (
      total +
      section.lessons.reduce((sectionTotal, lesson) => {
        const parsed = Number(lesson.duration);
        return sectionTotal + (Number.isFinite(parsed) ? parsed : 0);
      }, 0)
    );
  }, 0);
}

export function countQuizLessons(sections: SectionDraft[]) {
  return sections.reduce(
    (count, section) => count + section.lessons.filter((lesson) => lesson.type === 'QUIZ').length,
    0,
  );
}

export function buildChecklist(draft: CourseBuilderDraft, totalLessons: number): ChecklistItem[] {
  return [
    {
      label: 'Informations de base completes',
      done: Boolean(draft.title.trim() && draft.subtitle.trim() && draft.launchDate),
    },
    {
      label: 'Programme structure avec sections et lecons',
      done: draft.sections.length > 0 && totalLessons > 0,
    },
    {
      label: 'Pricing coherent et visibilite definie',
      done:
        draft.pricingMode === 'free' ||
        (Boolean(draft.regularPrice) &&
          (!draft.discountedPrice || Number(draft.discountedPrice) <= Number(draft.regularPrice))),
    },
    {
      label: 'SEO renseigne',
      done: Boolean(draft.seoTitle.trim() && draft.metaDescription.trim()),
    },
  ];
}

export function getStepValidationError(draft: CourseBuilderDraft, totalLessons: number): string | null {
  if (draft.step === 1 && (!draft.title.trim() || !draft.subtitle.trim())) {
    return 'Renseignez le titre et le sous-titre.';
  }

  if (draft.step === 2 && (!draft.sections.length || !totalLessons)) {
    return 'Ajoutez au moins une section et une lecon.';
  }

  if (draft.step === 3) {
    if (draft.visibility === 'protected' && !draft.password.trim()) {
      return 'Ajoutez un mot de passe pour le mode protege.';
    }

    if (draft.pricingMode === 'paid') {
      if (!draft.regularPrice) {
        return 'Renseignez un prix standard pour continuer.';
      }
      if (draft.discountedPrice && Number(draft.discountedPrice) > Number(draft.regularPrice)) {
        return 'Le prix reduit doit etre inferieur ou egal au prix standard.';
      }
    }
  }

  return null;
}

export function addSectionToDraft(sections: SectionDraft[]) {
  return [...sections, createEmptySection(sections.length + 1)];
}

export function updateSectionInDraft(
  sections: SectionDraft[],
  sectionId: string,
  updates: Partial<SectionDraft>,
) {
  return sections.map((section) => (section.id === sectionId ? { ...section, ...updates } : section));
}

export function removeSectionFromDraft(sections: SectionDraft[], sectionId: string) {
  if (sections.length === 1) {
    return sections;
  }

  return sections.filter((section) => section.id !== sectionId);
}

export function addLessonToSection(sections: SectionDraft[], sectionId: string) {
  return sections.map((section) =>
    section.id === sectionId
      ? { ...section, lessons: [...section.lessons, createEmptyLesson(section.lessons.length + 1)] }
      : section,
  );
}

export function updateLessonInSection(
  sections: SectionDraft[],
  sectionId: string,
  lessonId: string,
  updates: Partial<LessonDraft>,
) {
  return sections.map((section) =>
    section.id === sectionId
      ? {
          ...section,
          lessons: section.lessons.map((lesson) =>
            lesson.id === lessonId ? { ...lesson, ...updates } : lesson,
          ),
        }
      : section,
  );
}

export function removeLessonFromSection(sections: SectionDraft[], sectionId: string, lessonId: string) {
  return sections.map((section) => {
    if (section.id !== sectionId || section.lessons.length === 1) {
      return section;
    }

    return {
      ...section,
      lessons: section.lessons.filter((lesson) => lesson.id !== lessonId),
    };
  });
}

export function handleThumbnailSelection(
  event: ChangeEvent<HTMLInputElement>,
  onPreviewReady: (preview: string | null, fileName: string) => void,
) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    onPreviewReady(typeof reader.result === 'string' ? reader.result : null, file.name);
  };
  reader.readAsDataURL(file);
}
