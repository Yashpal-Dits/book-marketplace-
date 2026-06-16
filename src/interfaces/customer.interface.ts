import { CustomerStatus } from '@/enums/customer-status.enum'

export interface ICustomer {
  id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  mobileNumber?: string
  addressLine?: string
  city?: string
  state?: string
  pincode?: string
  profileImage?: string
  status: CustomerStatus
  createdAt: string
  updatedAt?: string
}

export interface UpdateCustomerProfilePayload {
  firstName: string
  lastName: string
  mobileNumber: string
  addressLine: string
  city: string
  state: string
  pincode: string
  profileImage?: string
}
