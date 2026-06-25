import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ordersApi } from '@/api/orders.api'
import { useCustomerId } from './useCart'
import { queryKeys } from '@/utils/queryKeys'
import type { IShippingAddress } from '@/interfaces'

export const useOrders = () => {
  const customerId = useCustomerId()
  return useQuery({
    queryKey: queryKeys.orders(customerId ?? ''),
    queryFn: () => ordersApi.getOrdersByCustomerId(customerId as string),
    enabled: Boolean(customerId),
  })
}

export const useCancelOrder = () => {
  const queryClient = useQueryClient()
  const customerId = useCustomerId()

  return useMutation({
    mutationFn: (orderId: string) => {
      if (!customerId) throw new Error('Please login as a customer to cancel an order')
      return ordersApi.cancelOrder(orderId, customerId)
    },
    onSuccess: () => {
      toast.success('Order cancelled successfully')
      queryClient.invalidateQueries({ queryKey: queryKeys.orders(customerId ?? '') })
      queryClient.invalidateQueries({ queryKey: ['books'] }) // stock restored
      queryClient.invalidateQueries({ queryKey: ['listings'] })
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export const usePlaceOrder = () => {
  const queryClient = useQueryClient()
  const customerId = useCustomerId()

  return useMutation({
    mutationFn: (shippingAddress: IShippingAddress) => {
      if (!customerId) throw new Error('Please login as a customer to place an order')
      return ordersApi.placeOrder({ customerId, shippingAddress })
    },
    onSuccess: () => {
      toast.success('Order placed successfully!')
      queryClient.setQueryData(queryKeys.cart(customerId ?? ''), [])
      queryClient.invalidateQueries({ queryKey: queryKeys.cart(customerId ?? '') })
      queryClient.invalidateQueries({ queryKey: queryKeys.orders(customerId ?? '') })
      queryClient.invalidateQueries({ queryKey: ['books'] }) // stock changed
      queryClient.invalidateQueries({ queryKey: ['listings'] })
    },
    onError: (error: Error) => toast.error(error.message),
  })
}
