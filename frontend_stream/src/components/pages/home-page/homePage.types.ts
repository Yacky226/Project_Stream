export interface HomePageProps {
  onNavigate: (path: string) => void;
}

export interface BackendReview {
  commentaire?: string | null;
  coursId: number;
  dateCreation?: string | null;
  etudiantNom?: string | null;
  etudiantPhoto?: string | null;
  note?: number | null;
}

export interface RenderableTestimonial {
  author: string;
  avatar?: string;
  highlight?: boolean;
  quote: string;
  role: string;
  stars: number;
}
