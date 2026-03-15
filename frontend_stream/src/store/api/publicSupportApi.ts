import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from './apiClient';

export type ContactSubjectValue =
  | 'GENERAL_INQUIRY'
  | 'COURSE_ADMISSIONS'
  | 'TECHNICAL_SUPPORT'
  | 'PARTNERSHIP_OPPORTUNITIES'
  | 'OTHER';

export interface HelpCenterCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  actionType: 'navigate' | 'scroll';
  actionValue: string;
}

export interface HelpCenterFaq {
  id: string;
  question: string;
  answer: string;
  categoryId: string;
}

export interface HelpCenterContent {
  categories: HelpCenterCategory[];
  faqs: HelpCenterFaq[];
  supportEmail: string;
  responseWindow: string;
  resolutionRate: number;
}

export interface ContactRequestPayload {
  fullName: string;
  email: string;
  subject: ContactSubjectValue;
  message: string;
  sourcePage?: string;
}

export interface ContactRequestResponse {
  id: number;
  email: string;
  subject: ContactSubjectValue;
  subjectLabel: string;
  status: string;
  createdAt: string;
}

export interface NewsletterSubscriptionPayload {
  email: string;
  sourcePage?: string;
}

export interface NewsletterSubscriptionResponse {
  email: string;
  active: boolean;
  reactivated: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BackendApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

interface MutationResult<T> {
  message: string;
  data: T;
}

export const publicSupportApi = createApi({
  reducerPath: 'publicSupportApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      headers.set('Accept', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['HelpCenter'],
  endpoints: (builder) => ({
    getHelpCenterContent: builder.query<HelpCenterContent, void>({
      query: () => '/api/public/support/help-center',
      transformResponse: (response: BackendApiResponse<HelpCenterContent>): HelpCenterContent =>
        response.data,
      providesTags: ['HelpCenter'],
    }),

    submitContactRequest: builder.mutation<MutationResult<ContactRequestResponse>, ContactRequestPayload>({
      query: (body) => ({
        url: '/api/public/support/contact',
        method: 'POST',
        body,
      }),
      transformResponse: (
        response: BackendApiResponse<ContactRequestResponse>,
      ): MutationResult<ContactRequestResponse> => ({
        message: response.message,
        data: response.data,
      }),
    }),

    subscribeToNewsletter: builder.mutation<
      MutationResult<NewsletterSubscriptionResponse>,
      NewsletterSubscriptionPayload
    >({
      query: (body) => ({
        url: '/api/public/support/newsletter',
        method: 'POST',
        body,
      }),
      transformResponse: (
        response: BackendApiResponse<NewsletterSubscriptionResponse>,
      ): MutationResult<NewsletterSubscriptionResponse> => ({
        message: response.message,
        data: response.data,
      }),
    }),
  }),
});

export const {
  useGetHelpCenterContentQuery,
  useSubmitContactRequestMutation,
  useSubscribeToNewsletterMutation,
} = publicSupportApi;
