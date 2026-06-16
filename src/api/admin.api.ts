import { axiosInstance } from './axiosInstance'
import { AdminBookSort, AdminSellerSort } from '@/enums/admin-sort.enum'
import { BookStatus } from '@/enums/book-status.enum'
import { CustomerStatus } from '@/enums/customer-status.enum'
import { OrderStatus } from '@/enums/order-status.enum'
import { SellerStatus } from '@/enums/seller-status.enum'
import type { IBook } from '@/interfaces/book.interface'
import type { ICustomer } from '@/interfaces/customer.interface'
import type { IListing } from '@/interfaces/listing.interface'
import type { IOrder } from '@/interfaces/order.interface'
import type { PaginatedResult } from '@/interfaces/pagination.interface'
import type { ISeller } from '@/interfaces/seller.interface'
import type {
  AdminBookDetailed,
  AdminBookParams,
  AdminCustomerDetailed,
  AdminCustomerParams,
  AdminDashboardSummary,
  AdminSellerParams,
  UpdateBookCatalogPayload
} from '@/interfaces/admin-api.interface'


const sellerSortMap: Record<AdminSellerSort, { sort: string; order: 'asc' | 'desc' }> = {
  [AdminSellerSort.NEWEST]: { sort: 'createdAt', order: 'desc' },
  [AdminSellerSort.BUSINESS_ASC]: { sort: 'businessName', order: 'asc' },
  [AdminSellerSort.BUSINESS_DESC]: { sort: 'businessName', order: 'desc' },
  [AdminSellerSort.STATUS_ASC]: { sort: 'status', order: 'asc' },
}

const bookSortMap: Record<AdminBookSort, { sort: string; order: 'asc' | 'desc' }> = {
  [AdminBookSort.NEWEST]: { sort: 'createdAt', order: 'desc' },
  [AdminBookSort.TITLE_ASC]: { sort: 'title', order: 'asc' },
  [AdminBookSort.TITLE_DESC]: { sort: 'title', order: 'desc' },
  [AdminBookSort.STATUS_ASC]: { sort: 'status', order: 'asc' },
}

const joinBooksWithSellers = async (books: IBook[]): Promise<AdminBookDetailed[]> => {
  const rows = await Promise.all(
    books.map(async (book): Promise<AdminBookDetailed> => {
      if (!book.createdBySellerId) return book
      try {
        const { data: seller } = await axiosInstance.get<ISeller>(`/sellers/${book.createdBySellerId}`)
        return { ...book, seller }
      } catch {
        return book
      }
    }),
  )
  return rows
}

export const adminApi = {
  async getSellers({ page = 1, limit = 8, search = '', sort = AdminSellerSort.NEWEST, status }: AdminSellerParams = {}): Promise<PaginatedResult<ISeller>> {
    const { sort: _sort, order: _order } = sellerSortMap[sort]
    const params: Record<string, string | number> = { _page: page, _limit: limit, _sort, _order }
    if (search.trim()) params.q = search.trim()
    if (status) params.status = status

    const response = await axiosInstance.get<ISeller[]>('/sellers', { params })
    const total = Number(response.headers['x-total-count'] ?? response.data.length)
    return { data: response.data, total, page, limit }
  },

  async updateSellerStatus(sellerId: string, status: SellerStatus): Promise<ISeller> {
    const { data } = await axiosInstance.patch<ISeller>(`/sellers/${sellerId}`, { status })
    return data
  },

  async getBooks({ page = 1, limit = 8, search = '', sort = AdminBookSort.NEWEST, status }: AdminBookParams = {}): Promise<PaginatedResult<AdminBookDetailed>> {
    const { sort: _sort, order: _order } = bookSortMap[sort]
    const params: Record<string, string | number> = { _page: page, _limit: limit, _sort, _order }
    if (search.trim()) params.q = search.trim()
    if (status) params.status = status

    const response = await axiosInstance.get<IBook[]>('/books', { params })
    const total = Number(response.headers['x-total-count'] ?? response.data.length)
    const data = await joinBooksWithSellers(response.data)
    return { data, total, page, limit }
  },

  async updateBookStatus(bookId: string, status: BookStatus): Promise<IBook> {
    const { data } = await axiosInstance.patch<IBook>(`/books/${bookId}`, { status })
    return data
  },

  async updateBookCatalog(bookId: string, payload: UpdateBookCatalogPayload): Promise<IBook> {
    const isbn = payload.isbn.trim()
    const { data: existing } = await axiosInstance.get<IBook[]>('/books', { params: { isbn } })
    const duplicate = existing.find((book) => book.id !== bookId)
    if (duplicate) throw new Error('A book with this ISBN already exists')

    const { data } = await axiosInstance.patch<IBook>(`/books/${bookId}`, {
      isbn,
      title: payload.title.trim(),
      author: payload.author.trim(),
      publisher: payload.publisher.trim(),
      description: payload.description.trim(),
      coverImage: payload.coverImage?.trim() || '',
      category: payload.category.trim(),
      updatedAt: new Date().toISOString(),
    })
    return data
  },

  async getCustomers({ page = 1, limit = 10, search = '', status }: AdminCustomerParams = {}): Promise<PaginatedResult<AdminCustomerDetailed>> {
    const params: Record<string, string | number> = { _page: page, _limit: limit, _sort: 'createdAt', _order: 'desc' }
    if (search.trim()) params.q = search.trim()
    if (status) params.status = status

    const response = await axiosInstance.get<ICustomer[]>('/customers', { params })
    const total = Number(response.headers['x-total-count'] ?? response.data.length)

    const { data: orders } = await axiosInstance.get<IOrder[]>('/orders')
    const ordersCountByCustomer = new Map<string, number>()
    orders.forEach((order) => {
      ordersCountByCustomer.set(order.customerId, (ordersCountByCustomer.get(order.customerId) ?? 0) + 1)
    })

    const data = response.data.map((customer): AdminCustomerDetailed => ({
      ...customer,
      ordersCount: ordersCountByCustomer.get(customer.id) ?? 0,
    }))

    return { data, total, page, limit }
  },

  async updateCustomerStatus(customerId: string, status: CustomerStatus): Promise<ICustomer> {
    const { data } = await axiosInstance.patch<ICustomer>(`/customers/${customerId}`, { status, updatedAt: new Date().toISOString() })
    return data
  },

  async getDashboardSummary(): Promise<AdminDashboardSummary> {
    const [{ data: sellers }, { data: customers }, { data: books }, { data: orders }, { data: listings }] = await Promise.all([
      axiosInstance.get<ISeller[]>('/sellers'),
      axiosInstance.get<ICustomer[]>('/customers'),
      axiosInstance.get<IBook[]>('/books'),
      axiosInstance.get<IOrder[]>('/orders'),
      axiosInstance.get<IListing[]>('/listings'),
    ])

    const recentBooks = await joinBooksWithSellers(
      [...books].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    )

    return {
      totalSellers: sellers.length,
      pendingSellers: sellers.filter((seller) => seller.status === SellerStatus.PENDING).length,
      approvedSellers: sellers.filter((seller) => seller.status === SellerStatus.APPROVED).length,
      rejectedSellers: sellers.filter((seller) => seller.status === SellerStatus.REJECTED).length,
      totalCustomers: customers.length,
      totalBooks: books.length,
      pendingBooks: books.filter((book) => book.status === BookStatus.PENDING).length,
      approvedBooks: books.filter((book) => book.status === BookStatus.APPROVED).length,
      rejectedBooks: books.filter((book) => book.status === BookStatus.REJECTED).length,
      totalOrders: orders.length,
      deliveredOrders: orders.filter((order) => order.status === OrderStatus.DELIVERED).length,
      cancelledOrders: orders.filter((order) => order.status === OrderStatus.CANCELLED).length,
      marketplaceRevenue: orders
        .filter((order) => order.status !== OrderStatus.CANCELLED)
        .reduce((sum, order) => sum + order.totalAmount, 0),
      totalListings: listings.length,
      activeListings: listings.filter((listing) => listing.isActive).length,
      outOfStockListings: listings.filter((listing) => listing.stock <= 0).length,
      recentSellers: [...sellers].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
      recentBooks,
      recentOrders: [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    }
  },
}
