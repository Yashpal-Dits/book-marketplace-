import { OrderStatus } from '@/enums/order-status.enum'

export interface IShippingAddress {
  fullName: string
  mobileNumber: string
  addressLine: string
  city: string
  state: string
  pincode: string
}

export interface IOrder {
  id: string
  customerId: string
  shippingAddress: IShippingAddress
  totalAmount: number
  status: OrderStatus
  createdAt: string
}

export interface IOrderItem {
  id: string
  orderId: string
  listingId: string
  bookId: string
  sellerId: string
  bookTitle: string
  sellerName: string
  priceAtPurchase: number
  quantity: number
  subtotal: number
  status: OrderStatus
  createdAt: string
}
