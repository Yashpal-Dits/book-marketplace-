import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { axiosInstance } from '@/api/axiosInstance'
import { sellerApi } from '../api/seller.api'
import type { ISeller, UpdateSellerProfilePayload } from '@/interfaces/seller.interface'
import type {
  CreateBookRequestPayload,
  CreateListingPayload,
  SellerListParams,
  SellerOrdersParams,
  SellerRequestedBooksParams,
  UpdateListingPayload,
} from '@/interfaces/seller-api.interface'
import { OrderStatus } from '@/enums/order-status.enum'
import { useAuthStore } from '@/store/auth.store'
import { queryKeys } from '@/utils/queryKeys'

export const useSellerId = () => useAuthStore((state) => state.impersonatedSellerId ?? state.profileId)

export const useSellerProfile = () => {
  const sellerId = useSellerId()
  return useQuery({
    queryKey: queryKeys.sellerProfile(sellerId ?? 'me'),
    queryFn: async () => {
      const { data } = await axiosInstance.get<ISeller>('/seller/profile')
      return data
    },
    enabled: Boolean(sellerId),
  })
}

export const useUpdateSellerProfile = () => {
  const queryClient = useQueryClient()
  const sellerId = useSellerId()
  const updateUser = useAuthStore((state) => state.updateUser)
  return useMutation({
    mutationFn: async (payload: UpdateSellerProfilePayload) => {
      const { data } = await axiosInstance.patch<ISeller>('/seller/profile', {
        businessName: payload.businessName.trim(),
        contactPerson: payload.contactPerson.trim(),
        mobileNumber: payload.mobileNumber.trim(),
        businessAddress: payload.businessAddress.trim(),
        city: payload.city.trim(),
        state: payload.state.trim(),
        pincode: payload.pincode.trim(),
        storeLogo: payload.storeLogo?.trim() || '',
      })
      return data
    },
    onSuccess: (profile) => {
      toast.success('Seller profile updated')
      const [firstName = profile.contactPerson, ...rest] = profile.contactPerson.split(' ')
      updateUser({ firstName, lastName: rest.join(' '), profileImage: profile.storeLogo })
      queryClient.invalidateQueries({ queryKey: queryKeys.sellerProfile(sellerId ?? 'me') })
      queryClient.invalidateQueries({ queryKey: ['seller'] })
      queryClient.invalidateQueries({ queryKey: ['admin'] })
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export const useSellerDashboard = () => {
  const sellerId = useSellerId()
  return useQuery({
    queryKey: queryKeys.sellerDashboard(sellerId ?? ''),
    queryFn: () => sellerApi.getDashboardSummary(sellerId as string),
    enabled: Boolean(sellerId),
    // Force refetch on mount always to show latest data
    refetchOnMount: 'always',
    staleTime: 0,
  })
}

export const useSellerApprovedBooks = () =>
  useQuery({
    queryKey: queryKeys.sellerApprovedBooks,
    queryFn: sellerApi.getApprovedBooks,
    staleTime: 0,
  })

export const useSellerListings = (params: Omit<SellerListParams, 'sellerId'>) => {
  const sellerId = useSellerId()
  return useQuery({
    queryKey: queryKeys.sellerListings({ sellerId: sellerId ?? '', ...params }),
    queryFn: () => sellerApi.getListings({ sellerId: sellerId as string, ...params }),
    enabled: Boolean(sellerId),
    placeholderData: keepPreviousData,
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export const useSellerRequestedBooks = (params: Omit<SellerRequestedBooksParams, 'sellerId'>) => {
  const sellerId = useSellerId()
  return useQuery({
    queryKey: queryKeys.sellerRequestedBooks({ sellerId: sellerId ?? '', ...params }),
    queryFn: () => sellerApi.getRequestedBooks({ sellerId: sellerId as string, ...params }),
    enabled: Boolean(sellerId),
    placeholderData: keepPreviousData,
    staleTime: 0,
  })
}

export const useSellerOrders = (params: Omit<SellerOrdersParams, 'sellerId'>) => {
  const sellerId = useSellerId()
  return useQuery({
    queryKey: queryKeys.sellerOrders({ sellerId: sellerId ?? '', ...params }),
    queryFn: () => sellerApi.getOrders({ sellerId: sellerId as string, ...params }),
    enabled: Boolean(sellerId),
    placeholderData: keepPreviousData,
    staleTime: 0,
    refetchOnMount: 'always',
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
      // Aggressive invalidation to ensure dashboard + listings + inventory refresh
      queryClient.invalidateQueries({ queryKey: ['seller'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.sellerDashboard(sellerId ?? '') })
      queryClient.invalidateQueries({ queryKey: ['books'] })
      queryClient.invalidateQueries({ queryKey: ['listings'] })
      // Also refetch immediately
      queryClient.refetchQueries({ queryKey: queryKeys.sellerDashboard(sellerId ?? '') })
      queryClient.refetchQueries({ queryKey: queryKeys.sellerListings({ sellerId: sellerId ?? '' } as any) })
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
      queryClient.invalidateQueries({ queryKey: queryKeys.sellerDashboard(sellerId ?? '') })
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
      toast.success('Listing updated - stock & price synced')
      queryClient.invalidateQueries({ queryKey: ['seller'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.sellerDashboard(sellerId ?? '') })
      queryClient.invalidateQueries({ queryKey: ['books'] })
      queryClient.invalidateQueries({ queryKey: ['listings'] })
      queryClient.refetchQueries({ queryKey: queryKeys.sellerListings({ sellerId: sellerId ?? '' } as any) })
      queryClient.refetchQueries({ queryKey: queryKeys.sellerDashboard(sellerId ?? '') })
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
      queryClient.invalidateQueries({ queryKey: queryKeys.sellerDashboard(sellerId ?? '') })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.refetchQueries({ queryKey: queryKeys.sellerOrders({ sellerId: sellerId ?? '' } as any) })
    },
    onError: (error: Error) => toast.error(error.message),
  })
}
