import { axiosInstance } from "./axiosInstance";
import { generateId } from "@/utils/generateId";
import type {
    ICart, ICartItem,
    ICartItemDetailed,
    IBook, IListing,
    ISeller
} from "../interfaces/index"


export interface AddToCartPayload {
    customerId : string
    listingId : string
    quantity : number
}

const getOrCreateCart = async (customerId: string): Promise<ICart> => {
  const { data: carts } = await axiosInstance.get<ICart[]>('/carts', { params: { customerId } })
  if (carts[0]) return carts[0]

  const { data: cart } = await axiosInstance.post<ICart>('/carts', {
    id: generateId('cart'),
    customerId,
    createdAt: new Date().toISOString(),
  })
  return cart
}

const getListing = async (listingId: string): Promise<IListing> => {
  const { data } = await axiosInstance.get<IListing>(`/listings/${listingId}`)
  return data
}

export const cartApi = {

  async getCartItems(customerId: string): Promise<ICartItemDetailed[]> {
    const cart = await getOrCreateCart(customerId)
    const { data: items } = await axiosInstance.get<ICartItem[]>('/cartItems', {
      params: { cartId: cart.id },
    })
    if (items.length === 0) return []

    const detailed = await Promise.all(
      items.map(async (item) => {
        try {
          const listing = await getListing(item.listingId)
          const [{ data: book }, { data: seller }] = await Promise.all([
            axiosInstance.get<IBook>(`/books/${listing.bookId}`),
            axiosInstance.get<ISeller>(`/sellers/${listing.sellerId}`),
          ])
          return { ...item, listing, book, seller }
        } catch {
          return null // listing/book removed meanwhile — drop the orphan row
        }
      }),
    )
    return detailed.filter((item): item is ICartItemDetailed => item !== null)
  },


  async addToCart({ customerId, listingId, quantity }: AddToCartPayload): Promise<ICartItem> {
    const listing = await getListing(listingId)
    if (!listing.isActive) throw new Error('This listing is no longer available')
    if (listing.stock <= 0) throw new Error('This seller is out of stock')

    const cart = await getOrCreateCart(customerId)
    const { data: existingItems } = await axiosInstance.get<ICartItem[]>('/cartItems', {
      params: { cartId: cart.id, listingId },
    })

    const existing = existingItems[0]
    const requestedTotal = (existing?.quantity ?? 0) + quantity

    if (requestedTotal > listing.stock) {
      throw new Error(
        existing
          ? `Only ${listing.stock} in stock — you already have ${existing.quantity} in your cart`
          : `Only ${listing.stock} left in stock`,
      )
    }

    if (existing) {
      const { data } = await axiosInstance.patch<ICartItem>(`/cartItems/${existing.id}`, {
        quantity: requestedTotal,
      })
      return data
    }

    const { data } = await axiosInstance.post<ICartItem>('/cartItems', {
      id: generateId('cart-item'),
      cartId: cart.id,
      listingId,
      quantity,
      createdAt: new Date().toISOString(),
    })
    return data
  },

  /** Updates quantity, re-validating against current stock. */
  async updateQuantity(itemId: string, quantity: number): Promise<ICartItem> {
    if (quantity < 1) throw new Error('Quantity must be at least 1')

    const { data: item } = await axiosInstance.get<ICartItem>(`/cartItems/${itemId}`)
    const listing = await getListing(item.listingId)
    if (quantity > listing.stock) throw new Error(`Only ${listing.stock} left in stock`)

    const { data } = await axiosInstance.patch<ICartItem>(`/cartItems/${itemId}`, { quantity })
    return data
  },

  async removeItem(itemId: string): Promise<void> {
    await axiosInstance.delete(`/cartItems/${itemId}`)
  },

  async clearCart(customerId: string): Promise<void> {
    const cart = await getOrCreateCart(customerId)
    const { data: items } = await axiosInstance.get<ICartItem[]>('/cartItems', {
      params: { cartId: cart.id },
    })
    await Promise.all(items.map((item) => axiosInstance.delete(`/cartItems/${item.id}`)))
  },
}
