import { axiosInstance } from './axiosInstance'
import { BookSort } from '@/enums/sort.enum'
import { BookStatus } from '@/enums/book-status.enum'
import { SellerStatus } from '@/enums/seller-status.enum'
import type { IBook, IDeal } from '@/interfaces/book.interface'
import type { IListing, IListingWithSeller } from '@/interfaces/listing.interface'
import type { PaginatedResult } from '@/interfaces/pagination.interface'
import type { ISeller } from '@/interfaces/seller.interface'
import type { GetBooksParams } from '@/interfaces/books-api.interface'


const getCustomerVisibleBookIds = async (): Promise<Set<string>> => {
  const [{ data: listings }, { data: sellers }] = await Promise.all([
    axiosInstance.get<IListing[]>('/listings', { params: { isActive: true } }),
    axiosInstance.get<ISeller[]>('/sellers', { params: { status: SellerStatus.APPROVED } }),
  ])

  const approvedSellerIds = new Set(sellers.map((seller) => seller.id))
  return new Set(
    listings
      .filter((listing) => approvedSellerIds.has(listing.sellerId))
      .map((listing) => listing.bookId),
  )
}

const sortCustomerBooks = (books: IBook[], sort = BookSort.NEWEST): IBook[] => {
  const sorted = [...books]
  sorted.sort((a, b) => {
    switch (sort) {
      case BookSort.TITLE_ASC:
        return a.title.localeCompare(b.title)
      case BookSort.TITLE_DESC:
        return b.title.localeCompare(a.title)
      case BookSort.PRICE_LOW_TO_HIGH:
        return (a.minPrice ?? Number.MAX_SAFE_INTEGER) - (b.minPrice ?? Number.MAX_SAFE_INTEGER)
      case BookSort.PRICE_HIGH_TO_LOW:
        return (b.minPrice ?? 0) - (a.minPrice ?? 0)
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })
  return sorted
}

const paginate = <T>(rows: T[], page = 1, limit = 8): PaginatedResult<T> => {
  const start = (page - 1) * limit
  return { data: rows.slice(start, start + limit), total: rows.length, page, limit }
}

export const booksApi = {
  async getBooks({
    page = 1,
    limit = 8,
    search = '',
    sort = BookSort.NEWEST,
    category,
  }: GetBooksParams = {}): Promise<PaginatedResult<IBook>> {
    const params: Record<string, string | number> = { status: BookStatus.APPROVED }
    if (search.trim()) params.q = search.trim()
    if (category) params.category = category

    const [{ data: books }, visibleBookIds] = await Promise.all([
      axiosInstance.get<IBook[]>('/books', { params }),
      getCustomerVisibleBookIds(),
    ])

    const customerVisibleBooks = sortCustomerBooks(
      books.filter((book) => visibleBookIds.has(book.id)),
      sort,
    )

    return paginate(customerVisibleBooks, page, limit)
  },

  async getBookById(id: string): Promise<IBook> {
    const { data } = await axiosInstance.get<IBook>(`/books/${id}`)
    return data
  },

  /** Approved + actively listed books (used to build customer category summaries). */
  async getApprovedBooks(): Promise<IBook[]> {
    const [{ data }, visibleBookIds] = await Promise.all([
      axiosInstance.get<IBook[]>('/books', { params: { status: BookStatus.APPROVED } }),
      getCustomerVisibleBookIds(),
    ])
    return data.filter((book) => visibleBookIds.has(book.id))
  },

  /** Top rated approved + actively listed books — "Best sellers of the month". */
  async getBestSellers(limit = 8): Promise<IBook[]> {
    const [{ data }, visibleBookIds] = await Promise.all([
      axiosInstance.get<IBook[]>('/books', {
        params: {
          status: BookStatus.APPROVED,
          _sort: 'rating',
          _order: 'desc',
        },
      }),
      getCustomerVisibleBookIds(),
    ])
    return data.filter((book) => visibleBookIds.has(book.id)).slice(0, limit)
  },

  /** "Deals of the week" config + the books referenced by it. */
  async getDealOfTheWeek(): Promise<{ deal: IDeal; books: IBook[] }> {
    const { data: deal } = await axiosInstance.get<IDeal>('/deal')

    // Single batched request (?id=a&id=b…) instead of N+1 per-book requests —
    // keeps the network dependency chain short.
    const params = new URLSearchParams()
    deal.bookIds.forEach((id) => params.append('id', id))
    const { data: books } = await axiosInstance.get<IBook[]>(`/books?${params.toString()}`)

    const visibleBookIds = await getCustomerVisibleBookIds()

    // Preserve the curated order from deal.bookIds; approved + actively listed books only.
    const order = new Map(deal.bookIds.map((id, index) => [id, index]))
    return {
      deal,
      books: books
        .filter((b) => b.status === BookStatus.APPROVED && visibleBookIds.has(b.id))
        .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)),
    }
  },

  async getListingsByBookId(bookId: string): Promise<IListing[]> {
    const { data } = await axiosInstance.get<IListing[]>('/listings', {
      params: { bookId, isActive: true },
    })
    return data
  },

  /**
   * Listings for a book joined with their seller, cheapest first.
   * Only listings from APPROVED sellers are shown (Rule 6).
   */
  async getListingsWithSellers(bookId: string): Promise<IListingWithSeller[]> {
    const { data: listings } = await axiosInstance.get<IListing[]>('/listings', {
      params: { bookId, isActive: true, _sort: 'price', _order: 'asc' },
    })

    const joined = await Promise.all(
      listings.map(async (listing) => {
        try {
          const { data: seller } = await axiosInstance.get<ISeller>(`/sellers/${listing.sellerId}`)
          return seller.status === SellerStatus.APPROVED ? { ...listing, seller } : null
        } catch {
          return null
        }
      }),
    )
    return joined.filter((item): item is IListingWithSeller => item !== null)
  },
}
