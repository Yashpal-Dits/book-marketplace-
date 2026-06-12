import { FaRegStar, FaStar, FaStarHalfAlt } from 'react-icons/fa'
import { cn } from '@/utils/cn'

interface RatingStarsProps {
  rating?: number
  className?: string
}

export const RatingStars = ({ rating = 0, className }: RatingStarsProps) => (
  <div className={cn('flex items-center gap-0.5 text-[13px] text-[#f0532d]', className)} aria-label={`Rated ${rating} out of 5`}>
    {Array.from({ length: 5 }, (_, i) => {
      const starValue = i + 1
      if (rating >= starValue) return <FaStar key={i} />
      if (rating >= starValue - 0.5) return <FaStarHalfAlt key={i} />
      return <FaRegStar key={i} className="text-stone-300" />
    })}
  </div>
)
