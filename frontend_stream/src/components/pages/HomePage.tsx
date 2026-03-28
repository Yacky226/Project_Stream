import { PublicFooterBar } from '../layout/PublicFooterBar';
import { PublicHeaderBar } from '../layout/PublicHeaderBar';
import { HomeFeaturedCoursesSection } from './home-page/components/HomeFeaturedCoursesSection';
import { HomeHeroSection } from './home-page/components/HomeHeroSection';
import { HomeNewsletterSection } from './home-page/components/HomeNewsletterSection';
import { HomeTestimonialsSection } from './home-page/components/HomeTestimonialsSection';
import type { HomePageProps } from './home-page/homePage.types';
import { useHomePageData } from './home-page/useHomePageData';
import './HomePage.css';

export function HomePage({ onNavigate }: HomePageProps) {
  const model = useHomePageData({ onNavigate });

  return (
    <div className="el-home">
      <PublicHeaderBar currentPath="/" onNavigate={model.onNavigate} />
      <main className="el-main">
        <HomeHeroSection model={model} />
        <HomeFeaturedCoursesSection model={model} />
        <HomeTestimonialsSection model={model} />
        <HomeNewsletterSection model={model} />
      </main>
      <PublicFooterBar onNavigate={model.onNavigate} />
    </div>
  );
}
