import { ArrowLeft, ArrowRight, Check, CheckCircle2, Save, Search, Settings2, Sparkles } from 'lucide-react';
import {
  VISIBILITY_OPTIONS,
  type CourseBuilderDraft,
  type PricingMode,
} from '../../../teacher/course-builder/courseBuilder.utils';
interface CourseBuilderStepThreeProps {
  draft: CourseBuilderDraft;
  updateDraft: (updates: Partial<CourseBuilderDraft>) => void;
  goBack: () => void;
  saveDraft: () => void;
  goNext: () => void;
}

export function CourseBuilderStepThree({
  draft,
  updateDraft,
  goBack,
  saveDraft,
  goNext,
}: CourseBuilderStepThreeProps) {
  return (
          <>
            <div className="grid w-full max-w-5xl grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-8 lg:col-span-2">
                <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                      <Settings2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Course Visibility & Access</h3>
                      <p className="text-sm text-slate-500">
                        Choisissez qui peut voir et rejoindre ce cours.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {VISIBILITY_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateDraft({ visibility: option.value })}
                        className={`rounded-[24px] border-2 p-4 text-left transition ${
                          draft.visibility === option.value
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full border ${
                              draft.visibility === option.value
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : 'border-slate-300 text-transparent'
                            }`}
                          >
                            <Check className="h-3 w-3" />
                          </div>
                          <div>
                            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-900">
                              {option.title}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              {option.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {draft.visibility === 'protected' ? (
                    <div className="mt-4">
                      <label className="mb-2 block text-sm font-semibold">Password</label>
                      <input
                        value={draft.password}
                        onChange={(event) => updateDraft({ password: event.target.value })}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                        placeholder="Definissez un mot de passe d acces"
                        type="text"
                      />
                    </div>
                  ) : null}
                </section>

                <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Pricing Model</h3>
                        <p className="text-sm text-slate-500">
                          Definissez comment monetiser ce cours.
                        </p>
                      </div>
                    </div>
                    <div className="flex rounded-2xl border border-slate-200 bg-slate-100 p-1">
                      {(['free', 'paid'] as PricingMode[]).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => updateDraft({ pricingMode: mode })}
                          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                            draft.pricingMode === mode
                              ? 'bg-white text-blue-600 shadow-sm'
                              : 'text-slate-500'
                          }`}
                        >
                          {mode === 'free' ? 'Free' : 'Paid'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {draft.pricingMode === 'paid' ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold">Regular Price</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                          <input
                            value={draft.regularPrice}
                            onChange={(event) => updateDraft({ regularPrice: event.target.value })}
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-9 pr-4 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                            placeholder="99.00"
                            type="number"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold">Currency</label>
                        <select
                          value={draft.currency}
                          onChange={(event) => updateDraft({ currency: event.target.value })}
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                        >
                          <option value="USD">USD - US Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                          <option value="GBP">GBP - British Pound</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-semibold">Discounted Price</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                          <input
                            value={draft.discountedPrice}
                            onChange={(event) =>
                              updateDraft({ discountedPrice: event.target.value })
                            }
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-9 pr-4 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                            placeholder="49.00"
                            type="number"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                          Laissez vide pour ne pas activer de promotion.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                      Le cours sera publie comme gratuit avec metadata pricing synchronisee.
                    </div>
                  )}
                </section>

                <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                      <Search className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">SEO & Metadata</h3>
                      <p className="text-sm text-slate-500">
                        Renseignez les informations qui serviront au referencement.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="mb-2 block text-sm font-semibold">Search Engine Title</label>
                      <input
                        value={draft.seoTitle}
                        onChange={(event) => updateDraft({ seoTitle: event.target.value })}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                        placeholder="Titre SEO du cours"
                        type="text"
                      />
                      <div className="mt-2 flex justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        <span>Recommended: 50-60 chars</span>
                        <span>{draft.seoTitle.length}/60</span>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold">Meta Description</label>
                      <textarea
                        value={draft.metaDescription}
                        onChange={(event) =>
                          updateDraft({ metaDescription: event.target.value })
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                        placeholder="Resume visible dans les moteurs de recherche"
                        rows={4}
                      />
                      <div className="mt-2 flex justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        <span>Recommended: 150-160 chars</span>
                        <span>{draft.metaDescription.length}/160</span>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-bold">Completion</h3>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4">
                    <div>
                      <p className="text-sm font-semibold">Issue Certificate</p>
                      <p className="text-xs text-slate-500">
                        Auto-generate after completion
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateDraft({ issueCertificate: !draft.issueCertificate })
                      }
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
                        draft.issueCertificate ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                          draft.issueCertificate ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </section>

                <section className="rounded-[28px] border border-blue-200 bg-blue-50 p-6">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
                    Pro tip
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Les cours entre 49 et 199 USD performent souvent mieux sur les competences
                    professionnelles. Pensez aussi a aligner le SEO sur le titre reel du cours.
                  </p>
                  <div className="mt-5 rounded-[24px] border border-dashed border-blue-200 bg-white p-5 text-center">
                    <Sparkles className="mx-auto h-8 w-8 text-blue-600" />
                    <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                      Live preview
                    </p>
                    <p className="mt-2 text-sm font-semibold">
                      {draft.title || 'Votre landing course apparaitra ici'}
                    </p>
                  </div>
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

