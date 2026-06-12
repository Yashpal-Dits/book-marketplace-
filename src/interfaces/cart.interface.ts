import type { IBook } from "./book.interface";
import type { IListing } from "./listing.interface";
import type { ISeller } from "./seller.interface";

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

export interface ICartItemDetailed extends ICartItem {
    listing: IListing
    book: IBook
    seller: ISeller
}