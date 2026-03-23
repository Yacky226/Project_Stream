import { FormEvent, useMemo, useState } from 'react';
import { GraduationCap, LayoutDashboard, Menu, Moon, Search, Sun, User } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { useAuth } from '../../hooks/useAuth';
import { useAppDispatch } from '../../hooks/redux';
import { useResolvedTheme } from '../../hooks/useResolvedTheme';
import { setTheme } from '../../store/slices/uiSlice';

interface PublicHeaderBarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

const baseLinks = [
  { label: 'Courses', path: '/catalog' },
  { label: 'Pricing', path: '/business' },
  { label: 'Enterprise', path: '/contact' },
];

function normalizeRole(role?: string) {
  return (role || '').trim().toLowerCase();
}

function buildDashboardPath(role?: string) {
  const normalized = normalizeRole(role);
  if (normalized === 'admin' || normalized === 'administrateur') return '/admin';
  if (normalized === 'teacher' || normalized === 'enseignant') return '/teacher/dashboard';
  return '/dashboard';
}

function buildDashboardLabel(role?: string) {
  const normalized = normalizeRole(role);
  if (normalized === 'admin' || normalized === 'administrateur') return 'Admin Space';
  if (normalized === 'teacher' || normalized === 'enseignant') return 'Teacher Space';
  return 'My Dashboard';
}

function isRouteActive(currentPath: string, path: string) {
  if (path === '/') return currentPath === '/';
  return currentPath === path || currentPath.startsWith(`${path}/`);
}

export function PublicHeaderBar({ currentPath, onNavigate }: PublicHeaderBarProps) {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const dispatch = useAppDispatch();
  const { isDark } = useResolvedTheme();
  const [searchValue, setSearchValue] = useState('');
  const dashboardPath = useMemo(() => buildDashboardPath(user?.role), [user?.role]);
  const dashboardLabel = useMemo(() => buildDashboardLabel(user?.role), [user?.role]);

  const links = useMemo(() => baseLinks, []);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchValue.trim();
    if (!query) {
      onNavigate('/search');
      return;
    }
    onNavigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleLogout = async () => {
    await logout();
    onNavigate('/');
  };

  const isDarkMode = isDark;

  const handleThemeToggle = () => {
    dispatch(setTheme(isDarkMode ? 'light' : 'dark'));
  };

  return (
    <header className="elite-header">
      <div className="elite-header__inner">
        <div className="elite-header__left">
          <button type="button" onClick={() => onNavigate('/')} className="elite-header__brand">
            <span className="elite-header__brand-icon">
              <GraduationCap className="h-4 w-4" />
            </span>
            <span className="elite-header__brand-name">EliteLearn</span>
          </button>

          <nav className="elite-header__nav">
            {links.map((link) => (
              <button
                key={link.path}
                onClick={() => onNavigate(link.path)}
                className={`elite-header__nav-link ${isRouteActive(currentPath, link.path) ? 'is-active' : ''}`}
                type="button"
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="elite-header__right">
          <form onSubmit={handleSearch} className="elite-header__search" role="search" aria-label="Search skills">
            <Search className="h-4 w-4 elite-header__search-icon" />
            <input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search skills..."
              className="elite-header__search-input"
            />
          </form>

          <button
            type="button"
            onClick={() => onNavigate('/search')}
            className="elite-header__icon-btn elite-header__search-mobile"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleThemeToggle}
            className="elite-header__icon-btn elite-header__theme-btn"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {isAuthenticated ? (
            <>
              <button
                type="button"
                className={`elite-header__ghost-btn elite-header__dashboard-btn elite-header__workspace-btn ${
                  isRouteActive(currentPath, dashboardPath) ? 'is-active' : ''
                }`}
                onClick={() => onNavigate(dashboardPath)}
              >
                <LayoutDashboard className="h-4 w-4" />
                {dashboardLabel}
              </button>

              <button
                type="button"
                className="elite-header__avatar-btn"
                aria-label="Open profile"
                title="Profile"
                onClick={() => onNavigate('/profile')}
              >
                <User className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="elite-header__auth">
              <button
                className="elite-header__ghost-btn"
                onClick={() => onNavigate('/auth/signin')}
                type="button"
              >
                Log in
              </button>
              <button
                className="elite-header__primary-btn"
                onClick={() => onNavigate('/auth/signup')}
                type="button"
              >
                Get Started
              </button>
            </div>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <button type="button" className="elite-header__mobile-toggle" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <div className="mt-8 space-y-2">
                {links.map((link) => (
                  <button
                    key={`mobile-${link.path}`}
                    type="button"
                    className={`elite-mobile-menu__item ${isRouteActive(currentPath, link.path) ? 'is-active' : ''}`}
                    onClick={() => onNavigate(link.path)}
                  >
                    {link.label}
                  </button>
                ))}

                <button
                  type="button"
                  className="elite-mobile-menu__item elite-mobile-menu__item--inline"
                  onClick={handleThemeToggle}
                >
                  {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {isDarkMode ? 'Light mode' : 'Dark mode'}
                </button>

                {!isAuthenticated ? (
                  <>
                    <button
                      type="button"
                      className="elite-mobile-menu__item"
                      onClick={() => onNavigate('/auth/signin')}
                    >
                      Log in
                    </button>
                    <button
                      type="button"
                      className="elite-mobile-menu__item is-primary"
                      onClick={() => onNavigate('/auth/signup')}
                    >
                      Get Started
                    </button>
                  </>
                ) : null}

                {isAuthenticated ? (
                  <>
                    <button
                      type="button"
                      className={`elite-mobile-menu__item elite-mobile-menu__item--inline ${
                        isRouteActive(currentPath, dashboardPath) ? 'is-active' : ''
                      }`}
                      onClick={() => onNavigate(dashboardPath)}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      {dashboardLabel}
                    </button>
                    <button
                      type="button"
                      className={`elite-mobile-menu__item ${isRouteActive(currentPath, '/profile') ? 'is-active' : ''}`}
                      onClick={() => onNavigate('/profile')}
                    >
                      Profile
                    </button>
                    <button
                      type="button"
                      className={`elite-mobile-menu__item ${isRouteActive(currentPath, '/settings') ? 'is-active' : ''}`}
                      onClick={() => onNavigate('/settings')}
                    >
                      Settings
                    </button>
                    <button
                      type="button"
                      className="elite-mobile-menu__item elite-mobile-menu__item--danger"
                      onClick={handleLogout}
                      disabled={isLoading}
                    >
                      Logout
                    </button>
                  </>
                ) : null}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
