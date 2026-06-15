import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { cartApi } from '@/api/cart.api'
import { useAuthStore } from '@/store/auth.store'
import { Role } from '@/enums/role.enum'
import { queryKeys } from '@/utils/queryKeys'
import type { ICartItemDetailed } from '@/interfaces'

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
      queryClient.invalidateQueries({ queryKey: queryKeys.cart(customerId ?? '') })
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export const useUpdateCartQuantity = () => {
  const queryClient = useQueryClient()
  const customerId = useCustomerId()
  const cartKey = queryKeys.cart(customerId ?? '')

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartApi.updateQuantity(itemId, quantity),
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: cartKey })
      const previousItems = queryClient.getQueryData<ICartItemDetailed[]>(cartKey)
      queryClient.setQueryData<ICartItemDetailed[]>(cartKey, (oldItems = []) =>
        oldItems.map((item) => (item.id === itemId ? { ...item, quantity } : item)),
      )
      return { previousItems }
    },
    onError: (error: Error, _variables, context) => {
      queryClient.setQueryData(cartKey, context?.previousItems)
      toast.error(error.message)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: cartKey }),
  })
}

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient()
  const customerId = useCustomerId()
  const cartKey = queryKeys.cart(customerId ?? '')

  return useMutation({
    mutationFn: (itemId: string) => cartApi.removeItem(itemId),
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: cartKey })
      const previousItems = queryClient.getQueryData<ICartItemDetailed[]>(cartKey)
      queryClient.setQueryData<ICartItemDetailed[]>(cartKey, (oldItems = []) =>
        oldItems.filter((item) => item.id !== itemId),
      )
      return { previousItems }
    },
    onError: (error: Error, _itemId, context) => {
      queryClient.setQueryData(cartKey, context?.previousItems)
      toast.error(error.message)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: cartKey }),
  })
}
