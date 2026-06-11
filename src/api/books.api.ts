import { axiosInstance } from './axiosInstance'
import type { IBook } from '@/interfaces/book.interface'

export const booksApi = {
  async getBooks() {
    const { data } = await axiosInstance.get<IBook[]>('/books')
    return data
  },
}
