import { Globe, Link as LinkIcon, Mail, Share2, User, Zap } from 'lucide-react';
import type { TeacherProfileDataModel } from '../useTeacherProfileData';

interface TeacherProfileSidebarProps {
  model: TeacherProfileDataModel;
}

export function TeacherProfileSidebar({ model }: TeacherProfileSidebarProps) {
  return (
    <aside className="space-y-10 lg:col-span-4">
      <section>
        <h3 className="mb-4 flex items-center gap-2 text-4xl font-bold tracking-tight text-slate-900">
          <User className="h-5 w-5 text-[#1152d4]" />
          About Me
        </h3>
        <p className="text-lg leading-9 text-slate-600">{model.aboutCopy}</p>
      </section>

      <section>
        <h3 className="mb-4 flex items-center gap-2 text-4xl font-bold tracking-tight text-slate-900">
          <Zap className="h-5 w-5 text-[#1152d4]" />
          Expertise
        </h3>
        <div className="flex flex-wrap gap-2">
          {model.expertise.length > 0 ? (
            model.expertise.map((item) => (
              <span
                className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-base font-medium text-slate-700"
                key={item}
              >
                {item}
              </span>
            ))
          ) : (
            <span className="text-base text-slate-500">No declared expertise yet.</span>
          )}
        </div>
      </section>

      <section>
        <h3 className="mb-4 flex items-center gap-2 text-4xl font-bold tracking-tight text-slate-900">
          <Share2 className="h-5 w-5 text-[#1152d4]" />
          Social Presence
        </h3>
        <div className="space-y-4 text-lg text-slate-600">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-slate-500" />
            <span>{model.socialProfilePath}</span>
          </div>
          <div className="flex items-center gap-3">
            <LinkIcon className="h-5 w-5 text-slate-500" />
            <span>{model.socialCourseLinkLabel}</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-slate-500" />
            <span>{model.socialEmailValue}</span>
          </div>
        </div>
      </section>
    </aside>
  );
}
