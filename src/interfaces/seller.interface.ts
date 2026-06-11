import { SellerStatus } from "@/enums/seller-status.enum";


export interface ISeller {
    id : string 
    userId : string
    businessName : string
    contactPerson: string
    email: string 
    mobileNumber: string
    status : SellerStatus
    createdAt: string
}