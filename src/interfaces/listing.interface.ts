import type { ISeller } from './seller.interface'


export interface IListing {
    id: string
    bookId : string 
    sellerId : string
    price: number
    stock : number
    mrp: number
    isActive : boolean
    createdAt: string
    updatedAt : string
}

export interface IListingWithSeller extends IListing {
    seller: ISeller
}