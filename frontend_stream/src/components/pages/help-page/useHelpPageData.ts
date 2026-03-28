import { useCallback, useMemo, useState, type FormEvent } from 'react';
import {
  useGetHelpCenterContentQuery,
  useSubscribeToNewsletterMutation,
  type HelpCenterCategory,
} from '../../../store/api/publicSupportApi';
import type { HelpPageDataModel } from './help.types';
import { matchesSearch } from './help.utils';

interface UseHelpPageDataArgs {
  onNavigate: (path: string) => void;
}

export function useHelpPageData({ onNavigate }: UseHelpPageDataArgs): HelpPageDataModel {
  const [searchTerm, setSearchTerm] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterFeedback, setNewsletterFeedback] = useState<string | null>(null);
  const [newsletterError, setNewsletterError] = useState<string | null>(null);

  const { data, isError, isLoading } = useGetHelpCenterContentQuery();
  const [subscribeToNewsletter, { isLoading: isSubscribing }] =
    useSubscribeToNewsletterMutation();

  const categories = data?.categories ?? [];
  const faqs = data?.faqs ?? [];
  const supportEmail = data?.supportEmail || 'support@edupremium.com';
  const responseWindow = data?.responseWindow || 'within 24 hours';
  const resolutionRate = data?.resolutionRate ?? 98;

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) {
      return categories;
    }
    return categories.filter(
      (category) =>
        matchesSearch(category.title, searchTerm) ||
        matchesSearch(category.description, searchTerm),
    );
  }, [categories, searchTerm]);

  const filteredFaqs = useMemo(() => {
    if (!searchTerm.trim()) {
      return faqs;
    }
    return faqs.filter(
      (faq) => matchesSearch(faq.question, searchTerm) || matchesSearch(faq.answer, searchTerm),
    );
  }, [faqs, searchTerm]);

  const onCategoryAction = useCallback(
    (category: HelpCenterCategory) => {
      if (category.actionType === 'navigate' && category.actionValue) {
        onNavigate(category.actionValue);
        return;
      }
      const targetId = category.actionValue.replace('#', '');
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    [onNavigate],
  );

  const onNewsletterSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const email = newsletterEmail.trim();
      if (!email || !email.includes('@')) {
        setNewsletterFeedback(null);
        setNewsletterError('Please enter a valid email.');
        return;
      }

      try {
        const result = await subscribeToNewsletter({
          email,
          sourcePage: 'HELP_PAGE',
        }).unwrap();
        setNewsletterError(null);
        setNewsletterFeedback(result.message || 'Subscription successful.');
        setNewsletterEmail('');
      } catch {
        setNewsletterFeedback(null);
        setNewsletterError('Unable to subscribe right now.');
      }
    },
    [newsletterEmail, subscribeToNewsletter],
  );

  return {
    searchTerm,
    newsletterEmail,
    newsletterFeedback,
    newsletterError,
    isLoading,
    isError,
    isSubscribing,
    categories,
    filteredCategories,
    filteredFaqs,
    supportEmail,
    responseWindow,
    resolutionRate,
    onSearchChange: setSearchTerm,
    onNewsletterEmailChange: setNewsletterEmail,
    onNewsletterSubmit,
    onCategoryAction,
  };
}
