import type { GetBooksParams } from '@/api/books.api'

export const queryKeys = {
    
  books: (params: GetBooksParams) => ['books', params] as const,
  approvedBooks: ['books', 'approved'] as const,

  bestSellers: (limit: number) => ['books', 'best-sellers', limit] as const,
  dealOfTheWeek: ['deal-of-the-week'] as const,

  bookDetails: (id: string) => ['books', id] as const,

  bookListings: (bookId: string) => ['listings', bookId] as const,
}
