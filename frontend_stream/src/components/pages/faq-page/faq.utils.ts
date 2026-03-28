import type { FAQItem } from './faq.types';

export function filterFaqItems(
  faqs: FAQItem[],
  selectedCategory: string,
  searchTerm: string,
): FAQItem[] {
  const normalizedSearch = searchTerm.trim().toLowerCase();
  return faqs.filter((faq) => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    if (!normalizedSearch) return matchesCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(normalizedSearch) ||
      faq.answer.toLowerCase().includes(normalizedSearch);
    return matchesCategory && matchesSearch;
  });
}
