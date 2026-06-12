import { FiArrowUpRight } from 'react-icons/fi'
import { BookCover } from '@/components/common/BookCover'
import { Loader } from '@/components/common/Loader'
import { useApprovedBooks } from '@/hooks/useBooks'
import { useBookFilterStore } from '@/store/bookFilter.store'
import { EXPLORE_BOOKS_SECTION_ID, scrollToSection } from '@/utils/scrollToSection'
import { cn } from '@/utils/cn'
import type { IBook, ICategorySummary } from '@/interfaces/book.interface'

const CATEGORY_STYLES: Record<string, string> = {
  Fiction: 'bg-[#3e7d52] text-white',
  Fantasy: 'bg-[#0f8a80] text-white',
  Thriller: 'bg-[#e8a33d] text-[#16243d]',
  Romance: 'bg-[#8b7bf4] text-white',
  Nonfiction: 'bg-[#e8502c] text-white',
}
const FALLBACK_STYLES = ['bg-[#16243d] text-white', 'bg-[#b4543a] text-white', 'bg-[#467087] text-white']

const buildSummaries = (books: IBook[]): ICategorySummary[] => {
  const map = new Map<string, IBook[]>()
  books.forEach((book) => {
    const category = book.category || 'Other'
    map.set(category, [...(map.get(category) ?? []), book])
  })
  return [...map.entries()]
    .map(([name, items]) => ({
      name,
      count: items.length,
      coverImages: items.map((b) => b.coverImage).filter(Boolean).slice(0, 4),
    }))
    .sort((a, b) => b.count - a.count)
}

export const CategoriesSection = () => {
  const { data: books = [], isLoading } = useApprovedBooks()
  const setCategory = useBookFilterStore((s) => s.setCategory)

  const summaries = buildSummaries(books)
  const featured = summaries.slice(0, 5)

  const handleSelect = (category: string) => {
    setCategory(category)
    scrollToSection(EXPLORE_BOOKS_SECTION_ID)
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f0532d]">Book Categories</p>
        <h2 className="font-display mx-auto mt-2 max-w-xl text-3xl font-extrabold uppercase leading-tight text-[#16243d] sm:text-4xl">
          What Kind of Story Are You Craving Today?
        </h2>
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((category, index) => {
            const style = CATEGORY_STYLES[category.name] ?? FALLBACK_STYLES[index % FALLBACK_STYLES.length]
            const isWide = index === 1

            return (
              <button
                key={category.name}
                type="button"
                onClick={() => handleSelect(category.name)}
                className={cn(
                  'group relative flex min-h-[180px] items-end overflow-hidden rounded-2xl p-5 text-left transition hover:-translate-y-1 hover:shadow-xl',
                  style,
                  isWide && 'sm:col-span-2 sm:row-span-2 lg:row-span-2',
                )}
              >
                <span className="absolute left-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur transition group-hover:bg-[#f0532d]">
                  <FiArrowUpRight />
                </span>

                {/* cover collage */}
                <div className={cn('absolute -right-4 -top-2 flex gap-2', isWide ? 'right-4 top-6 flex-wrap justify-end' : '')} aria-hidden>
                  {category.coverImages.slice(0, isWide ? 4 : 1).map((src, i) => (
                    <BookCover
                      key={i}
                      src={src}
                      title={category.name}
                      className={cn(
                        'w-20 rotate-6 rounded shadow-2xl',
                        isWide && 'w-24 odd:rotate-[-8deg] even:rotate-[7deg]',
                      )}
                    />
                  ))}
                </div>

                <span className="relative z-10">
                  <span className="block text-xs opacity-80">{category.count} Books</span>
                  <span className="font-display mt-1 block text-2xl font-extrabold uppercase">{category.name}</span>
                </span>
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}
