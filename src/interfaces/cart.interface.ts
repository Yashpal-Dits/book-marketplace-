export interface ICart {
    id: string
    customerId : string
    createdAt : string
}

export interface ICartItem {
    id : string
    cartId : string
    listingId : string
    quantity: number
    createdAt: string
}