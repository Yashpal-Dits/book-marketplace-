import { useState } from 'react'
import { FiBookOpen } from 'react-icons/fi'
import { cn } from '@/utils/cn'

interface BookCoverProps {
  src?: string
  title: string
  className?: string
}

/** Book cover image with a graceful placeholder when the image is missing or fails. */
export const BookCover = ({ src, title, className }: BookCoverProps) => {
  const [hasError, setHasError] = useState(false)

  if (!src || hasError) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-stone-200 to-stone-300 p-3 text-center',
          className,
        )}
      >
        <FiBookOpen className="text-2xl text-stone-500" />
        <span className="line-clamp-3 text-[11px] font-medium leading-tight text-stone-600">{title}</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={`${title} cover`}
      loading="lazy"
      decoding="async"
      fetchPriority="low"
      onError={() => setHasError(true)}
      className={cn('object-cover', className)}
    />
  )
}
