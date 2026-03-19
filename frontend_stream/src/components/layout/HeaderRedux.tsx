import { PublicHeaderBar } from './PublicHeaderBar';

interface HeaderReduxProps {
  onNavigate: (path: string) => void;
  currentPath: string;
}

export function HeaderRedux({ onNavigate, currentPath }: HeaderReduxProps) {
  return <PublicHeaderBar onNavigate={onNavigate} currentPath={currentPath} />;
}
