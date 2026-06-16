import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { adminApi } from '@/api/admin.api'
import type { AdminBookParams, AdminCustomerParams, AdminSellerParams, UpdateBookCatalogPayload } from '@/interfaces/admin-api.interface'
import { BookStatus } from '@/enums/book-status.enum'
import { CustomerStatus } from '@/enums/customer-status.enum'
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

export const useUpdateBookCatalog = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ bookId, payload }: { bookId: string; payload: UpdateBookCatalogPayload }) =>
      adminApi.updateBookCatalog(bookId, payload),
    onSuccess: () => {
      toast.success('Book catalog updated successfully')
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      queryClient.invalidateQueries({ queryKey: ['books'] })
      queryClient.invalidateQueries({ queryKey: ['seller'] })
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export const useDeleteBook = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (bookId: string) => adminApi.deleteBook(bookId),
    onSuccess: () => {
      toast.success('Book deleted from catalog')
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      queryClient.invalidateQueries({ queryKey: ['books'] })
      queryClient.invalidateQueries({ queryKey: ['seller'] })
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export const useAdminCustomers = (params: AdminCustomerParams) =>
  useQuery({
    queryKey: queryKeys.adminCustomers(params),
    queryFn: () => adminApi.getCustomers(params),
    placeholderData: keepPreviousData,
  })

export const useUpdateCustomerStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ customerId, status }: { customerId: string; status: CustomerStatus }) =>
      adminApi.updateCustomerStatus(customerId, status),
    onSuccess: (_, variables) => {
      toast.success(
        variables.status === CustomerStatus.ACTIVE
          ? 'Customer activated'
          : variables.status === CustomerStatus.BLOCKED
            ? 'Customer blocked'
            : 'Customer status updated',
      )
      queryClient.invalidateQueries({ queryKey: ['admin'] })
    },
    onError: (error: Error) => toast.error(error.message),
  })
}
