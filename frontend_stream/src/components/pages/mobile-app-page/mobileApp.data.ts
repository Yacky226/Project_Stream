import { Bell, Download, RefreshCw, Zap } from 'lucide-react';
import type { MobileAppFeature, MobileAppTestimonial } from './mobileApp.types';

export const MOBILE_APP_HERO_MOCKUP =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBluSMxEDcMsws6jNDKnIb92UMTI9nRyViOL3kRUTEUxdM9NuENEz5fdqwSvjvdaXg80qaiPqbDhx1HXu9X7_oEP-hwNBgyppjSgf3tSuXaFtSXO9olgnw-ETQDKU6Cwkgzj3C36SEGvFHGsmJumHkbbOA2Ca3d1zeUuDza_2SV-CwXVe058lgf9WBnMVFxFZ0BY1LRGXQnsJ5kTk1ibul1cu8603TlawnlZ1gxgXVbONJUZEPvwjFb4JnqqePt5BuSUF4uVDya7j4';

export const MOBILE_APP_TESTIMONIALS: MobileAppTestimonial[] = [
  {
    name: 'Sarah Jenkins',
    role: 'Marketing Executive',
    quote:
      'The EduElevate mobile app is a game changer. The interface is elegant and offline mode helps me learn during commutes.',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCH4q4Gje1l3F6TlTKpKiuShQvPs_Ys7wt1DexYdZqGFiHkGHmyyNiVV7z2NbmCL-d_wNRxcjY3O5Ux7oyFnJPZZEIJxSKKtsRp9TLS99ej738OlONuM_pLw21ls6WbYyINqInKC_xp7Z6Yq3X7YE_-HOaV15LwH7BtkaghaHR8GfK6hHXK6jpcgaqlvqPDn1iBRjc3uoqI55nYaPiuVwXC_qnEDtrDbRQ8vK2JG1bnuh06lm8IREaNDMW_GeXE97zoQXNStPkSlHs',
  },
  {
    name: 'David Chen',
    role: 'Software Engineer',
    quote:
      'The micro-learning format fits my schedule perfectly. I can keep momentum even during busy weeks.',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAwAXTpD-B3PU4C8du7_1ZUFmTFItHyhNAqTFHO62PssArt9ELFBJ6zekSvTjs24-tqC5W-klD-3PKVCijcdTrPzyp4_nt01GZpF9PRIc4qis_RqlJ-zIk794yd-bPoNQ7sM-r6kdlpcOxgNZrj5o28s1erJieU9I64p_PUkLGJbgWj5vtk4_IzVzvlhQeztoAqQgruSabqfjKJ0ERGqXCn8QuKc2zQ3JwCbG3ZMsXYjY2MFAj9IK3eafwmemDa1jGSXkVkLz_w_7M',
  },
  {
    name: 'Elena Rodriguez',
    role: 'Graphic Designer',
    quote:
      'Video quality is great even on limited bandwidth, and offline download makes learning addictive.',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDjSXLVZHt9t7PbulPb4jKy90-lro-1eK2S1_cH392iALGLd347Yl25ii1lBd6W742ybZfHbgG3MLo6WasgbNHbSnzTShoBv61rx5_dTm60qAGUe9y1auDhasvmittWApkUn0eUsHH9O47Ot315yDyWrFz5sLE2IJt0j-T0ZnIR_IFsYAVIwdYPL9K2Nk1cxk-R5YpW2wwsdRsoWK-V-Az5q2RVoFLmB8wHta3333jKyu1KFPzdLdJr_VHX_tSC-4EKIKTUr9X3DAI',
  },
];

export const MOBILE_APP_FEATURES: MobileAppFeature[] = [
  { icon: Download, title: 'Offline Access', desc: 'Download courses and learn without internet.' },
  { icon: Zap, title: 'Micro-learning', desc: 'Short lessons designed for retention.' },
  { icon: RefreshCw, title: 'Progress Syncing', desc: 'Continue across phone, tablet and desktop.' },
  { icon: Bell, title: 'Smart Reminders', desc: 'Personalized nudges to keep your streak alive.' },
];
