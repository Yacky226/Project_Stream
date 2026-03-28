import type { ChangeEvent, RefObject } from 'react';
import { ArrowRight, ImagePlus, LayoutTemplate, Save, Upload } from 'lucide-react';
import { ImageWithFallback } from '../../../figma/ImageWithFallback';
import {
  CATEGORY_OPTIONS,
  LEVEL_OPTIONS,
  type CourseBuilderDraft,
} from '../../../teacher/course-builder/courseBuilder.utils';
interface CourseBuilderStepOneProps {
  draft: CourseBuilderDraft;
  thumbnailPreview: string | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  updateDraft: (updates: Partial<CourseBuilderDraft>) => void;
  handleThumbnailChange: (event: ChangeEvent<HTMLInputElement>) => void;
  discardDraft: () => void;
  saveDraft: () => void;
  goNext: () => void;
}

export function CourseBuilderStepOne({
  draft,
  thumbnailPreview,
  fileInputRef,
  updateDraft,
  handleThumbnailChange,
  discardDraft,
  saveDraft,
  goNext,
}: CourseBuilderStepOneProps) {
  return (
          <>
            <div className="w-full max-w-5xl rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm lg:p-10">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                <div className="space-y-7 lg:col-span-7">
                  <div>
                    <label className="mb-2 block text-sm font-semibold tracking-tight">Course Title</label>
                    <input
                      value={draft.title}
                      onChange={(event) => updateDraft({ title: event.target.value })}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                      placeholder="e.g. Masterclass in Modern Web Architecture"
                      type="text"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold tracking-tight">Sub-headline</label>
                    <textarea
                      value={draft.subtitle}
                      onChange={(event) => updateDraft({ subtitle: event.target.value })}
                      className="min-h-[112px] w-full rounded-xl border border-slate-200 bg-white p-4 text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                      placeholder="A brief hook that captures your student's attention immediately..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold tracking-tight">Category</label>
                      <select
                        value={draft.category}
                        onChange={(event) => updateDraft({ category: event.target.value })}
                        className="h-12 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-4 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                      >
                        {CATEGORY_OPTIONS.map((option) => (
                          <option key={option}>{option}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold tracking-tight">Difficulty Level</label>
                      <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-1">
                        {LEVEL_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => updateDraft({ level: option.value })}
                            className={`flex-1 rounded-xl px-2 py-2 text-[11px] font-bold transition ${draft.level === option.value ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col lg:col-span-5">
                  <label className="mb-2 block text-sm font-semibold tracking-tight">Course Thumbnail</label>
                  <div className="flex flex-1 flex-col">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="group relative flex min-h-[360px] flex-1 cursor-pointer flex-col items-center justify-start rounded-[24px] border-2 border-dashed border-slate-300 bg-slate-50 p-6 transition-all hover:border-blue-300 hover:bg-blue-50"
                    >
                      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-md transition-transform group-hover:scale-110">
                        {thumbnailPreview ? <ImagePlus className="h-8 w-8 text-blue-600" /> : <Upload className="h-8 w-8 text-blue-600" />}
                      </div>
                      <p className="mb-1 text-sm font-semibold text-slate-900">
                        {thumbnailPreview ? 'Replace current image' : 'Drag and drop image'}
                      </p>
                      <p className="text-xs font-medium text-slate-400">PNG, JPG, or WEBP (max 5MB)</p>
                      <div className="mt-6 flex h-44 w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                        {thumbnailPreview ? (
                          <ImageWithFallback src={thumbnailPreview} alt="Course thumbnail preview" className="h-full w-full object-cover" />
                        ) : (
                          <div className="text-center p-4">
                            <LayoutTemplate className="mx-auto h-12 w-12 text-slate-300" />
                            <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-slate-400">Preview area</p>
                          </div>
                        )}
                      </div>
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleThumbnailChange} />
                    <p className="mt-3 text-xs text-slate-500">
                      Le fichier est previsualise localement puis televerse au backend au moment de la publication.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex w-full max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={discardDraft}
                className="w-full cursor-pointer rounded-full border border-slate-300 bg-white px-8 py-3 font-semibold text-slate-600 transition-all hover:bg-slate-50 sm:w-auto"
              >
                Discard Changes
              </button>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={saveDraft}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-blue-600 bg-white px-8 py-3 font-semibold text-blue-600 transition-all hover:bg-blue-50 sm:w-auto"
                >
                  <Save className="h-4 w-4" />
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex h-12 w-full cursor-pointer shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-blue-600 px-8 font-semibold text-white shadow-[0_10px_24px_rgba(17,82,212,0.35)] transition-all hover:bg-blue-700 sm:w-auto sm:min-w-[170px]"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
  );
}

