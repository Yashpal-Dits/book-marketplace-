import { HeroSection } from '@/components/home/HeroSection'
import { BookOfTheMonthSection } from '@/components/home/BookOfTheMonthSection'
import { CategoriesSection } from '@/components/home/CategoriesSection'
import { DealsOfWeekSection } from '@/components/home/DealsOfWeekSection'
import { BestSellersSection } from '@/components/home/BestSellersSection'
import { AuthorsSection } from '@/components/home/AuthorsSection'
import { FeaturesSection } from '@/components/home/FeaturesSection'
import { DiscountBannerSection } from '@/components/home/DiscountBannerSection'

export const HomePage = () => (
  <>
    <HeroSection />
    <BookOfTheMonthSection />
    <CategoriesSection />
    <DealsOfWeekSection />
    <BestSellersSection />
    <AuthorsSection />
    <FeaturesSection />
    <DiscountBannerSection />
  </>
)
