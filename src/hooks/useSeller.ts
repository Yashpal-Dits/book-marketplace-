import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { sellerApi} from '../api/seller.api'
 import type {CreateBookRequestPayload, CreateListingPayload,SellerListParams,SellerOrdersParams,UpdateListingPayload } from '@/interfaces/seller-api.interface'
import { OrderStatus } from '@/enums/order-status.enum'
import { useAuthStore } from '@/store/auth.store'
import { queryKeys } from '@/utils/queryKeys'

export const useSellerId = () =>
  useAuthStore((state) => state.impersonatedSellerId ?? state.profileId)

export const useSellerDashboard = () => {
  const sellerId = useSellerId()
  return useQuery({
    queryKey: queryKeys.sellerDashboard(sellerId ?? ''),
    queryFn: () => sellerApi.getDashboardSummary(sellerId as string),
    enabled: Boolean(sellerId),
  })
}

export const useSellerApprovedBooks = () =>
  useQuery({
    queryKey: queryKeys.sellerApprovedBooks,
    queryFn: sellerApi.getApprovedBooks,
  })

export const useSellerListings = (params: Omit<SellerListParams, 'sellerId'>) => {
  const sellerId = useSellerId()
  return useQuery({
    queryKey: queryKeys.sellerListings({ sellerId: sellerId ?? '', ...params }),
    queryFn: () => sellerApi.getListings({ sellerId: sellerId as string, ...params }),
    enabled: Boolean(sellerId),
    placeholderData: keepPreviousData,
  })
}

export const useSellerOrders = (params: Omit<SellerOrdersParams, 'sellerId'>) => {
  const sellerId = useSellerId()
  return useQuery({
    queryKey: queryKeys.sellerOrders({ sellerId: sellerId ?? '', ...params }),
    queryFn: () => sellerApi.getOrders({ sellerId: sellerId as string, ...params }),
    enabled: Boolean(sellerId),
    placeholderData: keepPreviousData,
  })
}

export const useCreateSellerListing = () => {
  const queryClient = useQueryClient()
  const sellerId = useSellerId()

  return useMutation({
    mutationFn: (payload: Omit<CreateListingPayload, 'sellerId'>) => {
      if (!sellerId) throw new Error('Seller session not found')
      return sellerApi.createListing({ sellerId, ...payload })
    },
    onSuccess: () => {
      toast.success('Listing created successfully')
      queryClient.invalidateQueries({ queryKey: ['seller'] })
      queryClient.invalidateQueries({ queryKey: ['books'] })
      queryClient.invalidateQueries({ queryKey: ['listings'] })
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export const useCreateSellerBookRequest = () => {
  const queryClient = useQueryClient()
  const sellerId = useSellerId()

  return useMutation({
    mutationFn: (payload: Omit<CreateBookRequestPayload, 'sellerId'>) => {
      if (!sellerId) throw new Error('Seller session not found')
      return sellerApi.createBookRequest({ sellerId, ...payload })
    },
    onSuccess: () => {
      toast.success('Book submitted for admin approval')
      queryClient.invalidateQueries({ queryKey: ['seller'] })
      queryClient.invalidateQueries({ queryKey: ['books'] })
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export const useUpdateSellerListing = () => {
  const queryClient = useQueryClient()
  const sellerId = useSellerId()

  return useMutation({
    mutationFn: (payload: Omit<UpdateListingPayload, 'sellerId'>) => {
      if (!sellerId) throw new Error('Seller session not found')
      return sellerApi.updateListing({ sellerId, ...payload })
    },
    onSuccess: () => {
      toast.success('Listing updated')
      queryClient.invalidateQueries({ queryKey: ['seller'] })
      queryClient.invalidateQueries({ queryKey: ['books'] })
      queryClient.invalidateQueries({ queryKey: ['listings'] })
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export const useUpdateSellerOrderStatus = () => {
  const queryClient = useQueryClient()
  const sellerId = useSellerId()

  return useMutation({
    mutationFn: ({ orderItemId, status }: { orderItemId: string; status: OrderStatus }) => {
      if (!sellerId) throw new Error('Seller session not found')
      return sellerApi.updateOrderItemStatus(sellerId, orderItemId, status)
    },
    onSuccess: () => {
      toast.success('Order status updated')
      queryClient.invalidateQueries({ queryKey: ['seller'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
    onError: (error: Error) => toast.error(error.message),
  })
}
