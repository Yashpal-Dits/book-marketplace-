import { axiosInstance } from './axiosInstance'
import { API_BASE_URL } from '@/utils/constants'
import { BookStatus } from '@/enums/book-status.enum'
import { SellerStatus } from '@/enums/seller-status.enum'
import type { AddToCartPayload } from '@/interfaces'
import type { IBook } from '@/interfaces/book.interface'
import type { ICartItem, ICartItemDetailed } from '@/interfaces/cart.interface'
import type { IListing } from '@/interfaces/listing.interface'
import type { ISeller } from '@/interfaces/seller.interface'

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

interface BackendCartResponse {
  _id?: string
  customerId?: string
  items?: BackendCartItem[]
  totalItems?: number
  subtotal?: number
  createdAt?: string
  updatedAt?: string
}

interface BackendCartItem {
  _id?: string
  id?: string
  cartId?: IdLike
  listingId?: IdLike
  quantity?: number
  createdAt?: string
  updatedAt?: string
  listing?: {
    _id?: string
    id?: string
    price?: number
    mrp?: number
    stock?: number
    isActive?: boolean
    sellerId?: IdLike
  } | null
  book?: {
    _id?: string
    id?: string
    title?: string
    author?: string
    isbn?: string
    coverImage?: string
    category?: CategoryLike
    status?: BookStatus
    description?: string
    publisher?: string
    rating?: number
    minPrice?: number | null
    mrp?: number | null
    totalStock?: number
    createdAt?: string
    updatedAt?: string
  } | null
  seller?: {
    _id?: string
    id?: string
    userId?: IdLike
    businessName?: string
    contactPerson?: string
    email?: string
    mobileNumber?: string
    status?: SellerStatus
    storeLogo?: string
    createdAt?: string
    updatedAt?: string
  } | null
}

const getId = (value: IdLike | BackendCartItem): string => {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value.id || value._id || ''
}

const getApiOrigin = () => API_BASE_URL.replace(/\/api\/v\d+\/?$/, '')

const getAssetUrl = (value?: string): string => {
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value
  if (value.startsWith('data:')) return value

  const origin = getApiOrigin()
  return `${origin}${value.startsWith('/') ? value : `/${value}`}`
}

const getCategoryName = (value: CategoryLike): string | undefined => {
  if (!value) return undefined
  if (typeof value === 'string') return value
  return value.name || value.id || value._id
}

const normalizeBook = (item: BackendCartItem): IBook => {
  const book = item.book
  const bookId = getId(book)

  return {
    id: bookId,
    isbn: book?.isbn || '',
    title: book?.title || 'Book',
    author: book?.author || '',
    publisher: book?.publisher || '',
    description: book?.description || '',
    coverImage: getAssetUrl(book?.coverImage),
    category: getCategoryName(book?.category),
    status: book?.status || BookStatus.APPROVED,
    createdAt: book?.createdAt || '',
    updatedAt: book?.updatedAt,
    rating: typeof book?.rating === 'number' ? book.rating : 0,
    minPrice: typeof book?.minPrice === 'number' ? book.minPrice : item.listing?.price ?? null,
    mrp: typeof book?.mrp === 'number' ? book.mrp : item.listing?.mrp ?? null,
    totalStock: typeof book?.totalStock === 'number' ? book.totalStock : item.listing?.stock ?? 0,
  }
}

const normalizeSeller = (item: BackendCartItem): ISeller => {
  const seller = item.seller

  return {
    id: getId(seller),
    userId: getId(seller?.userId),
    businessName: seller?.businessName || 'Marketplace Seller',
    contactPerson: seller?.contactPerson || '',
    email: seller?.email || '',
    mobileNumber: seller?.mobileNumber || '',
    status: seller?.status || SellerStatus.APPROVED,
    storeLogo: getAssetUrl(seller?.storeLogo),
    createdAt: seller?.createdAt || '',
    updatedAt: seller?.updatedAt,
  }
}

const normalizeListing = (item: BackendCartItem): IListing => {
  const listing = item.listing
  const listingId = getId(listing)

  return {
    id: listingId,
    bookId: getId(item.book),
    sellerId: getId(item.seller) || getId(listing?.sellerId),
    price: Number(listing?.price || 0),
    mrp: Number(listing?.mrp || listing?.price || 0),
    stock: Number(listing?.stock || 0),
    isActive: listing?.isActive !== false,
    createdAt: '',
    updatedAt: '',
  }
}

const normalizeCartItem = (item: BackendCartItem): ICartItemDetailed => {
  const id = getId(item)

  return {
    id,
    cartId: getId(item.cartId),
    listingId: getId(item.listingId) || getId(item.listing),
    quantity: Number(item.quantity || 0),
    createdAt: item.createdAt || '',
    listing: normalizeListing(item),
    book: normalizeBook(item),
    seller: normalizeSeller(item),
  }
}

const normalizePlainCartItem = (item: BackendCartItem): ICartItem => ({
  id: getId(item),
  cartId: getId(item.cartId),
  listingId: getId(item.listingId) || getId(item.listing),
  quantity: Number(item.quantity || 0),
  createdAt: item.createdAt || '',
})

export const cartApi = {
  async getCartItems(_customerId: string): Promise<ICartItemDetailed[]> {
    const { data } = await axiosInstance.get<BackendCartResponse>('/customer/cart')
    return (data.items || []).map(normalizeCartItem)
  },

  async addToCart({ listingId, quantity }: AddToCartPayload): Promise<ICartItem> {
    const { data } = await axiosInstance.post<{ data?: BackendCartResponse | BackendCartItem }>(
      '/customer/cart/add',
      { listingId, quantity },
    )

    const payload = (data as { data?: BackendCartResponse | BackendCartItem })?.data

    if (payload && 'items' in payload) {
      const firstItem = payload.items?.[0]
      return firstItem ? normalizePlainCartItem(firstItem) : { id: '', cartId: '', listingId, quantity, createdAt: '' }
    }

    return normalizePlainCartItem((payload as BackendCartItem) || {})
  },

  async updateQuantity(itemId: string, quantity: number): Promise<ICartItem> {
    if (quantity < 1) throw new Error('Quantity must be at least 1')

    const { data } = await axiosInstance.patch<{ data?: BackendCartResponse | BackendCartItem }>(
      `/customer/cart/item/${itemId}`,
      { quantity },
    )

    const payload = (data as { data?: BackendCartResponse | BackendCartItem })?.data

    if (payload && 'items' in payload) {
      const updatedItem = payload.items?.find((item) => getId(item) === itemId)
      return updatedItem ? normalizePlainCartItem(updatedItem) : { id: itemId, cartId: '', listingId: '', quantity, createdAt: '' }
    }

    return normalizePlainCartItem((payload as BackendCartItem) || {})
  },

  async removeItem(itemId: string): Promise<void> {
    await axiosInstance.delete(`/customer/cart/item/${itemId}`)
  },

  async clearCart(_customerId: string): Promise<void> {
    await axiosInstance.delete('/customer/cart/clear')
  },
}