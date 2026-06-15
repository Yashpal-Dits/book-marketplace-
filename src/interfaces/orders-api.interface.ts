import type { IShippingAddress } from '@/interfaces/order.interface'

export interface PlaceOrderPayload {
  customerId: string
  shippingAddress: IShippingAddress
}
