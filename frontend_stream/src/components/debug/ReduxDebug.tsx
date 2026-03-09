import { useAppSelector } from '../../hooks/redux';

export function ReduxDebug() {
  const authState = useAppSelector(state => state.auth);
  const uiState = useAppSelector(state => state.ui);
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg p-4 max-w-sm text-xs z-50">
      <h4 className="font-semibold mb-2">Redux Debug</h4>
      <div className="space-y-2">
        <div>
          <strong>Auth:</strong>
          <div className="ml-2">
            <div>Authenticated: {authState.isAuthenticated ? '✅' : '❌'}</div>
            <div>User: {authState.user?.email || 'None'}</div>
            <div>Loading: {authState.isLoading ? '⏳' : '✅'}</div>
            <div>Error: {authState.error || 'None'}</div>
          </div>
        </div>
        <div>
          <strong>UI:</strong>
          <div className="ml-2">
            <div>Theme: {uiState.theme}</div>
            <div>Language: {uiState.preferences.language}</div>
            <div>Screen: {uiState.screenSize}</div>
            <div>Sidebar: {uiState.sidebarOpen ? 'Open' : 'Closed'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}