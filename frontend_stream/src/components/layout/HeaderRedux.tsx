import { useState } from 'react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { useI18n } from '../../hooks/useI18n';
import { LanguageSwitcher } from '../i18n/LanguageSwitcher';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { useAuth } from '../../hooks/useAuth';
import { setTheme } from '../../store/slices/uiSlice';
import { logoutUser } from '../../store/slices/authSlice';
import { 
  Moon, 
  Sun, 
  User as UserIcon, 
  Settings, 
  LogOut, 
  BookOpen, 
  Search,
  Menu,
  Bell
} from 'lucide-react';

interface HeaderReduxProps {
  onNavigate: (path: string) => void;
  currentPath: string;
}

export function HeaderRedux({ onNavigate, currentPath }: HeaderReduxProps) {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  
  // Redux state
  const { user, isAuthenticated, isLoading } = useAuth();
  const { theme } = useAppSelector(state => state.ui);
  const unreadNotifications = useAppSelector(state => 
    state.notifications?.notifications?.filter(n => !n.read).length || 0
  );
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    dispatch(setTheme(newTheme));
  };

  const handleSignOut = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      onNavigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (path: string) => currentPath === path;

  const navigationItems = [
    { path: '/', label: t('navigation:home') },
    { path: '/catalog', label: t('navigation:catalog') },
    { path: '/live-sessions', label: t('navigation:liveSessions') },
  ];

  if (user?.role === 'teacher') {
    navigationItems.push(
      { path: '/teacher/dashboard', label: t('navigation:teacherDashboard') },
      { path: '/teacher/live-sessions', label: t('course:liveSessions') }
    );
  } else if (user?.role === 'admin') {
    navigationItems.push({ path: '/admin', label: t('navigation:admin') });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div 
            className="flex items-center gap-1.5 sm:gap-2 cursor-pointer" 
            onClick={() => onNavigate('/')}
          >
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span>Stream Éducatif</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navigationItems.map((item) => (
            <Button
              key={item.path}
              variant={isActive(item.path) ? "default" : "ghost"}
              onClick={() => onNavigate(item.path)}
              size="sm"
            >
              {item.label}
            </Button>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Search Button - Hidden on mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate('/search')}
            className="hidden sm:flex h-9 w-9"
            aria-label={t('navigation:search')}
          >
            <Search className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9"
            aria-label={theme === 'dark' ? t('common:lightMode', { defaultValue: 'Light mode' }) : t('common:darkMode', { defaultValue: 'Dark mode' })}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </Button>

          {/* Language Switcher - Hidden on small mobile */}
          <div className="hidden xs:flex">
            <LanguageSwitcher variant="ghost" size="icon" />
          </div>

          {/* Notifications */}
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNavigate('/notifications')}
              className="relative h-9 w-9 hidden sm:flex"
              aria-label={`${t('navigation:notifications')}${unreadNotifications > 0 ? ` (${unreadNotifications})` : ''}`}
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              {unreadNotifications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 p-0 flex items-center justify-center"
                  aria-hidden="true"
                >
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </Badge>
              )}
            </Button>
          )}

          {/* User Menu or Auth Buttons */}
          {isLoading ? (
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-muted animate-pulse" />
          ) : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full">
                  <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                    <AvatarFallback>
                      {user.firstName && user.lastName 
                        ? `${user.firstName[0]}${user.lastName[0]}`
                        : user.email[0].toUpperCase()
                      }
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p>{user.firstName} {user.lastName}</p>
                    <p className="w-[200px] truncate text-muted-foreground">
                      {user.email}
                    </p>
                    <Badge variant="secondary" className="w-fit">
                      {t(`auth:${user.role}`)}
                    </Badge>
                  </div>
                </div>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => {
                  if (user.role === 'teacher') {
                    onNavigate('/teacher/dashboard');
                  } else if (user.role === 'admin') {
                    onNavigate('/admin');
                  } else {
                    onNavigate('/dashboard');
                  }
                }}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>{t('common:dashboard')}</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => onNavigate('/profile')}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>{t('common:profile')}</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => onNavigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t('common:settings')}</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('common:logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button 
                variant="ghost" 
                onClick={() => onNavigate('/auth/signin')}
                size="sm"
              >
                {t('auth:signin')}
              </Button>
              <Button 
                onClick={() => onNavigate('/auth/signup')}
                size="sm"
              >
                {t('auth:signup')}
              </Button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-9 w-9"
                aria-label={isMobileMenuOpen ? t('common:close', { defaultValue: 'Close' }) : t('common:menu', { defaultValue: 'Menu' })}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <nav className="flex flex-col gap-2 mt-6">
                {/* Navigation Links */}
                {navigationItems.map((item) => (
                  <Button
                    key={item.path}
                    variant={isActive(item.path) ? "default" : "ghost"}
                    onClick={() => {
                      onNavigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                    className="justify-start"
                  >
                    {item.label}
                  </Button>
                ))}
                
                {/* Search */}
                <Button
                  variant="ghost"
                  onClick={() => {
                    onNavigate('/search');
                    setIsMobileMenuOpen(false);
                  }}
                  className="justify-start"
                >
                  <Search className="mr-2 h-4 w-4" />
                  {t('navigation:search')}
                </Button>

                {/* Auth Buttons for Mobile */}
                {!isAuthenticated && (
                  <>
                    <div className="my-2 border-t" />
                    <Button 
                      variant="outline"
                      onClick={() => {
                        onNavigate('/auth/signin');
                        setIsMobileMenuOpen(false);
                      }}
                      className="justify-start"
                    >
                      {t('auth:signin')}
                    </Button>
                    <Button 
                      onClick={() => {
                        onNavigate('/auth/signup');
                        setIsMobileMenuOpen(false);
                      }}
                      className="justify-start"
                    >
                      {t('auth:signup')}
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}