import { axiosInstance } from './axiosInstance'
import type { IOrderDetailed, IOrderItem, IShippingAddress } from '@/interfaces/order.interface'
import type { OrderStatus } from '@/enums/order-status.enum'

type BackendOrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'

interface BackendBook {
  _id?: string
  id?: string
  title?: string
  coverImage?: string
  author?: string
}

interface BackendOrderItem {
  _id?: string
  id?: string
  orderId?: string
  listingId?: string
  sellerId?: string
  quantity?: number
  priceAtPurchase?: number
  subtotal?: number
  status?: BackendOrderStatus
  createdAt?: string
  bookTitle?: string
  sellerName?: string
  coverImage?: string
  listing?: {
    _id?: string
    id?: string
    price?: number
    sellerId?: string | { _id?: string; id?: string; name?: string }
    bookId?: string | BackendBook
  } | null
  book?: BackendBook | null
}

interface BackendOrder {
  _id?: string
  id?: string
  customerId?: string
  shippingAddress?: IShippingAddress
  totalAmount?: number
  status?: BackendOrderStatus
  createdAt?: string
  items?: BackendOrderItem[]
}

const getId = (value: unknown): string => {
  if (!value) return ''

  if (typeof value === 'string') return value

  if (typeof value === 'object') {
    const candidate = value as { _id?: string; id?: string }
    return candidate._id || candidate.id || ''
  }

  return ''
}

const getApiOrigin = () =>
  (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1').replace(/\/api\/v\d+\/?$/, '')

const getAssetUrl = (value?: string): string => {
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value
  if (value.startsWith('data:')) return value

  const origin = getApiOrigin()
  return `${origin}${value.startsWith('/') ? value : `/${value}`}`
}

const normalizeOrderItem = (item: BackendOrderItem): IOrderItem => {
  const listingBook =
    item.listing && typeof item.listing.bookId === 'object'
      ? item.listing.bookId
      : null

  const book = item.book || listingBook

  const sellerId =
    typeof item.listing?.sellerId === 'string'
      ? item.listing.sellerId
      : getId(item.listing?.sellerId)

  return {
    id: item._id || item.id || '',
    orderId: item.orderId || '',
    listingId: item.listingId || getId(item.listing) || '',
    bookId: getId(book),
    sellerId,
    bookTitle: item.bookTitle || book?.title || 'Book',
    sellerName: item.sellerName || '',
    priceAtPurchase: item.priceAtPurchase ?? item.listing?.price ?? 0,
    quantity: item.quantity ?? 1,
    subtotal:
      item.subtotal ??
      (item.priceAtPurchase ?? item.listing?.price ?? 0) * (item.quantity ?? 1),
    status: (item.status as OrderStatus) || 'PENDING',
    createdAt: item.createdAt || '',
    coverImage: getAssetUrl(item.coverImage || book?.coverImage),
  }
}

const normalizeOrder = (order: BackendOrder): IOrderDetailed => {
  const items = Array.isArray(order.items) ? order.items.map(normalizeOrderItem) : []

  return {
    id: order._id || order.id || '',
    customerId: order.customerId || '',
    shippingAddress: order.shippingAddress || {
      fullName: '',
      mobileNumber: '',
      addressLine: '',
      city: '',
      state: '',
      pincode: '',
    },
    totalAmount: order.totalAmount ?? items.reduce((sum, item) => sum + item.subtotal, 0),
    status: (order.status as OrderStatus) || 'PENDING',
    createdAt: order.createdAt || '',
    items,
  }
}

export const ordersApi = {
  async getOrders(customerId?: string): Promise<IOrderDetailed[]> {
    const response = await axiosInstance.get<BackendOrder[]>('/customer/orders', {
      params: { customerId },
    })
    return (response.data || []).map(normalizeOrder)
  },

  async placeOrder(payload: { shippingAddress: IShippingAddress }, customerId?: string): Promise<IOrderDetailed> {
    const response = await axiosInstance.post<BackendOrder | { order: BackendOrder }>('/customer/orders', payload, {
      params: { customerId },
    })
    const order = 'order' in response.data ? response.data.order : response.data
    return normalizeOrder(order)
  },

  async cancelOrder(orderId: string, customerId?: string): Promise<IOrderDetailed> {
    const response = await axiosInstance.patch<BackendOrder>(`/customer/orders/${orderId}/cancel`, undefined, {
      params: { customerId },
    })
    return normalizeOrder(response.data)
  },
}
