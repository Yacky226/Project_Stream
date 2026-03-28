import {
  BarChart3,
  Bell,
  CalendarDays,
  Camera,
  CreditCard,
  HelpCircle,
  Link as LinkIcon,
  Mail,
  MapPin,
  Shield,
  User,
} from "lucide-react";
import { ImageWithFallback } from "../../../figma/ImageWithFallback";
import type { ProfilePageDataModel } from "../useProfilePageData";

interface RoleProfileBodyProps {
  model: ProfilePageDataModel;
  onNavigate: (path: string | number) => void;
  surfaceClass: string;
}

export function RoleProfileBody({ model, onNavigate, surfaceClass }: RoleProfileBodyProps) {
  const {
    role,
    initials,
    avatarUrl,
    fullName,
    roleSubtitle,
    profileLocation,
    joinedOn,
    profilePublicPath,
    profile,
    profileBio,
    roleDashboardPath,
    roleProfileStrength,
    roleProfileHint,
  } = model;

  return (
    role === 'teacher' || role === 'student' ? (
      <div className="app-profile-page profile-settings-layout mx-auto w-full max-w-5xl space-y-8">
        <section className={`profile-settings-toolbar p-4 ${surfaceClass}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="inline-flex items-center justify-center rounded-xl bg-[#1152d4] text-white"
                style={{ width: '38px', height: '38px' }}
              >
                <User className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                User Profile &amp; Settings
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-[#1152d4]/10 hover:text-[#1152d4] dark:bg-slate-800 dark:text-slate-300"
                style={{ width: '40px', height: '40px' }}
                onClick={() => onNavigate('/notifications')}
                type="button"
              >
                <Bell className="h-5 w-5" />
              </button>
              <button
                className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-[#1152d4]/10 hover:text-[#1152d4] dark:bg-slate-800 dark:text-slate-300"
                style={{ width: '40px', height: '40px' }}
                onClick={() => onNavigate('/help')}
                type="button"
              >
                <HelpCircle className="h-5 w-5" />
              </button>
              <div
                className="flex items-center justify-center rounded-full border border-[#1152d4]/30 bg-[#1152d4]/10 text-xs font-bold text-[#1152d4]"
                style={{ width: '40px', height: '40px' }}
              >
                {initials}
              </div>
            </div>
          </div>
        </section>

        <section className={`profile-settings-hero p-6 ${surfaceClass}`}>
          <div className="flex flex-wrap items-center gap-6">
            <div className="relative shrink-0" style={{ width: '128px', height: '128px' }}>
              <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-lg dark:border-slate-800 dark:bg-slate-800">
                {avatarUrl ? (
                  <ImageWithFallback
                    alt={fullName}
                    className="h-full w-full object-cover"
                    src={avatarUrl}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#1152d4]/10 text-2xl font-bold text-[#1152d4]">
                    {initials}
                  </div>
                )}
              </div>
              <button
                className="absolute bottom-0 right-0 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[#1152d4] text-white shadow-lg transition hover:scale-105 dark:border-slate-900"
                onClick={() => onNavigate('/settings')}
                type="button"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            <div className="min-w-0 flex-1 text-left">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{fullName}</h1>
              <p className="font-medium text-slate-500 dark:text-slate-300">{roleSubtitle}</p>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {profileLocation}
                </span>
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  Joined {joinedOn}
                </span>
              </div>
            </div>

            <div className="ml-auto flex shrink-0 flex-col gap-2" style={{ width: '260px', maxWidth: '100%' }}>
              <button
                className={`inline-flex w-full items-center justify-center rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-all ${
                  profilePublicPath
                    ? 'cursor-pointer bg-[#1152d4] shadow-md shadow-[#1152d4]/20 hover:bg-[#0f47b9]'
                    : 'cursor-not-allowed bg-slate-400/60'
                }`}
                disabled={!profilePublicPath}
                onClick={() => {
                  if (profilePublicPath) {
                    onNavigate(profilePublicPath);
                  }
                }}
                type="button"
              >
                View Public Profile
              </button>
              <button
                className="inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-slate-100 px-6 py-2.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                onClick={() => onNavigate('/settings')}
                type="button"
              >
                Export Data
              </button>
            </div>
          </div>
        </section>

        <div className="profile-settings-tabs-wrap overflow-x-auto">
          <nav className="profile-settings-tabs flex min-w-max border-b border-slate-200 dark:border-slate-800">
            <button className="inline-flex cursor-pointer items-center gap-2 border-b-2 border-[#1152d4] px-6 py-4 text-sm font-semibold text-[#1152d4]" type="button">
              <User className="h-4 w-4" />
              Personal Info
            </button>
            <button className="inline-flex cursor-pointer items-center gap-2 border-b-2 border-transparent px-6 py-4 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200" type="button">
              <Shield className="h-4 w-4" />
              Security
            </button>
            <button className="inline-flex cursor-pointer items-center gap-2 border-b-2 border-transparent px-6 py-4 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200" type="button">
              <CreditCard className="h-4 w-4" />
              Billing
            </button>
            <button className="inline-flex cursor-pointer items-center gap-2 border-b-2 border-transparent px-6 py-4 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200" type="button">
              <Bell className="h-4 w-4" />
              Notifications
            </button>
          </nav>
        </div>

        <div className="profile-settings-main-grid grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="profile-settings-main space-y-8 lg:col-span-2">
            <section className={`profile-settings-card p-6 ${surfaceClass}`}>
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
                <User className="h-5 w-5 text-[#1152d4]" />
                Basic Details
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name</label>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 transition focus:border-[#1152d4] focus:outline-none focus:ring-2 focus:ring-[#1152d4]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    defaultValue={profile?.firstName || ''}
                    readOnly
                    type="text"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</label>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 transition focus:border-[#1152d4] focus:outline-none focus:ring-2 focus:ring-[#1152d4]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    defaultValue={profile?.lastName || ''}
                    readOnly
                    type="text"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                  <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
                    <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                    <input
                      className="w-full border-0 bg-transparent text-slate-800 outline-none dark:text-slate-100"
                      defaultValue={profile?.email || ''}
                      readOnly
                      style={{ marginLeft: '10px' }}
                      type="email"
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Bio</label>
                  <textarea
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 transition focus:border-[#1152d4] focus:outline-none focus:ring-2 focus:ring-[#1152d4]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    defaultValue={profileBio}
                    readOnly
                    rows={4}
                  />
                  <p className="text-xs text-slate-400">Profile fields are currently synced from backend profile settings.</p>
                </div>
              </div>
            </section>

            <section className={`profile-settings-card p-6 ${surfaceClass}`}>
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
                <LinkIcon className="h-5 w-5 text-[#1152d4]" />
                Social Connections
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Twitter / X', placeholder: '@username' },
                  { label: 'LinkedIn', placeholder: 'linkedin.com/in/your-name' },
                  { label: 'Personal Website', placeholder: 'https://your-portfolio.com' },
                ].map((field) => (
                  <div className="flex items-center gap-4" key={field.label}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                      <LinkIcon className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{field.label}</label>
                      <input
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-slate-700 transition focus:border-[#1152d4] focus:outline-none focus:ring-2 focus:ring-[#1152d4]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        defaultValue=""
                        placeholder={field.placeholder}
                        readOnly
                        type="text"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="flex justify-end gap-4 pb-6">
              <button
                className="cursor-pointer rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                onClick={() => onNavigate(roleDashboardPath)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="cursor-pointer rounded-xl bg-[#1152d4] px-8 py-3 text-sm font-bold text-white shadow-lg shadow-[#1152d4]/20 transition-all hover:bg-[#0f47b9]"
                onClick={() => onNavigate('/settings')}
                type="button"
              >
                Save Changes
              </button>
            </div>
          </div>

          <aside className="profile-settings-side space-y-6">
            <div className="profile-strength-card rounded-xl border border-[#1152d4]/20 bg-[#1152d4]/5 p-6 dark:bg-[#1152d4]/10">
              <h4 className="mb-4 flex items-center gap-2 font-bold text-[#1152d4]">
                <BarChart3 className="h-4 w-4" />
                Profile Strength
              </h4>
              <div className="mb-4 h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-800">
                <div className="h-2.5 rounded-full bg-[#1152d4]" style={{ width: `${roleProfileStrength}%` }} />
              </div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                {roleProfileStrength}% complete
              </p>
              <p className="mb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {roleProfileHint}
              </p>
              <button
                className="cursor-pointer text-sm font-bold text-[#1152d4] hover:underline"
                onClick={() => onNavigate('/settings')}
                type="button"
              >
                Complete now
              </button>
            </div>

            <div className={`profile-privacy-card rounded-xl p-6 ${surfaceClass}`}>
              <h4 className="mb-4 font-bold text-slate-900 dark:text-slate-100">Privacy</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Public Profile</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Allow users to find you</p>
                  </div>
                  <button
                    className="relative cursor-pointer rounded-full bg-[#1152d4]"
                    style={{ width: '44px', height: '24px' }}
                    type="button"
                  >
                    <span
                      className="absolute rounded-full bg-white shadow-sm"
                      style={{ width: '18px', height: '18px', top: '3px', left: '23px' }}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Show Activity</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Share what you&apos;re up to</p>
                  </div>
                  <button
                    className="relative cursor-pointer rounded-full bg-slate-300 dark:bg-slate-700"
                    style={{ width: '44px', height: '24px' }}
                    type="button"
                  >
                    <span
                      className="absolute rounded-full bg-white shadow-sm"
                      style={{ width: '18px', height: '18px', top: '3px', left: '3px' }}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="profile-help-card relative overflow-hidden rounded-xl bg-slate-900 p-6 text-white">
              <div className="relative z-10">
                <h4 className="mb-2 font-bold">Need Help?</h4>
                <p className="mb-4 text-xs text-slate-300">
                  Our support team is available to help you with your profile settings.
                </p>
                <button
                  className="w-full cursor-pointer rounded-lg bg-white py-2 text-sm font-bold text-slate-900 transition-colors hover:bg-slate-100"
                  onClick={() => onNavigate('/contact')}
                  type="button"
                >
                  Contact Support
                </button>
              </div>
              <div className="pointer-events-none absolute -bottom-5 -right-4 opacity-10">
                <HelpCircle className="h-20 w-20" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    ) : null
  );
}
