import { BookStatus } from '@/enums/book-status.enum'
import type { ICategory } from './category.interface'

/**
 * Complete updated IBook interface aligned with:
 * - backend/src/modules/books/schemas/book.schema.ts (Book)
 * - frontend/src/api/books.api.ts normalization (normalizeBook)
 * 
 * Backend returns:
 * - _id/id, isbn, title, author, authorImage, publisher, description
 * - coverImage: string ( /uploads/books/... or URL )
 * - images: BookImage[] (binary) -> frontend converts to /books/:id/images/0 URL
 * - category: ObjectId | populated { _id, name } -> normalized to string name
 * - status: BookStatus
 * - createdBySellerId: ObjectId (User._id)
 * - rating, minPrice, mrp, totalStock (aggregated from listings)
 * - timestamps: createdAt, updatedAt
 */

export interface IBook {
  /** Mongo _id normalized to string */
  id: string

  /** ISBN - unique */
  isbn: string

  title: string
  author: string

  /** Optional author image URL */
  authorImage?: string

  /** Publisher name */
  publisher?: string

  /** Long description */
  description: string

  /** Cover image - always absolute URL after normalization (via getAssetUrl / /books/:id/images/0) */
  coverImage: string

  /**
   * Category - normalized to string name for UI filters.
   * Backend may return ObjectId or populated object, but normalizeBook converts to string.
   */
  category?: string

  /** Optional full category object if you need it (populated from backend) */
  categoryDetails?: ICategory

  /** Book approval status */
  status: BookStatus

  /** User._id of seller who created request (as string) */
  createdBySellerId?: string

  /** ISO date strings */
  createdAt: string
  updatedAt?: string

  /** Rating 0-5, default 0 */
  rating?: number

  /**
   * Aggregated from active listings:
   * - minPrice: lowest listing price, null if no listing
   * - mrp: highest mrp among listings, null if no listing
   * - totalStock: sum of stock of active listings
   */
  minPrice?: number | null
  mrp?: number | null
  totalStock?: number

  /** Optional: raw images array URLs (if backend exposes /books/:id/images) */
  images?: string[]

  /** Computed helpers (optional, can be derived client-side) */
  isInStock?: boolean
  hasListings?: boolean
  isListed?: boolean

  /** For shop sections that need seller count */
  listingCount?: number
}

export interface ICategorySummary {
  name: string
  count: number
  coverImages: string[]
}

export interface IDeal {
  title: string
  description: string
  endsAt: string
  bookIds: string[]
}

/**
 * For SHOP / listed books endpoint (GET /books/listed)
 * Extends IBook with guarantee of pricing
 */
export interface IListedBook extends IBook {
  minPrice: number
  mrp: number
  totalStock: number
  isInStock: true
  hasListings: true
}
