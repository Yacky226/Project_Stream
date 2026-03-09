import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import { useI18n } from '../../hooks/useI18n';
import { LanguageSwitcher } from '../i18n/LanguageSwitcher';
import { 
  BookOpen, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram,
  Youtube,
  Globe,
  Shield,
  Award,
  Users,
  Clock,
  ArrowRight
} from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const { t, currentLanguage } = useI18n();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    alert(t('footer.newsletter.thanks'));
  };

  return (
    <footer className="bg-muted/30 border-t">
      {/* Newsletter Section */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="mb-4">{t('footer.newsletter.title')}</h3>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('footer.newsletter.subtitle')}
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input 
                type="email" 
                placeholder={t('footer.newsletter.placeholder')}
                className="flex-1"
                required
              />
              <Button type="submit" className="sm:w-auto">
                <Mail className="w-4 h-4 mr-2" />
                {t('footer.newsletter.subscribe')}
              </Button>
            </form>
            
            <p className="text-muted-foreground mt-4">
              {t('footer.newsletter.privacy')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-5 md:grid-cols-2 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <BookOpen className="h-8 w-8 text-primary" />
              <span>Stream Éducatif</span>
            </div>
            
            <p className="text-muted-foreground mb-6 max-w-md">
              {t('footer.brand.description')}
            </p>
            
            {/* Trust Indicators */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>{t('footer.trust.ssl')}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Award className="w-4 h-4 text-blue-500" />
                <span>{t('footer.trust.iso')}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Users className="w-4 h-4 text-purple-500" />
                <span>{t('footer.trust.students')}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="w-4 h-4 text-orange-500" />
                <span>{t('footer.trust.support')}</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="hover:text-primary">
                <Facebook className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-primary">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-primary">
                <Linkedin className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-primary">
                <Instagram className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-primary">
                <Youtube className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Courses Links */}
          <div>
            <h4 className="mb-4">{t('footer.courses.title')}</h4>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => onNavigate('/catalog')}
                  className="text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  {t('footer.courses.catalog')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('/courses/programming')}
                  className="text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  {t('footer.courses.programming')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('/courses/design')}
                  className="text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  {t('footer.courses.design')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('/courses/marketing')}
                  className="text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  {t('footer.courses.marketing')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('/courses/beginner')}
                  className="text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  {t('footer.courses.beginner')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('/live-sessions')}
                  className="text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  {t('footer.courses.live')}
                </button>
              </li>
            </ul>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="mb-4">{t('footer.platform.title')}</h4>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => onNavigate('/teacher/signup')}
                  className="text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  {t('footer.platform.becomeInstructor')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('/business')}
                  className="text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  {t('footer.platform.business')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('/mobile-app')}
                  className="text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  {t('footer.platform.mobileApp')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('/help')}
                  className="text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  {t('footer.platform.helpCenter')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('/blog')}
                  className="text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  {t('footer.platform.blog')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('/careers')}
                  className="text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  {t('footer.platform.careers')}
                </button>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="mb-4">{t('footer.support.title')}</h4>
            <ul className="space-y-3 mb-6">
              <li>
                <button 
                  onClick={() => onNavigate('/contact')}
                  className="text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  {t('footer.support.contact')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('/faq')}
                  className="text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  {t('footer.support.faq')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('/terms')}
                  className="text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  {t('footer.support.terms')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('/privacy')}
                  className="text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  {t('footer.support.privacy')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('/accessibility')}
                  className="text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  {t('footer.support.accessibility')}
                </button>
              </li>
            </ul>

            {/* Contact Info */}
            <div className="space-y-2 text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>contact@stream-educatif.fr</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+33 1 23 45 67 89</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Paris, France</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-muted-foreground">
                © 2024 Stream Éducatif. {t('footer.bottom.rights')}
              </p>
              <div className="flex items-center space-x-4 text-muted-foreground">
                <span>{t('footer.bottom.version')} 2.1.0</span>
                <Separator orientation="vertical" className="h-4" />
                <span>{t('footer.bottom.lastUpdate')}: Janvier 2024</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Globe className="w-4 h-4" />
                <span>{currentLanguage === 'fr' ? t('footer.bottom.french') : t('footer.bottom.english')}</span>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowRight className="w-4 h-4 rotate-[-90deg] mr-1" />
                {t('footer.bottom.backToTop')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}