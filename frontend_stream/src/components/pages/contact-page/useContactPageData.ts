import { useState, type FormEvent } from 'react';
import {
  useGetHelpCenterContentQuery,
  useSubmitContactRequestMutation,
} from '../../../store/api/publicSupportApi';
import {
  CONTACT_MAP_IMAGE_URL,
  CONTACT_OFFICE_ADDRESS_LINES,
  CONTACT_SOCIAL_LINKS,
  CONTACT_SUBJECT_OPTIONS,
} from './contact.data';
import type { ContactFormState, ContactPageDataModel } from './contact.types';

const INITIAL_FORM_STATE: ContactFormState = {
  email: '',
  fullName: '',
  message: '',
  subject: 'GENERAL_INQUIRY',
};

export function useContactPageData(): ContactPageDataModel {
  const [formState, setFormState] = useState<ContactFormState>(INITIAL_FORM_STATE);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: helpCenterContent } = useGetHelpCenterContentQuery();
  const [submitContactRequest, { isLoading: isSubmitting }] = useSubmitContactRequestMutation();

  const supportEmail = helpCenterContent?.supportEmail || 'hello@edupremium.edu';
  const responseWindow = helpCenterContent?.responseWindow || 'within 24 hours';

  const onFieldChange = <K extends keyof ContactFormState>(key: K, value: ContactFormState[K]) => {
    setFormState((previous) => ({ ...previous, [key]: value }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const fullName = formState.fullName.trim();
    const email = formState.email.trim();
    const message = formState.message.trim();

    if (!fullName || !email || !message) {
      setFeedback(null);
      setError('Please fill in all required fields.');
      return;
    }

    try {
      const result = await submitContactRequest({
        email,
        fullName,
        message,
        sourcePage: 'CONTACT_PAGE',
        subject: formState.subject,
      }).unwrap();

      setError(null);
      setFeedback(result.message || 'Your message has been sent successfully.');
      setFormState(INITIAL_FORM_STATE);
    } catch {
      setFeedback(null);
      setError('Unable to send your message at the moment. Please try again.');
    }
  };

  return {
    formState,
    feedback,
    error,
    isSubmitting,
    supportEmail,
    responseWindow,
    subjectOptions: CONTACT_SUBJECT_OPTIONS,
    socialLinks: CONTACT_SOCIAL_LINKS,
    officeAddressLines: CONTACT_OFFICE_ADDRESS_LINES,
    mapImageUrl: CONTACT_MAP_IMAGE_URL,
    onFieldChange,
    onSubmit,
  };
}
