export interface ChatbotThemeTokens {
  panelClass: string;
  headerClass: string;
  mutedTextClass: string;
  messageAreaClass: string;
  assistantBubbleClass: string;
  userBubbleClass: string;
  composerClass: string;
  typedDotsClass: string;
  quickActionClass: string;
  ghostButtonClass: string;
}

export function getChatbotThemeTokens(isDark: boolean): ChatbotThemeTokens {
  return {
    panelClass: isDark
      ? 'border-[#1152d4]/25 bg-slate-900/95 text-slate-100 shadow-[0_36px_76px_-30px_rgba(2,8,23,0.95)]'
      : 'border-[#1152d4]/15 bg-white/95 text-slate-900 shadow-[0_34px_72px_-28px_rgba(17,82,212,0.42)]',
    headerClass: isDark
      ? 'border-[#1152d4]/20 bg-slate-900/84 backdrop-blur-xl'
      : 'border-[#1152d4]/10 bg-white/86 backdrop-blur-xl',
    mutedTextClass: isDark ? 'text-slate-400' : 'text-slate-500',
    messageAreaClass: isDark
      ? 'bg-[linear-gradient(180deg,rgba(15,23,42,0.55)_0%,rgba(2,6,23,0.65)_100%)]'
      : 'bg-[linear-gradient(180deg,rgba(248,251,255,0.92)_0%,rgba(241,247,255,0.94)_100%)]',
    assistantBubbleClass: isDark
      ? 'rounded-2xl rounded-tl-none border border-slate-700/70 bg-slate-800 text-slate-100'
      : 'rounded-2xl rounded-tl-none border border-slate-200 bg-white text-slate-700',
    userBubbleClass: isDark
      ? 'rounded-2xl rounded-tr-none bg-[#1152d4] text-white shadow-[0_12px_24px_-14px_rgba(17,82,212,0.9)]'
      : 'rounded-2xl rounded-tr-none bg-[#1152d4] text-white shadow-[0_12px_24px_-14px_rgba(17,82,212,0.7)]',
    composerClass: isDark
      ? 'bg-slate-800/55 border-transparent focus-within:ring-[#1152d4]/35'
      : 'bg-slate-50 border-transparent focus-within:ring-[#1152d4]/26',
    typedDotsClass: isDark ? 'bg-slate-300/80' : 'bg-slate-500/60',
    quickActionClass: isDark
      ? 'border-[#1152d4]/35 bg-[#1152d4]/12 text-blue-100 hover:bg-[#1152d4] hover:text-white'
      : 'border-[#1152d4]/20 bg-[#1152d4]/5 text-[#1152d4] hover:bg-[#1152d4] hover:text-white',
    ghostButtonClass: isDark
      ? 'border-slate-700/80 bg-slate-800/75 text-slate-300 hover:bg-slate-700 hover:text-white'
      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  };
}
