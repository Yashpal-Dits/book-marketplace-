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
  UpdateBookCatalogPayload,
} from '@/interfaces/admin-api.interface'

type IdLike =
  | string
  | { _id?: string; id?: string }
  | null
  | undefined

type CategoryLike =
  | string
  | { _id?: string; id?: string; name?: string }
  | null
  | undefined

interface BackendSeller {
  _id?: string
  id?: string
  userId?: IdLike
  businessName?: string
  contactPerson?: string
  email?: string
  mobileNumber?: string
  status?: SellerStatus
  businessAddress?: string
  city?: string
  state?: string
  pincode?: string
  storeLogo?: string
  createdAt?: string
  updatedAt?: string
}

interface BackendCustomer {
  _id?: string
  id?: string
  userId?: IdLike
  firstName?: string
  lastName?: string
  email?: string
  mobileNumber?: string
  addressLine?: string
  city?: string
  state?: string
  pincode?: string
  profileImage?: string
  status?: CustomerStatus
  createdAt?: string
  updatedAt?: string
}

interface BackendBook {
  _id?: string
  id?: string
  isbn?: string
  title?: string
  author?: string
  publisher?: string
  description?: string
  coverImage?: string
  images?: unknown[]
  category?: CategoryLike
  status?: BookStatus
  createdBySellerId?: IdLike
  createdAt?: string
  updatedAt?: string
  rating?: number
  minPrice?: number | null
  mrp?: number | null
  totalStock?: number
}

interface BackendOrder {
  _id?: string
  id?: string
  customerId?: IdLike
  shippingAddress?: {
    fullName?: string
    mobileNumber?: string
    addressLine?: string
    city?: string
    state?: string
    pincode?: string
  }
  totalAmount?: number
  status?: OrderStatus
  createdAt?: string
  updatedAt?: string
}

const getId = (value: IdLike | BackendSeller | BackendCustomer | BackendBook): string => {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value.id || value._id || ''
}

const getCategoryName = (value: CategoryLike): string | undefined => {
  if (!value) return undefined
  if (typeof value === 'string') return value
  return value.name || value.id || value._id
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

const getApiOrigin = () => API_BASE.replace(/\/api\/v\d+\/?$/, '')

const getAssetUrl = (value?: string): string => {
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value
  if (value.startsWith('data:')) return value
  const origin = getApiOrigin()
  return `${origin}${value.startsWith('/') ? value : `/${value}`}`
}

const getBookImageUrl = (bookId: string, book: BackendBook): string => {
  if (book.coverImage) return getAssetUrl(book.coverImage)
  if (Array.isArray(book.images) && book.images.length > 0) {
    return `${API_BASE}/books/${bookId}/images/0`
  }
  return ''
}

const normalizeSeller = (seller?: BackendSeller): ISeller => {
  return {
    id: getId(seller),
    userId: getId(seller?.userId),
    businessName: seller?.businessName || 'Marketplace Seller',
    contactPerson: seller?.contactPerson || '',
    email: seller?.email || '',
    mobileNumber: seller?.mobileNumber || '',
    status: seller?.status || SellerStatus.APPROVED,
    businessAddress: seller?.businessAddress,
    city: seller?.city,
    state: seller?.state,
    pincode: seller?.pincode,
    storeLogo: seller?.storeLogo,
    createdAt: seller?.createdAt || '',
    updatedAt: seller?.updatedAt,
  }
}

const normalizeCustomer = (customer?: BackendCustomer): ICustomer => {
  return {
    id: getId(customer),
    userId: getId(customer?.userId),
    firstName: customer?.firstName || '',
    lastName: customer?.lastName || '',
    email: customer?.email || '',
    mobileNumber: customer?.mobileNumber,
    addressLine: customer?.addressLine,
    city: customer?.city,
    state: customer?.state,
    pincode: customer?.pincode,
    profileImage: customer?.profileImage,
    status: (customer?.status as ICustomer['status']) || 'ACTIVE',
    createdAt: customer?.createdAt || '',
    updatedAt: customer?.updatedAt,
  }
}

const normalizeBook = (book: BackendBook): IBook => {
  const id = getId(book)
  return {
    id,
    isbn: book.isbn || '',
    title: book.title || 'Untitled Book',
    author: book.author || 'Unknown Author',
    publisher: book.publisher || '',
    description: book.description || '',
    coverImage: getBookImageUrl(id, book),
    category: getCategoryName(book.category),
    status: book.status || BookStatus.APPROVED,
    createdBySellerId: getId(book.createdBySellerId) || undefined,
    createdAt: book.createdAt || '',
    updatedAt: book.updatedAt,
    rating: typeof book.rating === 'number' ? book.rating : 0,
    minPrice: typeof book.minPrice === 'number' ? book.minPrice : null,
    mrp: typeof book.mrp === 'number' ? book.mrp : null,
    totalStock: typeof book.totalStock === 'number' ? book.totalStock : 0,
  }
}

const normalizeBookWithSeller = (book: BackendBook): AdminBookDetailed => {
  const id = getId(book)
  const normalized = normalizeBook(book)

  // createdBySellerId may be populated with the full seller document.
  const sellerRaw = book.createdBySellerId as BackendSeller | undefined
  const seller =
    sellerRaw && typeof sellerRaw === 'object' && ('businessName' in sellerRaw || 'email' in sellerRaw)
      ? normalizeSeller(sellerRaw)
      : undefined

  return { ...normalized, seller }
}

const normalizeOrder = (order: BackendOrder): IOrder => {
  return {
    id: getId(order),
    customerId: getId(order.customerId),
    shippingAddress: {
      fullName: order.shippingAddress?.fullName || '',
      mobileNumber: order.shippingAddress?.mobileNumber || '',
      addressLine: order.shippingAddress?.addressLine || '',
      city: order.shippingAddress?.city || '',
      state: order.shippingAddress?.state || '',
      pincode: order.shippingAddress?.pincode || '',
    },
    totalAmount: Number(order.totalAmount || 0),
    status: (order.status as IOrder['status']) || OrderStatus.CREATED,
    createdAt: order.createdAt || '',
    updatedAt: order.updatedAt,
  }
}

/**
 * The response interceptor unwraps the backend envelope.
 * For paginated endpoints the interceptor turns the body into:
 *   { data: T[], meta: { total, page, limit, totalPages } }
 * For non-paginated endpoints it becomes the raw array/object.
 */
const extractArray = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === 'object' && Array.isArray((payload as any).data)) {
    return (payload as any).data as T[]
  }
  return []
}

const extractMetaTotal = (payload: unknown, fallback: number): number => {
  if (payload && typeof payload === 'object' && (payload as any).meta?.total != null) {
    return Number((payload as any).meta.total)
  }
  return fallback
}

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

export const adminApi = {
  async getDashboardSummary(): Promise<AdminDashboardSummary> {
    const { data } = await axiosInstance.get<AdminDashboardSummary>('/admin/dashboard')

    const normalizeList = <T, R>(raw: unknown, normalize: (item: any) => R): R[] =>
      extractArray<T>(raw).map(normalize)

    const recentSellers = normalizeList<BackendSeller, ISeller>(
      (data as any).recentSellers,
      normalizeSeller,
    )
    const recentBooks = normalizeList<BackendBook, AdminBookDetailed>(
      (data as any).recentBooks,
      normalizeBookWithSeller,
    )
    const recentOrders = normalizeList<BackendOrder, IOrder>(
      (data as any).recentOrders,
      normalizeOrder,
    )

    return {
      totalSellers: (data as any).totalSellers ?? 0,
      pendingSellers: (data as any).pendingSellers ?? 0,
      approvedSellers: (data as any).approvedSellers ?? 0,
      rejectedSellers: (data as any).rejectedSellers ?? 0,
      totalCustomers: (data as any).totalCustomers ?? 0,
      totalBooks: (data as any).totalBooks ?? 0,
      pendingBooks: (data as any).pendingBooks ?? 0,
      approvedBooks: (data as any).approvedBooks ?? 0,
      rejectedBooks: (data as any).rejectedBooks ?? 0,
      totalOrders: (data as any).totalOrders ?? 0,
      deliveredOrders: (data as any).deliveredOrders ?? 0,
      cancelledOrders: (data as any).cancelledOrders ?? 0,
      marketplaceRevenue: (data as any).marketplaceRevenue ?? 0,
      totalListings: (data as any).totalListings ?? 0,
      activeListings: (data as any).activeListings ?? 0,
      outOfStockListings: (data as any).outOfStockListings ?? 0,
      recentSellers,
      recentBooks,
      recentOrders,
    }
  },

  async getSellers({
    page = 1,
    limit = 8,
    search = '',
    sort = AdminSellerSort.NEWEST,
    status,
  }: AdminSellerParams = {}): Promise<PaginatedResult<ISeller>> {
    const { sort: _sort, order: _order } = sellerSortMap[sort]
    const params: Record<string, string | number> = { page, limit }
    if (search.trim()) params.search = search.trim()
    if (status) params.status = status

    const { data } = await axiosInstance.get<ISeller[]>('/admin/sellers', { params })
    const rows = extractArray<BackendSeller>(data).map(normalizeSeller)
    const total = extractMetaTotal(data, rows.length)

    return { data: rows, total, page, limit }
  },

  async updateSellerStatus(sellerId: string, status: SellerStatus): Promise<ISeller> {
    const endpoint = status === SellerStatus.APPROVED ? 'approve' : 'reject'
    const { data } = await axiosInstance.patch<BackendSeller>(
      `/admin/sellers/${sellerId}/${endpoint}`,
    )
    return normalizeSeller(data)
  },

  async getBooks({
    page = 1,
    limit = 8,
    search = '',
    sort = AdminBookSort.NEWEST,
    status,
  }: AdminBookParams = {}): Promise<PaginatedResult<AdminBookDetailed>> {
    const { sort: _sort, order: _order } = bookSortMap[sort]
    const params: Record<string, string | number> = { page, limit }
    if (search.trim()) params.search = search.trim()
    if (status) params.status = status

    const { data } = await axiosInstance.get<IBook[]>('/admin/books', { params })
    const rows = extractArray<BackendBook>(data).map(normalizeBookWithSeller)
    const total = extractMetaTotal(data, rows.length)

    return { data: rows, total, page, limit }
  },

  async updateBookStatus(bookId: string, status: BookStatus): Promise<IBook> {
    const endpoint = status === BookStatus.APPROVED ? 'approve' : 'reject'
    const { data } = await axiosInstance.patch<BackendBook>(`/admin/books/${bookId}/${endpoint}`)
    return normalizeBook(data)
  },

  async updateBookCatalog(bookId: string, payload: UpdateBookCatalogPayload): Promise<IBook> {
    const isbn = payload.isbn.trim()
    const { data: existing } = await axiosInstance.get<IBook[]>('/admin/books', {
      params: { isbn },
    })
    const duplicate = extractArray<IBook>(existing).find((book) => book.id !== bookId)
    if (duplicate) throw new Error('A book with this ISBN already exists')

    const { data } = await axiosInstance.patch<BackendBook>(`/admin/books/${bookId}/catalog`, {
      isbn,
      title: payload.title.trim(),
      author: payload.author.trim(),
      publisher: payload.publisher.trim(),
      description: payload.description.trim(),
      coverImage: payload.coverImage?.trim() || '',
      category: payload.category.trim(),
    })
    return normalizeBook(data)
  },

  async deleteBook(bookId: string): Promise<void> {
    await axiosInstance.delete(`/admin/books/${bookId}`)
  },

  async getCustomers({
    page = 1,
    limit = 10,
    search = '',
    status,
  }: AdminCustomerParams = {}): Promise<PaginatedResult<AdminCustomerDetailed>> {
    const params: Record<string, string | number> = { page, limit }
    if (search.trim()) params.search = search.trim()
    if (status) params.status = status

    const { data } = await axiosInstance.get<ICustomer[]>('/admin/customers', { params })
    const rows = extractArray<BackendCustomer>(data).map(normalizeCustomer)
    const total = extractMetaTotal(data, rows.length)

    const { data: ordersRaw } = await axiosInstance.get<IOrder[]>('/orders')
    const orders = extractArray<BackendOrder>(ordersRaw).map(normalizeOrder)
    const ordersCountByCustomer = new Map<string, number>()
    orders.forEach((order) => {
      ordersCountByCustomer.set(
        order.customerId,
        (ordersCountByCustomer.get(order.customerId) ?? 0) + 1,
      )
    })

    const data2 = rows.map((customer): AdminCustomerDetailed => ({
      ...customer,
      ordersCount: ordersCountByCustomer.get(customer.id) ?? 0,
    }))

    return { data: data2, total, page, limit }
  },

  async updateCustomerStatus(customerId: string, status: CustomerStatus): Promise<ICustomer> {
    const endpoint = status === CustomerStatus.ACTIVE ? 'activate' : 'block'
    const { data } = await axiosInstance.patch<BackendCustomer>(
      `/admin/customers/${customerId}/${endpoint}`,
    )
    return normalizeCustomer(data)
  },
}
