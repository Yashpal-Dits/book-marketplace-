import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi'
import { BookCover } from '@/components/common/BookCover'
import { Loader } from '@/components/common/Loader'
import { RatingStars } from '@/components/common/RatingStars'
import { useCountdown } from '@/hooks/useCountdown'
import { useDealOfTheWeek } from '@/hooks/useBooks'
import { formatCurrency } from '@/utils/formatCurrency'
import type { IDeal } from '@/interfaces/book.interface'

const pad = (n: number) => String(n).padStart(2, '0')

const CountdownTimer = ({ deal }: { deal: IDeal }) => {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(deal.endsAt)

  if (isExpired) {
    return <p className="text-sm font-semibold text-[#f0532d]">This deal has ended — new deals coming soon!</p>
  }

  const units = [
    { value: `${pad(days)}D` },
    { value: `${pad(hours)}H` },
    { value: `${pad(minutes)}M` },
    { value: `${pad(seconds)}S` },
  ]

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-stone-500">End in</span>
      {units.map((unit, i) => (
        <span key={i} className="flex items-center gap-2">
          <span className="inline-flex min-w-[46px] items-center justify-center rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-sm font-bold text-[#16243d]">
            {unit.value}
          </span>
          {i < units.length - 1 ? <span className="font-bold text-stone-400">:</span> : null}
        </span>
      ))}
    </div>
  )
}

export const DealsOfWeekSection = () => {
  const { data, isLoading } = useDealOfTheWeek()
  const scrollerRef = useRef<HTMLDivElement>(null)

  const scrollBy = (direction: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: direction * 260, behavior: 'smooth' })
  }

  return (
    <section className="bg-[#f3ecd9]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,340px)_1fr] lg:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f0532d]">Book Categories</p>
          <h2 className="font-display mt-2 text-3xl font-extrabold uppercase leading-tight text-[#16243d] sm:text-4xl">
            Deals of the Week
          </h2>

          <div className="mt-6">{data ? <CountdownTimer deal={data.deal} /> : null}</div>

          <p className="mt-6 max-w-xs text-sm leading-6 text-stone-600">
            {data?.deal.description ??
              "An unforgettable read that's dominating the bestseller lists and changing how we see love, loss, and everything in between."}
          </p>

          <div className="mt-8 flex items-center gap-3">
            <button
              type="button"
              aria-label="Scroll deals left"
              onClick={() => scrollBy(-1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-400 text-stone-700 transition hover:border-[#f0532d] hover:text-[#f0532d]"
            >
              <FiArrowLeft />
            </button>
            <button
              type="button"
              aria-label="Scroll deals right"
              onClick={() => scrollBy(1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f0532d] text-white transition hover:bg-[#d8431f]"
            >
              <FiArrowRight />
            </button>
          </div>
        </div>

        <div className="min-w-0">
          {isLoading ? (
            <Loader />
          ) : (
            <div ref={scrollerRef} className="flex gap-6 overflow-x-auto pb-4 [scrollbar-width:thin]">
              {(data?.books ?? []).map((book) => {
                const discount =
                  typeof book.minPrice === 'number' && typeof book.mrp === 'number' && book.mrp > book.minPrice
                    ? book.mrp - book.minPrice
                    : 0
                return (
                  <Link key={book.id} to={`/books/${book.id}`} className="group w-[200px] shrink-0">
                    <div className="relative rounded-2xl bg-white/70 p-4 shadow-sm transition group-hover:-translate-y-1 group-hover:shadow-lg">
                      {discount > 0 ? (
                        <span className="absolute -left-1 top-3 z-10 rounded-full bg-[#f0532d] px-2.5 py-1 text-[11px] font-bold text-white shadow">
                          -{formatCurrency(discount)}
                        </span>
                      ) : null}
                      <BookCover
                        src={book.coverImage}
                        title={book.title}
                        className="mx-auto aspect-[3/4.2] w-full rounded-md shadow-[0_16px_26px_-12px_rgba(0,0,0,0.4)]"
                      />
                    </div>
                    <div className="mt-3 space-y-1">
                      <RatingStars rating={book.rating} />
                      <h3 className="line-clamp-1 text-sm font-bold text-[#16243d] group-hover:text-[#f0532d]">{book.title}</h3>
                      <p className="text-xs text-stone-500">{book.author}</p>
                      {typeof book.minPrice === 'number' ? (
                        <p className="flex items-baseline gap-2">
                          <span className="text-sm font-bold text-[#16243d]">{formatCurrency(book.minPrice)}</span>
                          {discount > 0 ? (
                            <span className="text-xs text-stone-400 line-through">{formatCurrency(book.mrp as number)}</span>
                          ) : null}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
