import { HeroSection } from '@/components/home/HeroSection'
import { BookOfTheMonthSection } from '@/components/home/BookOfTheMonthSection'
import { CategoriesSection } from '@/components/home/CategoriesSection'
import { DealsOfWeekSection } from '@/components/home/DealsOfWeekSection'
import { BestSellersSection } from '@/components/home/BestSellersSection'
import { ExploreBooksSection } from '@/components/home/ExploreBookSection'
import { NewsletterSection } from '@/components/home/NewsletterSection'

export const HomePage = () => (
  <>
    <HeroSection />
    <BookOfTheMonthSection />
    <CategoriesSection />
    <DealsOfWeekSection />
    <BestSellersSection />
    <ExploreBooksSection />
    <NewsletterSection />
  </>
)
