import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { booksApi}  from '../api'
import type {GetBooksParams } from '@/interfaces/books-api.interface'
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
    staleTime: 0,
    refetchOnMount: 'always',
  })

export const useListedBooks = () =>
  useQuery({
    queryKey: ['books','listed'] as const,
    queryFn: () => booksApi.getListedBooks(),
    staleTime: 0,
  })

export const useBestSellers = (limit = 8) =>
  useQuery({
    queryKey: queryKeys.bestSellers(limit),
    queryFn: () => booksApi.getBestSellers(limit),
    staleTime: 0,
    refetchOnMount: 'always',
  })


export const useDealOfTheWeek = () =>
  useQuery({
    queryKey: queryKeys.dealOfTheWeek,
    queryFn: () => booksApi.getDealOfTheWeek(),
    staleTime: 0,
  })
