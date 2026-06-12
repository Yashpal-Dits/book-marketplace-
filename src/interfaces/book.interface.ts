import { BookStatus } from '@/enums/book-status.enum'

export interface IBook {
  id: string
  isbn: string
  title: string
  author: string
  publisher?: string
  description: string
  coverImage: string
  category?: string
  status: BookStatus
  createdBySellerId?: string
  createdAt: string
  rating?: number
  minPrice?: number | null
  mrp?: number | null
  totalStock?: number
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
