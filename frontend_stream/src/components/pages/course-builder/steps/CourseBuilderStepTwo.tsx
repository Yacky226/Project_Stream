import { ArrowLeft, ArrowRight, BookOpen, ChevronDown, CopyPlus, Layers3, Save, Trash2 } from 'lucide-react';
import {
  LESSON_TYPE_OPTIONS,
  formatDurationFromMinutes,
  type CourseBuilderDraft,
  type LessonDraft,
  type LessonType,
  type SectionDraft,
} from '../../../teacher/course-builder/courseBuilder.utils';
interface CourseBuilderStepTwoProps {
  draft: CourseBuilderDraft;
  totalLessons: number;
  totalVideoMinutes: number;
  updateSection: (sectionId: string, updates: Partial<SectionDraft>) => void;
  addLesson: (sectionId: string) => void;
  removeSection: (sectionId: string) => void;
  removeLesson: (sectionId: string, lessonId: string) => void;
  updateLesson: (
    sectionId: string,
    lessonId: string,
    updates: Partial<LessonDraft>,
  ) => void;
  addSection: () => void;
  goBack: () => void;
  saveDraft: () => void;
  goNext: () => void;
}

export function CourseBuilderStepTwo({
  draft,
  totalLessons,
  totalVideoMinutes,
  updateSection,
  addLesson,
  removeSection,
  removeLesson,
  updateLesson,
  addSection,
  goBack,
  saveDraft,
  goNext,
}: CourseBuilderStepTwoProps) {
  return (
          <>
            <div className="w-full max-w-4xl space-y-8">
              <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm lg:p-10">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
                      <Layers3 className="h-4 w-4" />
                      Curriculum Builder
                    </div>
                    <h3 className="mt-2 text-2xl font-bold">Organisez sections et lecons</h3>
                    <p className="mt-2 text-sm text-slate-500">
                      Structurez votre programme maintenant. Cette partie du wizard sera publiee
                      elle aussi dans le backend avec le cours.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center">
                      <p className="text-2xl font-black text-blue-600">{draft.sections.length}</p>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Sections</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center">
                      <p className="text-2xl font-black text-blue-600">{totalLessons}</p>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Lessons</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center">
                      <p className="text-2xl font-black text-blue-600">{formatDurationFromMinutes(totalVideoMinutes)}</p>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Video</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {draft.sections.map((section, sectionIndex) => (
                    <div key={section.id} className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
                      <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex-1">
                            <div className="mb-3 flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                                <ChevronDown className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                                  Section {sectionIndex + 1}
                                </p>
                                <input
                                  value={section.title}
                                  onChange={(event) =>
                                    updateSection(section.id, { title: event.target.value })
                                  }
                                  className="mt-1 w-full border-none bg-transparent p-0 text-lg font-bold outline-none focus:ring-0"
                                  placeholder="Titre de section"
                                  type="text"
                                />
                              </div>
                            </div>
                            <textarea
                              value={section.description}
                              onChange={(event) =>
                                updateSection(section.id, { description: event.target.value })
                              }
                              className="min-h-[90px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                              placeholder="Ajoutez une courte description pour orienter les etudiants."
                              rows={3}
                            />
                          </div>

                          <div className="flex items-center gap-2 self-start">
                            <button
                              type="button"
                              onClick={() => addLesson(section.id)}
                              className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
                            >
                              <CopyPlus className="h-4 w-4" />
                              Add lesson
                            </button>
                            <button
                              type="button"
                              onClick={() => removeSection(section.id)}
                              disabled={draft.sections.length === 1}
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-rose-200 text-rose-500 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 p-4">
                        {section.lessons.map((lesson, lessonIndex) => (
                          <div
                            key={lesson.id}
                            className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4"
                          >
                            <div className="mb-3 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                                  <BookOpen className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                                    Lesson {sectionIndex + 1}.{lessonIndex + 1}
                                  </p>
                                  <p className="text-sm font-semibold text-slate-600">
                                    {lesson.type}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeLesson(section.id, lesson.id)}
                                disabled={section.lessons.length === 1}
                                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-white hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                              <div className="md:col-span-5">
                                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                                  Lesson title
                                </label>
                                <input
                                  value={lesson.title}
                                  onChange={(event) =>
                                    updateLesson(section.id, lesson.id, { title: event.target.value })
                                  }
                                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                                  placeholder="Nom de la lecon"
                                  type="text"
                                />
                              </div>

                              <div className="md:col-span-3">
                                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                                  Format
                                </label>
                                <select
                                  value={lesson.type}
                                  onChange={(event) =>
                                    updateLesson(section.id, lesson.id, {
                                      type: event.target.value as LessonType,
                                    })
                                  }
                                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                                >
                                  {LESSON_TYPE_OPTIONS.map((option) => (
                                    <option key={option} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="md:col-span-2">
                                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                                  Duration
                                </label>
                                <input
                                  value={lesson.duration}
                                  onChange={(event) =>
                                    updateLesson(section.id, lesson.id, { duration: event.target.value })
                                  }
                                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                                  min="0"
                                  placeholder="15"
                                  type="number"
                                />
                              </div>

                              <div className="md:col-span-2">
                                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                                  Extra
                                </label>
                                <input
                                  value={lesson.meta}
                                  onChange={(event) =>
                                    updateLesson(section.id, lesson.id, { meta: event.target.value })
                                  }
                                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                                  placeholder="PDF, 10 Q..."
                                  type="text"
                                />
                              </div>
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => addLesson(section.id)}
                          className="flex w-full items-center justify-center gap-2 rounded-[22px] border-2 border-dashed border-slate-200 px-4 py-4 text-sm font-semibold text-slate-500 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <CopyPlus className="h-4 w-4" />
                          Add new lesson
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addSection}
                    className="flex w-full flex-col items-center justify-center gap-2 rounded-[28px] border-2 border-dashed border-blue-200 bg-blue-50 px-6 py-8 text-blue-600 transition hover:bg-blue-100"
                  >
                    <Layers3 className="h-8 w-8" />
                    <span className="font-bold">Add new section</span>
                    <span className="text-xs uppercase tracking-[0.18em] text-blue-500">
                      Create a new learning block
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-10 flex w-full max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={goBack}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 px-8 py-3 font-semibold text-slate-600 transition-all hover:bg-slate-50 sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={saveDraft}
                  className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-blue-600 px-8 py-3 font-semibold text-blue-600 transition-all hover:bg-blue-50 sm:w-auto"
                >
                  <Save className="h-4 w-4" />
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-blue-600 px-8 font-semibold text-white shadow-md transition-all hover:bg-blue-700 sm:w-auto sm:min-w-[170px]"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
  );
}

