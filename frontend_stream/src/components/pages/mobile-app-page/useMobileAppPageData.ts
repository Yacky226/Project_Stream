import {
  MOBILE_APP_FEATURES,
  MOBILE_APP_HERO_MOCKUP,
  MOBILE_APP_TESTIMONIALS,
} from './mobileApp.data';
import type { MobileAppPageDataModel } from './mobileApp.types';

export function useMobileAppPageData(): MobileAppPageDataModel {
  return {
    heroMockup: MOBILE_APP_HERO_MOCKUP,
    testimonials: MOBILE_APP_TESTIMONIALS,
    features: MOBILE_APP_FEATURES,
  };
}
