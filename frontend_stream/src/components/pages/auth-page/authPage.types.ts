export type SignupRole = 'student' | 'teacher';

export interface AuthPageReduxProps {
  mode: 'signin' | 'signup' | 'forgot';
  onNavigate: (path: string) => void;
  defaultSignupRole?: SignupRole;
}

export interface AuthFormState {
  acceptTerms: boolean;
  confirmPassword: string;
  dateNaissance: string;
  email: string;
  firstName: string;
  lastName: string;
  niveau: string;
  password: string;
  rememberMe: boolean;
  specialite: string;
}
