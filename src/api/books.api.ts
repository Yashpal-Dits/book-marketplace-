import { axiosInstance } from './axiosInstance'
import { BookSort } from '@/enums/sort.enum'
import { BookStatus } from '@/enums/book-status.enum'
import { SellerStatus } from '@/enums/seller-status.enum'
import type { IBook, IDeal } from '@/interfaces/book.interface'
import type { IListing, IListingWithSeller } from '@/interfaces/listing.interface'
import type { PaginatedResult } from '@/interfaces/pagination.interface'
import type { ISeller } from '@/interfaces/seller.interface'

export interface GetBooksParams {
  page?: number
  limit?: number
  search?: string
  sort?: BookSort
  category?: string
}

/** Maps the UI sort option to json-server `_sort` / `_order` params. */
const sortMap: Record<BookSort, { sort: string; order: 'asc' | 'desc' }> = {
  [BookSort.NEWEST]: { sort: 'createdAt', order: 'desc' },
  [BookSort.TITLE_ASC]: { sort: 'title', order: 'asc' },
  [BookSort.TITLE_DESC]: { sort: 'title', order: 'desc' },
  [BookSort.PRICE_LOW_TO_HIGH]: { sort: 'minPrice', order: 'asc' },
  [BookSort.PRICE_HIGH_TO_LOW]: { sort: 'minPrice', order: 'desc' },
}

export const booksApi = {
  /**
   * Paginated + searchable + sortable books list.
   * Only APPROVED books are ever returned to customers (Business Rule 7).
   */
  async getBooks({
    page = 1,
    limit = 8,
    search = '',
    sort = BookSort.NEWEST,
    category,
  }: GetBooksParams = {}): Promise<PaginatedResult<IBook>> {
    const { sort: _sort, order: _order } = sortMap[sort] ?? sortMap[BookSort.NEWEST]

    const params: Record<string, string | number> = {
      status: BookStatus.APPROVED,
      _page: page,
      _limit: limit,
      _sort: _sort,
      _order: _order,
    }
    if (search.trim()) params.q = search.trim()
    if (category) params.category = category

    const response = await axiosInstance.get<IBook[]>('/books', { params })
    const total = Number(response.headers['x-total-count'] ?? response.data.length)

    return { data: response.data, total, page, limit }
  },

  async getBookById(id: string): Promise<IBook> {
    const { data } = await axiosInstance.get<IBook>(`/books/${id}`)
    return data
  },

  /** All approved books (used to build category summaries client-side). */
  async getApprovedBooks(): Promise<IBook[]> {
    const { data } = await axiosInstance.get<IBook[]>('/books', {
      params: { status: BookStatus.APPROVED },
    })
    return data
  },

  /** Top rated approved books — "Best sellers of the month". */
  async getBestSellers(limit = 8): Promise<IBook[]> {
    const { data } = await axiosInstance.get<IBook[]>('/books', {
      params: {
        status: BookStatus.APPROVED,
        _sort: 'rating',
        _order: 'desc',
        _limit: limit,
      },
    })
    return data
  },

  /** "Deals of the week" config + the books referenced by it. */
  async getDealOfTheWeek(): Promise<{ deal: IDeal; books: IBook[] }> {
    const { data: deal } = await axiosInstance.get<IDeal>('/deal')

    // Single batched request (?id=a&id=b…) instead of N+1 per-book requests —
    // keeps the network dependency chain short.
    const params = new URLSearchParams()
    deal.bookIds.forEach((id) => params.append('id', id))
    const { data: books } = await axiosInstance.get<IBook[]>(`/books?${params.toString()}`)

    // Preserve the curated order from deal.bookIds; approved books only.
    const order = new Map(deal.bookIds.map((id, index) => [id, index]))
    return {
      deal,
      books: books
        .filter((b) => b.status === BookStatus.APPROVED)
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
