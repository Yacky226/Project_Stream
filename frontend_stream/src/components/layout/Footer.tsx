import { PublicFooterBar } from './PublicFooterBar';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return <PublicFooterBar onNavigate={onNavigate} />;
}
