import { axiosInstance } from './axiosInstance'
import { AdminBookSort, AdminSellerSort } from '@/enums/admin-sort.enum'
import { BookStatus } from '@/enums/book-status.enum'
import { CustomerStatus } from '@/enums/customer-status.enum'
import { OrderStatus } from '@/enums/order-status.enum'
import { SellerStatus } from '@/enums/seller-status.enum'
import type { IBook } from '@/interfaces/book.interface'
import type { ICustomer } from '@/interfaces/customer.interface'
import type { IOrder } from '@/interfaces/order.interface'
import type { PaginatedResult } from '@/interfaces/pagination.interface'
import type { ISeller } from '@/interfaces/seller.interface'
import type { SafeUser } from '@/interfaces/user.interface'
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
  ordersCount?: number
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

interface BackendAdminUser {
  _id?: string
  id?: string
  firstName?: string
  lastName?: string
  email?: string
  role?: SafeUser['role']
  mobileNumber?: string
  profileImage?: string
  createdAt?: string
  updatedAt?: string
}

interface BackendDashboardSummary {
  totalSellers?: number
  pendingSellers?: number
  approvedSellers?: number
  rejectedSellers?: number
  totalCustomers?: number
  totalBooks?: number
  pendingBooks?: number
  approvedBooks?: number
  rejectedBooks?: number
  totalOrders?: number
  deliveredOrders?: number
  cancelledOrders?: number
  marketplaceRevenue?: number
  totalListings?: number
  activeListings?: number
  outOfStockListings?: number
  recentSellers?: BackendSeller[]
  recentBooks?: BackendBook[]
  recentOrders?: BackendOrder[]
}

export interface AdminProfilePayload {
  firstName: string
  lastName: string
  mobileNumber?: string
  profileImage?: string
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
    storeLogo: seller?.storeLogo ? getAssetUrl(seller.storeLogo) : undefined,
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
    profileImage: customer?.profileImage ? getAssetUrl(customer.profileImage) : undefined,
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
    categoryDetails:
      book.category && typeof book.category === 'object'
        ? {
            id: getId(book.category),
            name: book.category.name || 'Unnamed Category',
            isActive: true,
          }
        : undefined,
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

const normalizeAdminUser = (user: BackendAdminUser): SafeUser => ({
  id: getId(user),
  firstName: user.firstName || '',
  lastName: user.lastName || '',
  email: user.email || '',
  role: user.role!,
  mobileNumber: user.mobileNumber,
  profileImage: user.profileImage ? getAssetUrl(user.profileImage) : undefined,
  createdAt: user.createdAt || '',
  updatedAt: user.updatedAt,
})

/**
 * The response interceptor unwraps the backend envelope.
 * For paginated endpoints the interceptor turns the body into:
 *   { data: T[], meta: { total, page, limit, totalPages } }
 * For non-paginated endpoints it becomes the raw array/object.
 */
const extractArray = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === 'object') {
    const candidate = payload as { data?: unknown }
    if (Array.isArray(candidate.data)) return candidate.data as T[]
  }
  return []
}

const extractMetaTotal = (payload: unknown, fallback: number): number => {
  if (payload && typeof payload === 'object') {
    const candidate = payload as { meta?: { total?: unknown } }
    if (candidate.meta?.total != null) return Number(candidate.meta.total)
  }
  return fallback
}

export const adminApi = {
  async getDashboardSummary(): Promise<AdminDashboardSummary> {
    const { data } = await axiosInstance.get<BackendDashboardSummary>('/admin/dashboard')

    const normalizeList = <T, R>(raw: unknown, normalize: (item: T) => R): R[] =>
      extractArray<T>(raw).map(normalize)

    const recentSellers = normalizeList<BackendSeller, ISeller>(
      data.recentSellers,
      normalizeSeller,
    )
    const recentBooks = normalizeList<BackendBook, AdminBookDetailed>(
      data.recentBooks,
      normalizeBookWithSeller,
    )
    const recentOrders = normalizeList<BackendOrder, IOrder>(
      data.recentOrders,
      normalizeOrder,
    )

    return {
      totalSellers: data.totalSellers ?? 0,
      pendingSellers: data.pendingSellers ?? 0,
      approvedSellers: data.approvedSellers ?? 0,
      rejectedSellers: data.rejectedSellers ?? 0,
      totalCustomers: data.totalCustomers ?? 0,
      totalBooks: data.totalBooks ?? 0,
      pendingBooks: data.pendingBooks ?? 0,
      approvedBooks: data.approvedBooks ?? 0,
      rejectedBooks: data.rejectedBooks ?? 0,
      totalOrders: data.totalOrders ?? 0,
      deliveredOrders: data.deliveredOrders ?? 0,
      cancelledOrders: data.cancelledOrders ?? 0,
      marketplaceRevenue: data.marketplaceRevenue ?? 0,
      totalListings: data.totalListings ?? 0,
      activeListings: data.activeListings ?? 0,
      outOfStockListings: data.outOfStockListings ?? 0,
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
    const params: Record<string, string | number> = { page, limit }
    if (search.trim()) params.search = search.trim()
    if (status) params.status = status
    params.sort = sort

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
    const params: Record<string, string | number> = { page, limit }
    if (search.trim()) params.search = search.trim()
    if (status) params.status = status
    params.sort = sort

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
    const { data: existing } = await axiosInstance.get<BackendBook[]>('/admin/books', {
      params: { isbn },
    })
    const duplicate = extractArray<BackendBook>(existing).find((book) => getId(book) !== bookId)
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
    const rawRows = extractArray<BackendCustomer>(data)
    const rows = rawRows.map((customer): AdminCustomerDetailed => ({
      ...normalizeCustomer(customer),
      ordersCount: Number(customer.ordersCount || 0),
    }))
    const total = extractMetaTotal(data, rows.length)

    return { data: rows, total, page, limit }
  },

  async updateCustomerStatus(customerId: string, status: CustomerStatus): Promise<ICustomer> {
    const { data } = await axiosInstance.patch<BackendCustomer>(
      `/admin/customers/${customerId}/status`,
      { status },
    )
    return normalizeCustomer(data)
  },

  async getProfile(): Promise<SafeUser> {
    const { data } = await axiosInstance.get<BackendAdminUser>('/admin/profile')
    return normalizeAdminUser(data)
  },

  async updateProfile(payload: AdminProfilePayload): Promise<SafeUser> {
    const { data } = await axiosInstance.patch<BackendAdminUser>('/admin/profile', payload)
    return normalizeAdminUser(data)
  },
}
