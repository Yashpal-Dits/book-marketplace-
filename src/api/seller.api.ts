import { axiosInstance } from './axiosInstance'
import { BookStatus } from '@/enums/book-status.enum'
import { OrderStatus } from '@/enums/order-status.enum'
import { SellerStatus } from '@/enums/seller-status.enum'
import { SellerListingSort, SellerOrderSort } from '@/enums/seller-sort.enum'
import type { IBook } from '@/interfaces/book.interface'
import type { ICustomer } from '@/interfaces/customer.interface'
import type { IListing } from '@/interfaces/listing.interface'
import type { IOrder, IOrderItem } from '@/interfaces/order.interface'
import type { PaginatedResult } from '@/interfaces/pagination.interface'
import type { ISeller } from '@/interfaces/seller.interface'
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
import { generateId } from '@/utils/generateId'
import { syncBookAggregates } from '@/utils/syncBookAggregates'

export type { SellerListingDetailed } from '@/interfaces/seller-api.interface'

const paginate = <T>(rows: T[], page = 1, limit = 8): PaginatedResult<T> => {
  const start = (page - 1) * limit
  return { data: rows.slice(start, start + limit), total: rows.length, page, limit }
}

const assertApprovedSeller = async (sellerId: string) => {
  const { data: seller } = await axiosInstance.get<ISeller>(`/sellers/${sellerId}`)
  if (seller.status !== SellerStatus.APPROVED) throw new Error('Only approved sellers can manage listings')
}

const joinListingsWithBooks = async (listings: IListing[]): Promise<SellerListingDetailed[]> => {
  const rows = await Promise.all(
    listings.map(async (listing) => {
      try {
        const { data: book } = await axiosInstance.get<IBook>(`/books/${listing.bookId}`)
        return { ...listing, book }
      } catch {
        return null
      }
    }),
  )
  return rows.filter((row): row is SellerListingDetailed => row !== null)
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
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })
  return sorted
}

const joinSellerOrderItems = async (items: IOrderItem[]): Promise<SellerOrderItemDetailed[]> => {
  const rows = await Promise.all(
    items.map(async (item): Promise<SellerOrderItemDetailed | null> => {
      try {
        const { data: order } = await axiosInstance.get<IOrder>(`/orders/${item.orderId}`)
        const { data: customers } = await axiosInstance.get<ICustomer[]>('/customers', {
          params: { id: order.customerId },
        })
        return { ...item, order, customer: customers[0] }
      } catch {
        return null
      }
    }),
  )
  return rows.filter((row): row is SellerOrderItemDetailed => row !== null)
}

const sortOrders = (rows: SellerOrderItemDetailed[], sort = SellerOrderSort.NEWEST) => {
  const sorted = [...rows]
  sorted.sort((a, b) => {
    switch (sort) {
      case SellerOrderSort.OLDEST:
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case SellerOrderSort.AMOUNT_HIGH_TO_LOW:
        return b.subtotal - a.subtotal
      case SellerOrderSort.AMOUNT_LOW_TO_HIGH:
        return a.subtotal - b.subtotal
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })
  return sorted
}

export const sellerApi = {
  async getApprovedBooks(): Promise<IBook[]> {
    const { data } = await axiosInstance.get<IBook[]>('/books', {
      params: { status: BookStatus.APPROVED, _sort: 'title', _order: 'asc' },
    })
    return data
  },

  async getListings(params: SellerListParams): Promise<PaginatedResult<SellerListingDetailed>> {
    const { data: listings } = await axiosInstance.get<IListing[]>('/listings', {
      params: { sellerId: params.sellerId },
    })
    const joined = await joinListingsWithBooks(listings)
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
    await assertApprovedSeller(payload.sellerId)
    const { data: book } = await axiosInstance.get<IBook>(`/books/${payload.bookId}`)
    if (book.status !== BookStatus.APPROVED) throw new Error('You can create listings only for approved books')

    const { data: existing } = await axiosInstance.get<IListing[]>('/listings', {
      params: { sellerId: payload.sellerId, bookId: payload.bookId },
    })
    if (existing.length) throw new Error('You already have a listing for this book. Update that listing instead.')

    const now = new Date().toISOString()
    const listing: IListing = {
      id: generateId('listing'),
      sellerId: payload.sellerId,
      bookId: payload.bookId,
      price: Number(payload.price),
      mrp: Number(payload.mrp),
      stock: Number(payload.stock),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }
    const { data } = await axiosInstance.post<IListing>('/listings', listing)
    await syncBookAggregates(payload.bookId)
    return data
  },

  async createBookRequest(payload: CreateBookRequestPayload): Promise<IBook> {
    await assertApprovedSeller(payload.sellerId)
    const isbn = payload.isbn.trim()
    const { data: existing } = await axiosInstance.get<IBook[]>('/books', { params: { isbn } })
    if (existing.length) throw new Error('A book with this ISBN already exists. Select it from approved books if it is approved.')

    const now = new Date().toISOString()
    const book: IBook = {
      id: generateId('book'),
      isbn,
      title: payload.title.trim(),
      author: payload.author.trim(),
      publisher: payload.publisher.trim(),
      description: payload.description.trim(),
      coverImage: payload.coverImage?.trim() || '',
      category: payload.category.trim(),
      status: BookStatus.PENDING,
      createdBySellerId: payload.sellerId,
      createdAt: now,
      rating: 0,
      minPrice: null,
      mrp: null,
      totalStock: 0,
    }
    const { data } = await axiosInstance.post<IBook>('/books', book)
    return data
  },

  async updateListing(payload: UpdateListingPayload): Promise<IListing> {
    const { data: listing } = await axiosInstance.get<IListing>(`/listings/${payload.listingId}`)
    if (listing.sellerId !== payload.sellerId) throw new Error("You cannot modify another seller's listing")

    const { data } = await axiosInstance.patch<IListing>(`/listings/${payload.listingId}`, {
      price: Number(payload.price),
      mrp: Number(payload.mrp),
      stock: Number(payload.stock),
      isActive: payload.isActive,
      updatedAt: new Date().toISOString(),
    })
    await syncBookAggregates(listing.bookId)
    return data
  },

  async getOrders(params: SellerOrdersParams): Promise<PaginatedResult<SellerOrderItemDetailed>> {
    const { data: items } = await axiosInstance.get<IOrderItem[]>('/orderItems', {
      params: { sellerId: params.sellerId },
    })
    const joined = await joinSellerOrderItems(items)
    const term = params.search?.trim().toLowerCase() ?? ''
    const filtered = joined.filter((row) => {
      const matchesStatus = params.status ? row.status === params.status : true
      const matchesSearch = term
        ? [row.bookTitle, row.orderId, row.customer?.firstName, row.customer?.lastName, row.order.shippingAddress.fullName]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(term))
        : true
      return matchesStatus && matchesSearch
    })
    return paginate(sortOrders(filtered, params.sort), params.page, params.limit)
  },

  async updateOrderItemStatus(sellerId: string, orderItemId: string, status: OrderStatus): Promise<IOrderItem> {
    const { data: item } = await axiosInstance.get<IOrderItem>(`/orderItems/${orderItemId}`)
    if (item.sellerId !== sellerId) throw new Error("You cannot update another seller's order")
    if (item.status === OrderStatus.DELIVERED || item.status === OrderStatus.CANCELLED) {
      throw new Error('Completed or cancelled orders cannot be changed')
    }
    if (status === OrderStatus.CANCELLED && item.status === OrderStatus.SHIPPED) {
      throw new Error('An order cannot be cancelled after shipment')
    }

    const { data } = await axiosInstance.patch<IOrderItem>(`/orderItems/${orderItemId}`, { status })

    const { data: orderItems } = await axiosInstance.get<IOrderItem[]>('/orderItems', { params: { orderId: item.orderId } })
    const statuses = orderItems.map((row) => (row.id === orderItemId ? status : row.status))
    const parentStatus = statuses.every((s) => s === OrderStatus.CANCELLED)
      ? OrderStatus.CANCELLED
      : statuses.every((s) => s === OrderStatus.DELIVERED)
        ? OrderStatus.DELIVERED
        : statuses.includes(OrderStatus.SHIPPED)
          ? OrderStatus.SHIPPED
          : statuses.includes(OrderStatus.ACCEPTED)
            ? OrderStatus.ACCEPTED
            : OrderStatus.CREATED
    await axiosInstance.patch(`/orders/${item.orderId}`, { status: parentStatus })
    return data
  },

  async getDashboardSummary(sellerId: string): Promise<SellerDashboardSummary> {
    const [{ data: listings }, { data: orderItems }, { data: pendingBooks }] = await Promise.all([
      axiosInstance.get<IListing[]>('/listings', { params: { sellerId } }),
      axiosInstance.get<IOrderItem[]>('/orderItems', { params: { sellerId } }),
      axiosInstance.get<IBook[]>('/books', { params: { createdBySellerId: sellerId, status: BookStatus.PENDING } }),
    ])
    const joinedListings = await joinListingsWithBooks(listings)
    const joinedOrders = await joinSellerOrderItems(orderItems)
    const deliveredRevenue = orderItems
      .filter((item) => item.status === OrderStatus.DELIVERED)
      .reduce((sum, item) => sum + item.subtotal, 0)

    return {
      totalListings: listings.length,
      activeListings: listings.filter((listing) => listing.isActive).length,
      totalStock: listings.reduce((sum, listing) => sum + listing.stock, 0),
      lowStockCount: listings.filter((listing) => listing.stock > 0 && listing.stock <= 5).length,
      pendingBooks: pendingBooks.length,
      totalOrders: orderItems.length,
      createdOrders: orderItems.filter((item) => item.status === OrderStatus.CREATED).length,
      revenue: deliveredRevenue,
      recentOrders: sortOrders(joinedOrders, SellerOrderSort.NEWEST).slice(0, 5),
      lowStockListings: sortListings(
        joinedListings.filter((listing) => listing.stock <= 5),
        SellerListingSort.STOCK_LOW_TO_HIGH,
      ).slice(0, 5),
    }
  },
}
