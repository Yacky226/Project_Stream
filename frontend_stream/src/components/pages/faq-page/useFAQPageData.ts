import { useMemo, useState } from 'react';
import { FAQ_CATEGORIES, FAQ_ITEMS } from './faq.data';
import type { FAQPageDataModel } from './faq.types';
import { filterFaqItems } from './faq.utils';

export function useFAQPageData(): FAQPageDataModel {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredFaqs = useMemo(
    () => filterFaqItems(FAQ_ITEMS, selectedCategory, searchTerm),
    [searchTerm, selectedCategory],
  );

  return {
    searchTerm,
    selectedCategory,
    categories: FAQ_CATEGORIES,
    filteredFaqs,
    setSearchTerm,
    setSelectedCategory,
    resetFilters: () => {
      setSearchTerm('');
      setSelectedCategory('all');
    },
  };
}
