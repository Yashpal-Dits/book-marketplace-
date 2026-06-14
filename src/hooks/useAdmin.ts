import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { adminApi, type AdminBookParams, type AdminSellerParams } from '@/api/admin.api'
import { BookStatus } from '@/enums/book-status.enum'
import { SellerStatus } from '@/enums/seller-status.enum'
import { queryKeys } from '@/utils/queryKeys'

export const useAdminDashboard = () =>
  useQuery({
    queryKey: queryKeys.adminDashboard,
    queryFn: adminApi.getDashboardSummary,
  })

export const useAdminSellers = (params: AdminSellerParams) =>
  useQuery({
    queryKey: queryKeys.adminSellers(params),
    queryFn: () => adminApi.getSellers(params),
    placeholderData: keepPreviousData,
  })

export const useAdminBooks = (params: AdminBookParams) =>
  useQuery({
    queryKey: queryKeys.adminBooks(params),
    queryFn: () => adminApi.getBooks(params),
    placeholderData: keepPreviousData,
  })

export const useUpdateSellerStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sellerId, status }: { sellerId: string; status: SellerStatus }) =>
      adminApi.updateSellerStatus(sellerId, status),
    onSuccess: (_, variables) => {
      toast.success(variables.status === SellerStatus.APPROVED ? 'Seller approved' : 'Seller rejected')
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      queryClient.invalidateQueries({ queryKey: ['seller'] })
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export const useUpdateBookStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ bookId, status }: { bookId: string; status: BookStatus }) => adminApi.updateBookStatus(bookId, status),
    onSuccess: (_, variables) => {
      toast.success(variables.status === BookStatus.APPROVED ? 'Book approved' : 'Book rejected')
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      queryClient.invalidateQueries({ queryKey: ['books'] })
      queryClient.invalidateQueries({ queryKey: ['seller'] })
    },
    onError: (error: Error) => toast.error(error.message),
  })
}
