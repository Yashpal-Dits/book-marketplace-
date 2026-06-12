import { axiosInstance } from './axiosInstance'
import { cartApi } from './cart.api'
import { OrderStatus } from '@/enums/order-status.enum'
import { generateId } from '@/utils/generateId'
import { syncBookAggregates } from '@/utils/syncBookAggregates'
import type { IListing } from '@/interfaces/listing.interface'
import type { IOrder, IOrderDetailed, IOrderItem, IShippingAddress } from '@/interfaces/order.interface'

export interface PlaceOrderPayload {
  customerId: string
  shippingAddress: IShippingAddress
}

export const ordersApi = {

  async placeOrder({ customerId, shippingAddress }: PlaceOrderPayload): Promise<IOrder> {
    const cartItems = await cartApi.getCartItems(customerId)
    if (cartItems.length === 0) throw new Error('Your cart is empty')

    // Step 1 — strict stock validation against fresh listing data
    for (const item of cartItems) {
      const { data: listing } = await axiosInstance.get<IListing>(`/listings/${item.listingId}`)
      if (!listing.isActive) {
        throw new Error(`"${item.book.title}" is no longer available from ${item.seller.businessName}`)
      }
      if (item.quantity > listing.stock) {
        throw new Error(
          `Only ${listing.stock} of "${item.book.title}" left with ${item.seller.businessName}. Please update your cart.`,
        )
      }
    }

    const now = new Date().toISOString()
    const totalAmount = cartItems.reduce((sum, item) => sum + item.listing.price * item.quantity, 0)

    // Step 2 — create the order
    const order: IOrder = {
      id: generateId('order'),
      customerId,
      shippingAddress,
      totalAmount,
      status: OrderStatus.CREATED,
      createdAt: now,
    }
    await axiosInstance.post('/orders', order)

    // Steps 3 & 4 — order items + stock decrement
    for (const item of cartItems) {
      const orderItem: IOrderItem = {
        id: generateId('order-item'),
        orderId: order.id,
        listingId: item.listingId,
        bookId: item.book.id,
        sellerId: item.seller.id,
        bookTitle: item.book.title,
        sellerName: item.seller.businessName,
        priceAtPurchase: item.listing.price,
        quantity: item.quantity,
        subtotal: item.listing.price * item.quantity,
        status: OrderStatus.CREATED,
        createdAt: now,
      }
      await axiosInstance.post('/orderItems', orderItem)

      const { data: listing } = await axiosInstance.get<IListing>(`/listings/${item.listingId}`)
      await axiosInstance.patch(`/listings/${item.listingId}`, {
        stock: Math.max(0, listing.stock - item.quantity),
        updatedAt: now,
      })
      await syncBookAggregates(item.book.id)
    }

    // Step 5 — clear the cart
    await cartApi.clearCart(customerId)

    return order
  },

  /** Order history for a customer, newest first, with items joined. */
  async getOrdersByCustomerId(customerId: string): Promise<IOrderDetailed[]> {
    const { data: orders } = await axiosInstance.get<IOrder[]>('/orders', {
      params: { customerId, _sort: 'createdAt', _order: 'desc' },
    })
    if (orders.length === 0) return []

    const withItems = await Promise.all(
      orders.map(async (order) => {
        const { data: items } = await axiosInstance.get<IOrderItem[]>('/orderItems', {
          params: { orderId: order.id },
        })
        return { ...order, items }
      }),
    )
    return withItems
  },
}
