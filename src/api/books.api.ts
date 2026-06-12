import { axiosInstance } from './axiosInstance'
import { BookSort } from '@/enums/sort.enum'
import { BookStatus } from '@/enums/book-status.enum'
import type { IBook, IDeal } from '@/interfaces/book.interface'
import type { IListing } from '@/interfaces/listing.interface'
import type { PaginatedResult } from '@/interfaces/pagination.interface'

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
    const books = await Promise.all(
      deal.bookIds.map((id) =>
        axiosInstance.get<IBook>(`/books/${id}`).then((r) => r.data).catch(() => null),
      ),
    )
    return {
      deal,
      books: books.filter((b): b is IBook => b !== null && b.status === BookStatus.APPROVED),
    }
  },

  async getListingsByBookId(bookId: string): Promise<IListing[]> {
    const { data } = await axiosInstance.get<IListing[]>('/listings', {
      params: { bookId, isActive: true },
    })
    return data
  },
}
