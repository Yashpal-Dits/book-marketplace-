import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ordersApi } from '@/api/orders.api'
import { queryKeys } from '@/utils/queryKeys'
import type { IShippingAddress } from '@/interfaces/order.interface'

export const useOrders = () => {
  return useQuery({
    queryKey: queryKeys.orders('me'),
    queryFn: ordersApi.getOrders,
  })
}

export const useCancelOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderId: string) => ordersApi.cancelOrder(orderId),
    onSuccess: () => {
      toast.success('Order cancelled successfully')
      queryClient.invalidateQueries({ queryKey: queryKeys.orders('me') })
      queryClient.invalidateQueries({ queryKey: ['books'] })
      queryClient.invalidateQueries({ queryKey: ['listings'] })
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export const usePlaceOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (shippingAddress: IShippingAddress) =>
      ordersApi.placeOrder({ shippingAddress }),
    onSuccess: () => {
      toast.success('Order placed successfully!')
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.orders('me') })
      queryClient.invalidateQueries({ queryKey: ['books'] })
      queryClient.invalidateQueries({ queryKey: ['listings'] })
    },
    onError: (error: Error) => toast.error(error.message),
  })
}