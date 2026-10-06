import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ordersApi } from '@/api/orders.api'
import { queryKeys } from '@/utils/queryKeys'
import type { IShippingAddress } from '@/interfaces/order.interface'
import { useCustomerId } from './useCart'

export const useOrders = () => {
  const customerId = useCustomerId()
  return useQuery({
    queryKey: queryKeys.orders(customerId ?? 'me'),
    queryFn: () => ordersApi.getOrders(customerId),
    enabled: Boolean(customerId),
  })
}

export const useCancelOrder = () => {
  const queryClient = useQueryClient()
  const customerId = useCustomerId()

  return useMutation({
    mutationFn: (orderId: string) => ordersApi.cancelOrder(orderId, customerId),
    onSuccess: () => {
      toast.success('Order cancelled successfully')
      queryClient.invalidateQueries({ queryKey: queryKeys.orders(customerId ?? 'me') })
      queryClient.invalidateQueries({ queryKey: ['books'] })
      queryClient.invalidateQueries({ queryKey: ['listings'] })
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export const usePlaceOrder = () => {
  const queryClient = useQueryClient()
  const customerId = useCustomerId()

  return useMutation({
    mutationFn: (shippingAddress: IShippingAddress) =>
      ordersApi.placeOrder({ shippingAddress }, customerId),
    onSuccess: () => {
      toast.success('Order placed successfully!')
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.orders(customerId ?? 'me') })
      queryClient.invalidateQueries({ queryKey: ['books'] })
      queryClient.invalidateQueries({ queryKey: ['listings'] })
    },
    onError: (error: Error) => toast.error(error.message),
  })
}
