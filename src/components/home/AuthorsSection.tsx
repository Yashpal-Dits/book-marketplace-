import { RatingStars } from '@/components/common/RatingStars'
import { Loader } from '@/components/common/Loader'
import { useApprovedBooks } from '@/hooks/useBooks'
import type { IBook } from '@/interfaces/book.interface'

interface AuthorSummary {
  name: string
  booksCount: number
  rating: number
  initials: string
  colorClass: string
}

const AVATAR_COLORS = [
  'bg-[#3e7d52] text-emerald-50',
  'bg-[#0f8a80] text-teal-50',
  'bg-[#e8a33d] text-[#16243d]',
  'bg-[#8b7bf4] text-violet-50',
  'bg-[#e8502c] text-orange-50',
]

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

/** Groups approved books by author → top authors with count + avg rating. */
const buildAuthors = (books: IBook[]): AuthorSummary[] => {
  const map = new Map<string, IBook[]>()
  books.forEach((book) => map.set(book.author, [...(map.get(book.author) ?? []), book]))

  return [...map.entries()]
    .map(([name, items], index) => ({
      name,
      booksCount: items.length,
      rating: items.reduce((sum, b) => sum + (b.rating ?? 0), 0) / items.length,
      initials: getInitials(name),
      colorClass: AVATAR_COLORS[index % AVATAR_COLORS.length],
    }))
    .sort((a, b) => b.booksCount - a.booksCount || b.rating - a.rating)
    .slice(0, 5)
}

export const AuthorsSection = () => {
  const { data: books = [], isLoading } = useApprovedBooks()
  const authors = buildAuthors(books)

  return (
    <section className="bg-[#f3ecd9]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f0532d]">Author's</p>
          <h2 className="font-display mx-auto mt-2 max-w-md text-3xl font-extrabold uppercase leading-tight text-[#16243d] sm:text-4xl">
            Meet the Authors You'll Love
          </h2>
        </div>

        {isLoading ? (
          <Loader />
        ) : (
          <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
            {authors.map((author) => (
              <div key={author.name} className="group flex flex-col items-center text-center">
                {/* avatar with decorative ring + wheat sparks */}
                <div className="relative">
                  <span className="absolute -left-4 top-2 rotate-[-30deg] text-xl text-amber-500" aria-hidden>
                    ❋
                  </span>
                  <span className="absolute -right-4 top-2 rotate-[30deg] text-xl text-amber-500" aria-hidden>
                    ❋
                  </span>
                  <div className="rounded-full border-2 border-dashed border-[#e8502c] p-1.5 transition group-hover:border-solid">
                    <div
                      className={`flex h-24 w-24 items-center justify-center rounded-full text-2xl font-extrabold shadow-inner transition group-hover:scale-105 sm:h-28 sm:w-28 ${author.colorClass}`}
                      aria-label={author.name}
                    >
                      {author.initials}
                    </div>
                  </div>
                </div>

                <RatingStars rating={author.rating} className="mt-4 justify-center" />
                <p className="mt-1.5 flex items-center justify-center gap-1.5 text-sm font-bold text-[#16243d]">
                  {author.name}
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-emerald-700">
                    Author
                  </span>
                </p>
                <p className="mt-0.5 text-xs text-stone-500">
                  {author.booksCount} Book{author.booksCount === 1 ? '' : 's'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
