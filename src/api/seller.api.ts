import { axiosInstance } from './axiosInstance'
import { API_BASE_URL } from '@/utils/constants'
import { BookStatus } from '@/enums/book-status.enum'
import { OrderStatus } from '@/enums/order-status.enum'
import { SellerStatus } from '@/enums/seller-status.enum'
import { SellerListingSort, SellerOrderSort } from '@/enums/seller-sort.enum'
import type { IBook } from '@/interfaces/book.interface'
import type { ICustomer } from '@/interfaces/customer.interface'
import type { IListing } from '@/interfaces/listing.interface'
import type { IOrder, IOrderItem, IShippingAddress } from '@/interfaces/order.interface'
import type { PaginatedResult } from '@/interfaces/pagination.interface'
import type {
  SellerDashboardSummary,
  SellerListParams,
  SellerListingDetailed,
  SellerOrderItemDetailed,
  SellerOrdersParams,
  CreateBookRequestPayload,
  CreateListingPayload,
  UpdateListingPayload,
} from '@/interfaces/seller-api.interface'

export type { SellerListingDetailed } from '@/interfaces/seller-api.interface'

type IdLike =
  | string
  | {
      _id?: string
      id?: string
    }
  | null
  | undefined

type CategoryLike =
  | string
  | {
      _id?: string
      id?: string
      name?: string
    }
  | null
  | undefined

interface BackendPaginated<T> {
  data: T[]
  meta?: {
    total?: number
    page?: number
    limit?: number
    totalPages?: number
  }
}

interface BackendBook {
  _id?: string
  id?: string
  isbn?: string
  title?: string
  author?: string
  authorImage?: string
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

interface BackendListing {
  _id?: string
  id?: string
  bookId?: IdLike | BackendBook
  sellerId?: IdLike
  price?: number
  stock?: number
  mrp?: number
  isActive?: boolean
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
  status?: string
  createdAt?: string
  updatedAt?: string
}

interface BackendOrder {
  _id?: string
  id?: string
  customerId?: IdLike
  shippingAddress?: Partial<IShippingAddress>
  totalAmount?: number
  status?: OrderStatus
  createdAt?: string
  updatedAt?: string
}

interface BackendOrderItem {
  _id?: string
  id?: string
  orderId?: IdLike | BackendOrder
  listingId?: IdLike
  bookId?: IdLike
  sellerId?: IdLike
  bookTitle?: string
  sellerName?: string
  priceAtPurchase?: number
  quantity?: number
  subtotal?: number
  status?: OrderStatus
  coverImage?: string
  createdAt?: string
  updatedAt?: string
  order?: BackendOrder
  customer?: BackendCustomer
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object'

const getId = (value: IdLike | BackendBook | BackendListing | BackendOrder | BackendOrderItem): string => {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value.id || value._id || ''
}

const getCategoryName = (value: CategoryLike): string | undefined => {
  if (!value) return undefined
  if (typeof value === 'string') return value
  return value.name || value.id || value._id
}

const getArrayFromResponse = <T>(response: T[] | BackendPaginated<T>): T[] => {
  if (Array.isArray(response)) return response
  return Array.isArray(response.data) ? response.data : []
}

const isObjectId = (value: string) => /^[a-f\d]{24}$/i.test(value)

const getBookImageUrl = (bookId: string, book: BackendBook): string => {
  if (book.coverImage) return book.coverImage

  if (Array.isArray(book.images) && book.images.length > 0) {
    return `${API_BASE_URL}/books/${bookId}/images/0`
  }

  return ''
}

const normalizeBook = (book: BackendBook): IBook => {
  const id = getId(book)

  return {
    id,
    isbn: book.isbn || '',
    title: book.title || 'Untitled Book',
    author: book.author || 'Unknown Author',
    authorImage: book.authorImage,
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

const normalizeListing = (listing: BackendListing): IListing => {
  return {
    id: getId(listing),
    bookId: getId(listing.bookId as IdLike | BackendBook),
    sellerId: getId(listing.sellerId),
    price: Number(listing.price || 0),
    stock: Number(listing.stock || 0),
    mrp: Number(listing.mrp || listing.price || 0),
    isActive: listing.isActive !== false,
    createdAt: listing.createdAt || '',
    updatedAt: listing.updatedAt || '',
  }
}

const normalizeListingDetailed = (listing: BackendListing): SellerListingDetailed => {
  const book =
    isObject(listing.bookId) && ('title' in listing.bookId || 'isbn' in listing.bookId)
      ? normalizeBook(listing.bookId as BackendBook)
      : normalizeBook({
          _id: getId(listing.bookId as IdLike),
          title: 'Book',
          author: '',
          isbn: '',
          description: '',
          status: BookStatus.APPROVED,
        })

  return {
    ...normalizeListing(listing),
    book,
  }
}

const normalizeCustomer = (customer?: BackendCustomer): ICustomer | undefined => {
  if (!customer) return undefined

  return {
    id: getId(customer),
    userId: getId(customer.userId),
    firstName: customer.firstName || '',
    lastName: customer.lastName || '',
    email: customer.email || '',
    mobileNumber: customer.mobileNumber,
    addressLine: customer.addressLine,
    city: customer.city,
    state: customer.state,
    pincode: customer.pincode,
    profileImage: customer.profileImage,
    status: (customer.status as ICustomer['status']) || 'ACTIVE',
    createdAt: customer.createdAt || '',
    updatedAt: customer.updatedAt,
  }
}

const emptyShippingAddress = (): IShippingAddress => ({
  fullName: '',
  mobileNumber: '',
  addressLine: '',
  city: '',
  state: '',
  pincode: '',
})

const normalizeOrder = (order?: BackendOrder): IOrder => {
  return {
    id: getId(order),
    customerId: getId(order?.customerId),
    shippingAddress: {
      ...emptyShippingAddress(),
      ...(order?.shippingAddress || {}),
    },
    totalAmount: Number(order?.totalAmount || 0),
    status: order?.status || OrderStatus.CREATED,
    createdAt: order?.createdAt || '',
  }
}

const normalizeOrderItem = (item: BackendOrderItem): IOrderItem => {
  return {
    id: getId(item),
    orderId: getId(item.orderId),
    listingId: getId(item.listingId),
    bookId: getId(item.bookId),
    sellerId: getId(item.sellerId),
    bookTitle: item.bookTitle || 'Book',
    sellerName: item.sellerName || 'Seller',
    priceAtPurchase: Number(item.priceAtPurchase || 0),
    quantity: Number(item.quantity || 0),
    subtotal: Number(item.subtotal || 0),
    status: item.status || OrderStatus.CREATED,
    createdAt: item.createdAt || '',
    coverImage: item.coverImage,
  }
}

const normalizeSellerOrderItem = (item: BackendOrderItem): SellerOrderItemDetailed => {
  const orderFromOrderId =
    isObject(item.orderId) && ('shippingAddress' in item.orderId || 'totalAmount' in item.orderId)
      ? (item.orderId as BackendOrder)
      : undefined

  return {
    ...normalizeOrderItem(item),
    order: normalizeOrder(item.order || orderFromOrderId),
    customer: normalizeCustomer(item.customer),
  }
}

const paginate = <T>(rows: T[], page = 1, limit = 8): PaginatedResult<T> => {
  const start = (page - 1) * limit
  return {
    data: rows.slice(start, start + limit),
    total: rows.length,
    page,
    limit,
  }
}

const sortListings = (rows: SellerListingDetailed[], sort = SellerListingSort.NEWEST) => {
  const sorted = [...rows]

  sorted.sort((a, b) => {
    switch (sort) {
      case SellerListingSort.TITLE_ASC:
        return a.book.title.localeCompare(b.book.title)

      case SellerListingSort.TITLE_DESC:
        return b.book.title.localeCompare(a.book.title)

      case SellerListingSort.PRICE_LOW_TO_HIGH:
        return a.price - b.price

      case SellerListingSort.PRICE_HIGH_TO_LOW:
        return b.price - a.price

      case SellerListingSort.STOCK_LOW_TO_HIGH:
        return a.stock - b.stock

      case SellerListingSort.STOCK_HIGH_TO_LOW:
        return b.stock - a.stock

      default:
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    }
  })

  return sorted
}

const sortOrders = (rows: SellerOrderItemDetailed[], sort = SellerOrderSort.NEWEST) => {
  const sorted = [...rows]

  sorted.sort((a, b) => {
    switch (sort) {
      case SellerOrderSort.OLDEST:
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()

      case SellerOrderSort.AMOUNT_HIGH_TO_LOW:
        return b.subtotal - a.subtotal

      case SellerOrderSort.AMOUNT_LOW_TO_HIGH:
        return a.subtotal - b.subtotal

      default:
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    }
  })

  return sorted
}

export const sellerApi = {
  async getApprovedBooks(): Promise<IBook[]> {
    const { data } = await axiosInstance.get<BackendBook[] | BackendPaginated<BackendBook>>('/books/approved')

    return getArrayFromResponse(data)
      .map(normalizeBook)
      .sort((a, b) => a.title.localeCompare(b.title))
  },

  async getListings(params: SellerListParams): Promise<PaginatedResult<SellerListingDetailed>> {
    /**
     * Backend route:
     * GET /seller/listings
     *
     * Seller identity comes from JWT token.
     */
    const { data } = await axiosInstance.get<BackendListing[] | BackendPaginated<BackendListing>>('/seller/listings')

    const joined = getArrayFromResponse(data).map(normalizeListingDetailed)

    const term = params.search?.trim().toLowerCase() ?? ''

    const filtered = term
      ? joined.filter((row) =>
          [row.book.title, row.book.author, row.book.isbn, row.book.category, row.book.status]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(term)),
        )
      : joined

    return paginate(sortListings(filtered, params.sort), params.page, params.limit)
  },

  async createListing(payload: CreateListingPayload): Promise<IListing> {
    /**
     * Backend route:
     * POST /seller/listings
     *
     * Do not send sellerId. Backend uses JWT user.
     */
    const { data } = await axiosInstance.post<BackendListing>('/seller/listings', {
      bookId: payload.bookId,
      price: Number(payload.price),
      mrp: Number(payload.mrp),
      stock: Number(payload.stock),
    })

    return normalizeListing(data)
  },

  async createBookRequest(payload: CreateBookRequestPayload): Promise<IBook> {
    /**
     * Backend route:
     * POST /seller/books
     *
     * Backend category is ObjectId. Your current form accepts text.
     * So we send category only when it looks like Mongo ObjectId.
     */
    const category = payload.category?.trim()

    const body: Record<string, string> = {
      isbn: payload.isbn.trim(),
      title: payload.title.trim(),
      author: payload.author.trim(),
      publisher: payload.publisher.trim(),
      description: payload.description.trim(),
    }

    if (payload.coverImage?.trim()) {
      body.coverImage = payload.coverImage.trim()
    }

    if (category && isObjectId(category)) {
      body.category = category
    }

    const { data } = await axiosInstance.post<BackendBook>('/seller/books', body)

    return normalizeBook(data)
  },

  async updateListing(payload: UpdateListingPayload): Promise<IListing> {
    /**
     * Backend route:
     * PATCH /seller/listings/:id
     */
    const { data } = await axiosInstance.patch<BackendListing>(`/seller/listings/${payload.listingId}`, {
      price: Number(payload.price),
      mrp: Number(payload.mrp),
      stock: Number(payload.stock),
      isActive: payload.isActive,
    })

    return normalizeListing(data)
  },

  async getOrders(params: SellerOrdersParams): Promise<PaginatedResult<SellerOrderItemDetailed>> {
    /**
     * Backend route:
     * GET /seller/orders
     */
    const { data } = await axiosInstance.get<BackendOrderItem[] | BackendPaginated<BackendOrderItem>>('/seller/orders')

    const rows = getArrayFromResponse(data).map(normalizeSellerOrderItem)

    const term = params.search?.trim().toLowerCase() ?? ''

    const filtered = rows.filter((row) => {
      const matchesStatus = params.status ? row.status === params.status : true

      const matchesSearch = term
        ? [
            row.bookTitle,
            row.orderId,
            row.id,
            row.customer?.firstName,
            row.customer?.lastName,
            row.order.shippingAddress.fullName,
          ]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(term))
        : true

      return matchesStatus && matchesSearch
    })

    return paginate(sortOrders(filtered, params.sort), params.page, params.limit)
  },

  async updateOrderItemStatus(_sellerId: string, orderItemId: string, status: OrderStatus): Promise<IOrderItem> {
    /**
     * Backend route:
     * PATCH /seller/orders/:id/status
     *
     * Seller identity comes from JWT.
     */
    const { data } = await axiosInstance.patch<BackendOrderItem>(`/seller/orders/${orderItemId}/status`, {
      status,
    })

    return normalizeOrderItem(data)
  },

  async getDashboardSummary(_sellerId: string): Promise<SellerDashboardSummary> {
    const [listingsResult, ordersResult] = await Promise.all([
      this.getListings({
        sellerId: '',
        page: 1,
        limit: 1000,
        sort: SellerListingSort.NEWEST,
      }),
      this.getOrders({
        sellerId: '',
        page: 1,
        limit: 1000,
        sort: SellerOrderSort.NEWEST,
      }),
    ])

    const listings = listingsResult.data
    const orderItems = ordersResult.data

    const deliveredRevenue = orderItems
      .filter((item) => item.status === OrderStatus.DELIVERED)
      .reduce((sum, item) => sum + item.subtotal, 0)

    return {
      totalListings: listings.length,
      activeListings: listings.filter((listing) => listing.isActive).length,
      totalStock: listings.reduce((sum, listing) => sum + listing.stock, 0),
      lowStockCount: listings.filter((listing) => listing.stock > 0 && listing.stock <= 5).length,

      /**
       * Backend does not currently expose "my pending requested books".
       * We keep this as 0 until a GET /seller/books endpoint is added.
       */
      pendingBooks: 0,

      totalOrders: orderItems.length,
      createdOrders: orderItems.filter((item) => item.status === OrderStatus.CREATED).length,
      revenue: deliveredRevenue,
      recentOrders: sortOrders(orderItems, SellerOrderSort.NEWEST).slice(0, 5),
      lowStockListings: sortListings(
        listings.filter((listing) => listing.stock <= 5),
        SellerListingSort.STOCK_LOW_TO_HIGH,
      ).slice(0, 5),
    }
  },
}