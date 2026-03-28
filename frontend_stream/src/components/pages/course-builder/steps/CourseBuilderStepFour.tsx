import { ArrowLeft, BookOpen, CalendarDays, Check, CheckCircle2, ImagePlus, Layers3, LayoutTemplate, Rocket, Save, Settings2 } from 'lucide-react';
import { ImageWithFallback } from '../../../figma/ImageWithFallback';
import { formatDurationFromMinutes, type CourseBuilderDraft } from '../../../teacher/course-builder/courseBuilder.utils';
interface CourseBuilderStepFourProps {
  draft: CourseBuilderDraft;
  thumbnailPreview: string | null;
  totalLessons: number;
  totalVideoMinutes: number;
  totalQuizzes: number;
  checklist: Array<{ label: string; done: boolean }>;
  moveToStep: (step: 1 | 2 | 3 | 4) => void;
  publishedCourseId: string | null;
  onNavigate: (path: string) => void;
  setStatusMessage: (value: string) => void;
  saveDraft: () => void;
  publishCourse: () => void;
  isPublishing: boolean;
  discardDraft: () => void;
  goBack: () => void;
}

export function CourseBuilderStepFour({
  draft,
  thumbnailPreview,
  totalLessons,
  totalVideoMinutes,
  totalQuizzes,
  checklist,
  moveToStep,
  publishedCourseId,
  onNavigate,
  setStatusMessage,
  saveDraft,
  publishCourse,
  isPublishing,
  discardDraft,
  goBack,
}: CourseBuilderStepFourProps) {
  return (
          <>
            <div className="grid w-full max-w-5xl grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                        <LayoutTemplate className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Basic Information</h3>
                        <p className="text-sm text-slate-500">
                          Verifiez le positionnement global du cours.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => moveToStep(1)}
                      className="text-sm font-semibold text-blue-600 transition hover:underline"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="flex flex-col gap-6 md:flex-row">
                    <div className="h-36 w-full overflow-hidden rounded-[24px] bg-slate-100 md:w-52">
                      {thumbnailPreview ? (
                        <ImageWithFallback
                          src={thumbnailPreview}
                          alt="Course preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-300">
                          <ImagePlus className="h-10 w-10" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                          Course title
                        </p>
                        <p className="mt-1 text-xl font-bold">{draft.title || 'Titre non renseigne'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                          Subtitle
                        </p>
                        <p className="mt-1 text-sm leading-7 text-slate-600">
                          {draft.subtitle || 'Sous-titre non renseigne'}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                            Category
                          </p>
                          <span className="mt-2 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-600">
                            {draft.category}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                            Level
                          </p>
                          <span className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-600">
                            {draft.level}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                        <Layers3 className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Curriculum Overview</h3>
                        <p className="text-sm text-slate-500">
                          Resume quantitatif du contenu prepare.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => moveToStep(2)}
                      className="text-sm font-semibold text-blue-600 transition hover:underline"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="rounded-[22px] bg-slate-50 p-4 text-center">
                      <p className="text-3xl font-black text-blue-600">{draft.sections.length}</p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Sections
                      </p>
                    </div>
                    <div className="rounded-[22px] bg-slate-50 p-4 text-center">
                      <p className="text-3xl font-black text-blue-600">{totalLessons}</p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Lessons
                      </p>
                    </div>
                    <div className="rounded-[22px] bg-slate-50 p-4 text-center">
                      <p className="text-3xl font-black text-blue-600">
                        {formatDurationFromMinutes(totalVideoMinutes)}
                      </p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Video
                      </p>
                    </div>
                    <div className="rounded-[22px] bg-slate-50 p-4 text-center">
                      <p className="text-3xl font-black text-blue-600">{totalQuizzes}</p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Quizzes
                      </p>
                    </div>
                  </div>
                </section>

                <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                        <Settings2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Settings & Pricing</h3>
                        <p className="text-sm text-slate-500">
                          Etat final avant publication.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => moveToStep(3)}
                      className="text-sm font-semibold text-blue-600 transition hover:underline"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 py-3">
                      <span className="text-sm font-medium">Visibility</span>
                      <span className="text-sm font-bold capitalize text-emerald-600">
                        {draft.visibility}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-100 py-3">
                      <span className="text-sm font-medium">Price</span>
                      <span className="text-sm font-bold">
                        {draft.pricingMode === 'free'
                          ? 'Free'
                          : `${draft.discountedPrice || draft.regularPrice || '0'} ${draft.currency}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-100 py-3">
                      <span className="text-sm font-medium">SEO</span>
                      <span className="text-sm font-bold text-emerald-600">
                        {draft.seoTitle && draft.metaDescription ? 'Optimized' : 'Incomplete'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-sm font-medium">Certificate</span>
                      <span className="text-sm font-bold">
                        {draft.issueCertificate ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <section className="rounded-[28px] border border-blue-200 bg-blue-50 p-6">
                  <h3 className="flex items-center gap-2 text-lg font-bold">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    Pre-publish checklist
                  </h3>
                  <div className="mt-5 space-y-4">
                    {checklist.map((item) => (
                      <div key={item.label} className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded ${
                            item.done
                              ? 'bg-blue-600 text-white'
                              : 'border border-slate-300 text-transparent'
                          }`}
                        >
                          <Check className="h-3 w-3" />
                        </div>
                        <span className="text-sm text-slate-700">
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={publishCourse}
                      disabled={isPublishing}
                      className="flex w-full items-center justify-center gap-2 rounded-[22px] bg-blue-600 px-6 py-4 font-bold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Rocket className="h-4 w-4" />
                      {isPublishing ? 'Publishing...' : 'Publish Course Now'}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        publishedCourseId
                          ? onNavigate(`/courses/${publishedCourseId}`)
                          : setStatusMessage(
                              'Publiez d abord le cours pour ouvrir un apercu base sur les donnees backend.',
                            )
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-[22px] border border-slate-200 px-6 py-3 font-semibold transition hover:bg-slate-50"
                    >
                      <BookOpen className="h-4 w-4" />
                      Preview as Student
                    </button>
                    <button
                      type="button"
                      onClick={saveDraft}
                      className="flex w-full items-center justify-center gap-2 rounded-[22px] border border-transparent px-6 py-3 font-semibold text-slate-500 transition hover:border-slate-200 hover:bg-white"
                    >
                      <Save className="h-4 w-4" />
                      Save as Draft
                    </button>
                  </div>

                  {publishedCourseId ? (
                    <div className="mt-5 rounded-[24px] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                      Le cours backend est cree. Vous pouvez maintenant planifier une session live
                      ou ouvrir la page detail.
                    </div>
                  ) : (
                    <div className="mt-5 rounded-[24px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                      Publication actuelle: le cours, les sections, les lecons et les reglages
                      avances sont envoyes au backend.
                    </div>
                  )}

                  {publishedCourseId ? (
                    <button
                      type="button"
                      onClick={() => onNavigate('/teacher/live-sessions')}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-[22px] border border-blue-200 bg-blue-100 px-6 py-3 font-semibold text-blue-600 transition hover:bg-blue-100"
                    >
                      <CalendarDays className="h-4 w-4" />
                      Plan live sessions
                    </button>
                  ) : null}
                </section>
              </div>
            </div>

            <div className="mt-10 flex w-full max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                  onClick={discardDraft}
                  className="w-full rounded-full border border-slate-200 px-8 py-3 font-semibold text-slate-600 transition hover:bg-slate-50 sm:w-auto"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={publishCourse}
                  disabled={isPublishing}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-10 py-3 font-semibold text-white shadow-md transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  <Rocket className="h-4 w-4" />
                  {isPublishing ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            </div>
          </>
  );
}

