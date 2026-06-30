import { axiosInstance } from './axiosInstance'
import type { ICategory } from '@/interfaces/category.interface'

type IdLike =
  | string
  | {
      _id?: string
      id?: string
    }
  | null
  | undefined

interface BackendCategory {
  _id?: string
  id?: string
  name?: string
  description?: string
  image?: string
  isActive?: boolean
  bookCount?: number
  createdAt?: string
  updatedAt?: string
}

interface BackendPaginated<T> {
  data: T[]
  meta?: {
    total?: number
    page?: number
    limit?: number
    totalPages?: number
  }
}

const getId = (value: IdLike): string => {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value.id || value._id || ''
}

const getArrayFromResponse = <T>(response: T[] | BackendPaginated<T>): T[] => {
  if (Array.isArray(response)) return response
  return Array.isArray(response.data) ? response.data : []
}

const normalizeCategory = (category: BackendCategory): ICategory => ({
  id: getId(category),
  name: category.name || 'Unnamed Category',
  description: category.description,
  image: category.image,
  isActive: category.isActive !== false,
  bookCount: category.bookCount,
  createdAt: category.createdAt,
  updatedAt: category.updatedAt,
})

export const categoriesApi = {
  async getCategories(): Promise<ICategory[]> {
    const { data } = await axiosInstance.get<BackendCategory[] | BackendPaginated<BackendCategory>>('/categories')

    return getArrayFromResponse(data)
      .map(normalizeCategory)
      .filter((category) => category.isActive)
      .sort((a, b) => a.name.localeCompare(b.name))
  },
}