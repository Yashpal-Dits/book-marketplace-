import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { booksApi, type GetBooksParams } from '@/api/books.api'
import { queryKeys } from '@/utils/queryKeys'


export const useBooks = (params: GetBooksParams) =>
  useQuery({
    queryKey: queryKeys.books(params),
    queryFn: () => booksApi.getBooks(params),
    placeholderData: keepPreviousData,
  })


export const useApprovedBooks = () =>
  useQuery({
    queryKey: queryKeys.approvedBooks,
    queryFn: () => booksApi.getApprovedBooks(),
  })


export const useBestSellers = (limit = 8) =>
  useQuery({
    queryKey: queryKeys.bestSellers(limit),
    queryFn: () => booksApi.getBestSellers(limit),
  })


export const useDealOfTheWeek = () =>
  useQuery({
    queryKey: queryKeys.dealOfTheWeek,
    queryFn: () => booksApi.getDealOfTheWeek(),
  })
