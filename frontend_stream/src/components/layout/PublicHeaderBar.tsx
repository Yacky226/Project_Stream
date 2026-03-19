import { FormEvent, useMemo, useState } from 'react';
import { LogOut, Menu, Moon, Search, School, Sun, User } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useAuth } from '../../hooks/useAuth';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
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

function buildDashboardPath(role?: string) {
  if (role === 'admin') return '/admin';
  if (role === 'teacher') return '/teacher/dashboard';
  return '/dashboard';
}

function isRouteActive(currentPath: string, path: string) {
  if (path === '/') return currentPath === '/';
  return currentPath === path || currentPath.startsWith(`${path}/`);
}

export function PublicHeaderBar({ currentPath, onNavigate }: PublicHeaderBarProps) {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);
  const [searchValue, setSearchValue] = useState('');

  const links = useMemo(() => {
    if (!isAuthenticated) return baseLinks;
    return [...baseLinks, { label: 'Dashboard', path: buildDashboardPath(user?.role) }];
  }, [isAuthenticated, user?.role]);

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

  const systemPrefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDarkMode = theme === 'dark' || (theme === 'system' && systemPrefersDark);

  const handleThemeToggle = () => {
    dispatch(setTheme(isDarkMode ? 'light' : 'dark'));
  };

  return (
    <header className="elite-header">
      <div className="elite-header__inner">
        <div className="elite-header__left">
          <button type="button" onClick={() => onNavigate('/')} className="elite-header__brand">
            <span className="elite-header__brand-icon">
              <School className="h-4 w-4" />
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
                className="elite-header__ghost-btn elite-header__dashboard-btn"
                onClick={() => onNavigate(buildDashboardPath(user?.role))}
              >
                Dashboard
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="elite-header__avatar-btn"
                    aria-label="User menu"
                  >
                    <User className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onNavigate(buildDashboardPath(user?.role))}>Dashboard</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onNavigate('/profile')}>Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onNavigate('/settings')}>Settings</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} disabled={isLoading} className="text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
