import type { LiveCourseDetails } from '../../../types/live';

export function toReviewStars(value: number | null | undefined): number {
  const normalized = Number.isFinite(value) ? Number(value) : 0;
  return Math.max(1, Math.min(5, Math.round(normalized || 0)));
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = Number(value.replace(',', '.').trim());
    if (Number.isFinite(normalized)) {
      return normalized;
    }
  }

  return null;
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function toCourseBadge(index: number): string | null {
  if (index === 0) return 'BEST SELLER';
  if (index === 1) return 'NEW';
  return null;
}

export function toCourseLevelLabel(course: LiveCourseDetails, index: number): string {
  const rawLevel = course.metadata?.level?.trim().toLowerCase() || '';
  if (rawLevel.includes('expert') || rawLevel.includes('advanced') || rawLevel.includes('avance')) {
    return 'Expert Level';
  }
  if (rawLevel.includes('intermediate') || rawLevel.includes('intermediaire')) {
    return 'Intermediate Level';
  }
  if (rawLevel.includes('beginner') || rawLevel.includes('debutant')) {
    return 'Beginner Level';
  }
  if (rawLevel.includes('all')) {
    return 'All Levels';
  }

  const fallbackLevels = ['Expert Level', 'Intermediate Level', 'All Levels'];
  return fallbackLevels[index] || fallbackLevels[fallbackLevels.length - 1];
}

export function toCourseCompletionRate(course: LiveCourseDetails, index: number): number {
  const metadata = (course.metadata || {}) as Record<string, unknown>;
  const metadataRate =
    toNumber(metadata.completionRate) ??
    toNumber(metadata.completionPercent) ??
    toNumber(metadata.completion) ??
    toNumber(metadata.completion_rate);

  if (metadataRate !== null) {
    return clampPercent(metadataRate);
  }

  if (course.reviewCount > 0 && course.enrolledCount > 0) {
    return clampPercent((course.reviewCount / course.enrolledCount) * 100);
  }

  if (typeof course.averageRating === 'number') {
    return clampPercent((course.averageRating / 5) * 100);
  }

  const fallbackRates = [85, 70, 92];
  return fallbackRates[index] || fallbackRates[fallbackRates.length - 1];
}

export function toCoursePriceLabel(course: LiveCourseDetails, index: number): string {
  const metadata = (course.metadata || {}) as Record<string, unknown>;
  const discountedPrice = toNumber(metadata.discountedPrice);
  const regularPrice = toNumber(metadata.regularPrice);
  const selectedPrice = discountedPrice ?? regularPrice;

  if (selectedPrice !== null && selectedPrice >= 0) {
    const rawCurrency = typeof metadata.currency === 'string' ? metadata.currency.trim().toUpperCase() : '';
    const currency = rawCurrency || 'USD';

    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(selectedPrice);
    } catch {
      return `$${selectedPrice.toFixed(2)}`;
    }
  }

  const fallbackPrices = [199, 149, 179];
  const fallbackPrice = fallbackPrices[index] || fallbackPrices[fallbackPrices.length - 1];
  return `$${fallbackPrice.toFixed(2)}`;
}

export function toCourseRatingLabel(course: LiveCourseDetails, index: number): string {
  if (typeof course.averageRating === 'number') {
    return course.averageRating.toFixed(1);
  }

  const fallbackRatings = ['4.9', '4.8', '5.0'];
  return fallbackRatings[index] || fallbackRatings[fallbackRatings.length - 1];
}

export function buildCourseUrl(courseId: string): string {
  return `/courses/${courseId}`;
}
