import { useQuery } from '@tanstack/react-query'
import { booksApi } from '@/api/books.api'
import { queryKeys } from '@/utils/queryKeys'

export const useBookDetails = (bookId: string | undefined) =>
  useQuery({
    queryKey: queryKeys.bookDetails(bookId ?? ''),
    queryFn: () => booksApi.getBookById(bookId as string),
    enabled: Boolean(bookId),
  })

export const useBookListings = (bookId: string | undefined) =>
  useQuery({
    queryKey: queryKeys.bookListings(bookId ?? ''),
    queryFn: () => booksApi.getListingsWithSellers(bookId as string),
    enabled: Boolean(bookId),
  })
