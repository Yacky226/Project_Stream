import { Mail, MapPin, UserPlus, Verified } from 'lucide-react';
import { ImageWithFallback } from '../../../figma/ImageWithFallback';
import type { TeacherProfileDataModel } from '../useTeacherProfileData';
import { initialsFromName } from '../teacherProfile.utils';

interface TeacherProfileHeaderProps {
  model: TeacherProfileDataModel;
}

export function TeacherProfileHeader({ model }: TeacherProfileHeaderProps) {
  return (
    <section className="relative mb-8 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-[#1152d4]/5">
      <div className="h-40 bg-[#d7e2f5] md:h-48" />
      <div className="px-6 pb-6 md:px-8 md:pb-8">
        <div className="-mt-14 flex flex-col gap-5 md:-mt-16 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
            <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg sm:h-40 sm:w-40">
              {model.profileAvatar ? (
                <ImageWithFallback
                  alt={model.teacherName}
                  className="h-full w-full object-cover"
                  src={model.profileAvatar}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#1152d4]/12 text-5xl font-bold text-[#1152d4]">
                  {initialsFromName(model.teacherName)}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-4 border-white bg-emerald-500" />
            </div>
            <div className="pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[2.2rem] font-bold leading-none tracking-tight text-slate-900 sm:text-[2.4rem]">
                  {model.teacherName}
                </h1>
                <Verified className="h-5 w-5 shrink-0 text-[#1152d4]" />
              </div>
              <p className="mt-1.5 text-[1.125rem] font-medium text-slate-600">{model.teacherRole}</p>
              <p className="mt-1.5 flex items-center gap-2 text-sm text-slate-400">
                <MapPin className="h-4 w-4 shrink-0" />
                {model.profileMetaLine}
              </p>
            </div>
          </div>

          {!model.ownProfileIsTeacher ? (
            <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto md:pb-1">
              <button
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-100 px-6 py-3 text-base font-semibold text-slate-800 transition hover:bg-slate-200"
                onClick={() => model.setIsFollowing((value) => !value)}
                type="button"
              >
                <UserPlus className="h-4 w-4" />
                {model.isFollowing ? 'Following' : 'Follow'}
              </button>
              <button
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1152d4] px-6 py-3 text-base font-semibold text-white shadow-lg shadow-[#1152d4]/20 transition hover:bg-[#0f47b9]"
                type="button"
              >
                <Mail className="h-4 w-4" />
                Message
              </button>
            </div>
          ) : (
            <div className="inline-flex items-center rounded-full border border-[#1152d4]/25 bg-[#1152d4]/10 px-6 py-3 text-sm font-semibold text-[#1152d4] md:mb-1">
              This is your public instructor profile preview.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
