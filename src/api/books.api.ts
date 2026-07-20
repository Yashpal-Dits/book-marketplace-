import { axiosInstance } from './axiosInstance'
import { API_BASE_URL } from '@/utils/constants'
import { BookSort } from '@/enums/sort.enum'
import { BookStatus } from '@/enums/book-status.enum'
import { SellerStatus } from '@/enums/seller-status.enum'
import type { IBook, IDeal } from '@/interfaces/book.interface'
import type { IListing, IListingWithSeller } from '@/interfaces/listing.interface'
import type { PaginatedResult } from '@/interfaces/pagination.interface'
import type { ISeller } from '@/interfaces/seller.interface'
import type { GetBooksParams } from '@/interfaces/books-api.interface'

type IdLike = string | { _id?: string; id?: string } | null | undefined
type CategoryLike = string | { _id?: string; id?: string; name?: string } | null | undefined

interface BackendPaginated<T> {
  data: T[]
  meta?: { total?: number; page?: number; limit?: number; totalPages?: number }
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

interface BackendListing {
  _id?: string
  id?: string
  bookId?: IdLike | BackendBook
  sellerId?: IdLike | BackendSeller
  seller?: BackendSeller
  price?: number
  stock?: number
  mrp?: number
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

// FIXED: Use unknown for param, explicit T for return - avoids inference issue
function getArrayFromResponse<T>(response: unknown): T[] {
  if (Array.isArray(response)) return response as T[]
  if (response && typeof response === 'object') {
    const obj = response as any
    if (Array.isArray(obj.data)) return obj.data as T[]
    if (obj.data && Array.isArray(obj.data.data)) return obj.data.data as T[]
  }
  return []
}

const getId = (value: any): string => {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value.id || value._id || ''
}

const isBackendSeller = (value: unknown): value is BackendSeller => {
  if (!value || typeof value !== 'object') return false
  return 'businessName' in (value as object) || 'contactPerson' in (value as object) || 'email' in (value as object) || 'status' in (value as object)
}

const getCategoryName = (value: CategoryLike): string | undefined => {
  if (!value) return undefined
  if (typeof value === 'string') return value
  return value.name || value.id || value._id
}

const getApiOrigin = () => API_BASE_URL.replace(/\/api\/v\d+\/?$/, '')

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
    return `${API_BASE_URL}/books/${bookId}/images/0`
  }
  return ''
}

const normalizeBook = (book: BackendBook): IBook => {
  const id = getId(book)
  const minPrice = typeof book.minPrice === 'number' ? book.minPrice : null
  const totalStock = typeof book.totalStock === 'number' ? book.totalStock : 0
  const hasListings = minPrice !== null && totalStock > 0
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
    categoryDetails: typeof book.category === 'object' && book.category && 'name' in book.category ? (book.category as any) : undefined,
    status: book.status || BookStatus.APPROVED,
    createdBySellerId: getId(book.createdBySellerId) || undefined,
    createdAt: book.createdAt || '',
    updatedAt: book.updatedAt,
    rating: typeof book.rating === 'number' ? book.rating : 0,
    minPrice,
    mrp: typeof book.mrp === 'number' ? book.mrp : null,
    totalStock,
    images: Array.isArray(book.images) ? book.images.map((_, i) => `${API_BASE_URL}/books/${id}/images/${i}`) : [],
    isInStock: totalStock > 0,
    hasListings,
    isListed: hasListings,
  }
}

const normalizeSeller = (seller?: IdLike | BackendSeller): ISeller => {
  if (!seller) {
    return {
      id: '',
      userId: '',
      businessName: 'Marketplace Seller',
      contactPerson: '',
      email: '',
      mobileNumber: '',
      status: SellerStatus.APPROVED,
      createdAt: '',
    }
  }
  if (typeof seller === 'string') {
    return {
      id: seller,
      userId: '',
      businessName: 'Marketplace Seller',
      contactPerson: '',
      email: '',
      mobileNumber: '',
      status: SellerStatus.APPROVED,
      createdAt: '',
    }
  }
  if (!isBackendSeller(seller)) {
    return {
      id: getId(seller),
      userId: '',
      businessName: 'Marketplace Seller',
      contactPerson: '',
      email: '',
      mobileNumber: '',
      status: SellerStatus.APPROVED,
      createdAt: '',
    }
  }
  return {
    id: getId(seller),
    userId: getId(seller.userId),
    businessName: seller.businessName || 'Marketplace Seller',
    contactPerson: seller.contactPerson || '',
    email: seller.email || '',
    mobileNumber: seller.mobileNumber || '',
    status: seller.status || SellerStatus.APPROVED,
    businessAddress: seller.businessAddress,
    city: seller.city,
    state: seller.state,
    pincode: seller.pincode,
    storeLogo: seller.storeLogo ? getAssetUrl(seller.storeLogo) : undefined,
    createdAt: seller.createdAt || '',
    updatedAt: seller.updatedAt,
  }
}

const normalizeListing = (listing: BackendListing): IListing => {
  return {
    id: getId(listing),
    bookId: getId(listing.bookId),
    sellerId: getId(listing.sellerId),
    price: Number(listing.price || 0),
    stock: Number(listing.stock || 0),
    mrp: Number(listing.mrp || listing.price || 0),
    isActive: listing.isActive !== false,
    createdAt: listing.createdAt || '',
    updatedAt: listing.updatedAt || '',
  }
}

const normalizeListingWithSeller = (listing: BackendListing): IListingWithSeller => {
  const populatedSeller =
    listing.seller ||
    (listing.sellerId && typeof listing.sellerId === 'object' && isBackendSeller(listing.sellerId)
      ? listing.sellerId
      : undefined)

  const seller = normalizeSeller(populatedSeller)
  const normalized = normalizeListing(listing)

  return {
    ...normalized,
    sellerId: normalized.sellerId || seller.id,
    seller,
  }
}

const normalizePaginatedBooks = (rows: IBook[], page = 1, limit = 8): PaginatedResult<IBook> => {
  const start = (page - 1) * limit
  return {
    data: rows.slice(start, start + limit),
    total: rows.length,
    page,
    limit,
  }
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
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    }
  })
  return sorted
}

const filterBooksClientSide = (
  books: IBook[],
  { search = '', category, minRating = 0, maxPrice = 2000, inStockOnly = false }: GetBooksParams,
): IBook[] => {
  const term = search.trim().toLowerCase()
  return books.filter((book) => {
    const matchesSearch = term
      ? [book.title, book.author, book.isbn, book.publisher, book.category]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term))
      : true
    const matchesCategory = category ? book.category === category : true
    const matchesRating = (book.rating ?? 0) >= minRating
    const matchesPrice = (book.minPrice ?? Number.MAX_SAFE_INTEGER) <= maxPrice
    const matchesStock = inStockOnly ? (book.totalStock ?? 0) > 0 : true
    return matchesSearch && matchesCategory && matchesRating && matchesPrice && matchesStock
  })
}

export const booksApi = {
  async getBooks(params: GetBooksParams = {}): Promise<PaginatedResult<IBook>> {
    const {
      page = 1,
      limit = 8,
      search = '',
      sort = BookSort.NEWEST,
      category,
      minRating = 0,
      maxPrice = 2000,
      inStockOnly = false,
    } = params

    const { data } = await axiosInstance.get<BackendBook[] | BackendPaginated<BackendBook>>('/books', {
      params: {
        page: 1,
        limit: 1000,
        search: search.trim() || undefined,
        category: category || undefined,
      },
    })

    // FIXED: Explicit generic <BackendBook> to avoid unknown inference
    const books = getArrayFromResponse<BackendBook>(data).map((b) => normalizeBook(b as BackendBook))
    const filtered = filterBooksClientSide(books, { search, category, minRating, maxPrice, inStockOnly })
    const sorted = sortCustomerBooks(filtered, sort)
    return normalizePaginatedBooks(sorted, page, limit)
  },

  async getBookById(id: string): Promise<IBook> {
    const { data } = await axiosInstance.get<BackendBook>(`/books/${id}`)
    return normalizeBook(data as BackendBook)
  },

  async getApprovedBooks(): Promise<IBook[]> {
    const { data } = await axiosInstance.get<BackendBook[] | BackendPaginated<BackendBook>>('/books/approved')
    return getArrayFromResponse<BackendBook>(data)
      .map((b) => normalizeBook(b as BackendBook))
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
  },

  async getListedBooks(): Promise<IBook[]> {
    try {
      const { data } = await axiosInstance.get<BackendBook[] | BackendPaginated<BackendBook>>('/books/listed')
      return getArrayFromResponse<BackendBook>(data).map((b) => normalizeBook(b as BackendBook))
    } catch {
      const { data } = await axiosInstance.get<BackendBook[] | BackendPaginated<BackendBook>>('/books/approved')
      return getArrayFromResponse<BackendBook>(data)
        .map((b) => normalizeBook(b as BackendBook))
        .filter((b) => (b.totalStock ?? 0) > 0)
    }
  },

  async getBestSellers(limit = 8): Promise<IBook[]> {
    const { data } = await axiosInstance.get<BackendBook[] | BackendPaginated<BackendBook>>('/books/best-sellers', {
      params: { limit },
    })
    return getArrayFromResponse<BackendBook>(data)
      .map((b) => normalizeBook(b as BackendBook))
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, limit)
  },

  async getDealOfTheWeek(): Promise<{ deal: IDeal; books: IBook[] }> {
    const books = await booksApi.getBestSellers(6)
    return {
      deal: {
        title: 'Deals of the Week',
        description: 'Popular books selected from the marketplace catalog.',
        endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        bookIds: books.map((book) => book.id),
      },
      books,
    }
  },

  async getListingsByBookId(bookId: string): Promise<IListing[]> {
    const { data } = await axiosInstance.get<BackendListing[] | BackendPaginated<BackendListing>>(
      `/books/${bookId}/listings`,
    )
    return getArrayFromResponse<BackendListing>(data)
      .map((l) => normalizeListing(l as BackendListing))
      .filter((listing) => listing.isActive)
      .sort((a, b) => a.price - b.price)
  },

  async getListingsWithSellers(bookId: string): Promise<IListingWithSeller[]> {
    const { data } = await axiosInstance.get<BackendListing[] | BackendPaginated<BackendListing>>(
      `/books/${bookId}/listings`,
    )
    const listings = getArrayFromResponse<BackendListing>(data)
      .map((l) => normalizeListingWithSeller(l as BackendListing))
      .filter((listing) => listing.isActive)
      .sort((a, b) => a.price - b.price)

    const approved = listings.filter((l) => !l.seller.status || l.seller.status === SellerStatus.APPROVED)
    if (approved.length === 0 && listings.length > 0) {
      console.warn('Listings found but none APPROVED, showing all for debug', listings)
      return listings
    }
    return approved
  },
}
