import { useMemo, useState } from 'react';
import {
  PRIVACY_CONTACT_ADDRESS_LINES,
  PRIVACY_DATA_COLLECTION_HIGHLIGHTS,
  PRIVACY_POLICY_SECTIONS,
  PRIVACY_RIGHTS_HIGHLIGHTS,
  PRIVACY_SIDEBAR_ITEMS,
} from './privacy.data';
import type { PrivacyPageDataModel } from './privacy.types';

export function usePrivacyPageData(): PrivacyPageDataModel {
  const [activeSection, setActiveSection] = useState('introduction');

  const lastUpdated = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
  }, []);

  const onJumpToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const target = document.getElementById(sectionId);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return {
    activeSection,
    lastUpdated,
    sections: PRIVACY_POLICY_SECTIONS,
    sidebarItems: PRIVACY_SIDEBAR_ITEMS,
    dataCollectionHighlights: PRIVACY_DATA_COLLECTION_HIGHLIGHTS,
    rightsHighlights: PRIVACY_RIGHTS_HIGHLIGHTS,
    contactAddressLines: PRIVACY_CONTACT_ADDRESS_LINES,
    onJumpToSection,
  };
}
