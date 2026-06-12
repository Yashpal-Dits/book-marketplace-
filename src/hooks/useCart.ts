import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { cartApi } from '@/api/cart.api'
import { useAuthStore } from '@/store/auth.store'
import { Role } from '@/enums/role.enum'
import { queryKeys } from '@/utils/queryKeys'

/** Customer profile id, or undefined when not logged in as a customer. */
export const useCustomerId = () => {
  const { user, profileId, isAuthenticated } = useAuthStore()
  return isAuthenticated && user?.role === Role.CUSTOMER ? profileId : undefined
}

export const useCart = () => {
  const customerId = useCustomerId()
  return useQuery({
    queryKey: queryKeys.cart(customerId ?? ''),
    queryFn: () => cartApi.getCartItems(customerId as string),
    enabled: Boolean(customerId),
  })
}

export const useAddToCart = () => {
  const queryClient = useQueryClient()
  const customerId = useCustomerId()

  return useMutation({
    mutationFn: ({ listingId, quantity }: { listingId: string; quantity: number }) => {
      if (!customerId) throw new Error('Please login as a customer to add items to cart')
      return cartApi.addToCart({ customerId, listingId, quantity })
    },
    onSuccess: () => {
      toast.success('Added to cart')
      queryClient.invalidateQueries({ queryKey: queryKeys.cart(customerId ?? '') })
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export const useUpdateCartQuantity = () => {
  const queryClient = useQueryClient()
  const customerId = useCustomerId()

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartApi.updateQuantity(itemId, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.cart(customerId ?? '') }),
    onError: (error: Error) => toast.error(error.message),
  })
}

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient()
  const customerId = useCustomerId()

  return useMutation({
    mutationFn: (itemId: string) => cartApi.removeItem(itemId),
    onSuccess: () => {
      toast.success('Removed from cart')
      queryClient.invalidateQueries({ queryKey: queryKeys.cart(customerId ?? '') })
    },
    onError: (error: Error) => toast.error(error.message),
  })
}
