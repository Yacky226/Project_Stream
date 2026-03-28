import { GraduationCap, Mail, Share2 } from 'lucide-react';

interface TeacherProfileFooterProps {
  onNavigate: (path: string) => void;
}

export function TeacherProfileFooter({ onNavigate }: TeacherProfileFooterProps) {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white px-6 py-12 lg:px-20">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
        <div className="flex items-center gap-2 text-[#1152d4] opacity-60">
          <GraduationCap className="h-6 w-6" />
          <span className="font-bold text-slate-900">EduPremium</span>
        </div>
        <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-slate-500">
          <button className="hover:text-[#1152d4]" onClick={() => onNavigate('/blog')} type="button">
            About Us
          </button>
          <button className="hover:text-[#1152d4]" onClick={() => onNavigate('/careers')} type="button">
            Careers
          </button>
          <button className="hover:text-[#1152d4]" onClick={() => onNavigate('/privacy')} type="button">
            Privacy Policy
          </button>
          <button className="hover:text-[#1152d4]" onClick={() => onNavigate('/terms')} type="button">
            Terms of Service
          </button>
        </div>
        <div className="flex gap-4">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all hover:bg-[#1152d4] hover:text-white"
            type="button"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all hover:bg-[#1152d4] hover:text-white"
            type="button"
          >
            <Mail className="h-4 w-4" />
          </button>
        </div>
      </div>
      <p className="mt-12 text-center text-xs text-slate-400">
        Copyright {new Date().getFullYear()} EduPremium E-Learning Platform. All rights reserved.
      </p>
    </footer>
  );
}
