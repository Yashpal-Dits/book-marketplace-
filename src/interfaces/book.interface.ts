import { BookStatus } from "@/enums/book-status.enum";

export interface IBook {
    id: string
    isbn: string
    title : string 
    author: string
    publisher?: string
    description: string
    coverImage : string
    category?: string 
    status: BookStatus
    createdBySellerId?: string
    createdAt:string

}