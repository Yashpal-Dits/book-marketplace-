import { SellerStatus } from '@/enums/seller-status.enum'

export interface ISeller {
  id: string
  userId: string
  businessName: string
  contactPerson: string
  email: string
  mobileNumber: string
  status: SellerStatus
  businessAddress?: string
  city?: string
  state?: string
  pincode?: string
  storeLogo?: string
  createdAt: string
  updatedAt?: string
}

export interface UpdateSellerProfilePayload {
  businessName: string
  contactPerson: string
  mobileNumber: string
  businessAddress: string
  city: string
  state: string
  pincode: string
  storeLogo?: string
}
