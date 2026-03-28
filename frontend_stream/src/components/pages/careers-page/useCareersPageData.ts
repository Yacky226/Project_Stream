import { type FormEvent, useMemo, useState } from 'react';
import { useSubscribeToNewsletterMutation } from '../../../store/api/publicSupportApi';
import { CAREERS_JOB_ROLES, CAREERS_VALUE_CARDS } from './careers.data';
import type {
  CareersDepartment,
  CareersLocation,
  CareersPageDataModel,
} from './careers.types';
import { filterJobRoles } from './careers.utils';

export function useCareersPageData(): CareersPageDataModel {
  const [selectedDepartment, setSelectedDepartment] = useState<'All' | CareersDepartment>('All');
  const [selectedLocation, setSelectedLocation] = useState<'All' | CareersLocation>('All');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterFeedback, setNewsletterFeedback] = useState<string | null>(null);

  const [subscribeToNewsletter, { isLoading: isSubscribing }] = useSubscribeToNewsletterMutation();

  const filteredRoles = useMemo(
    () => filterJobRoles(CAREERS_JOB_ROLES, selectedDepartment, selectedLocation),
    [selectedDepartment, selectedLocation],
  );

  const onNewsletterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newsletterEmail.trim()) {
      setNewsletterFeedback('Please provide a valid email address.');
      return;
    }
    setNewsletterFeedback(null);
    try {
      const response = await subscribeToNewsletter({
        email: newsletterEmail.trim(),
        sourcePage: 'careers',
      }).unwrap();
      setNewsletterFeedback(response.message || 'Subscription successful.');
      setNewsletterEmail('');
    } catch (error) {
      const payload = error as { data?: { message?: string; error?: string } };
      setNewsletterFeedback(
        payload?.data?.message || payload?.data?.error || 'Unable to subscribe right now.',
      );
    }
  };

  return {
    selectedDepartment,
    selectedLocation,
    newsletterEmail,
    newsletterFeedback,
    isSubscribing,
    valueCards: CAREERS_VALUE_CARDS,
    filteredRoles,
    onDepartmentChange: setSelectedDepartment,
    onLocationChange: setSelectedLocation,
    onNewsletterEmailChange: setNewsletterEmail,
    onNewsletterSubmit,
  };
}
