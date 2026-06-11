import { Role } from '@/enums/role.enum'
import type { SafeUser } from './user.interface'

export interface LoginPayload {
  email: string
  password: string
}

export interface CustomerRegisterPayload {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface SellerRegisterPayload {
  businessName: string
  contactPerson: string
  email: string
  mobileNumber: string
  password: string
}

export interface AuthSession {
  user: SafeUser
  role: Role
  profileId?: string
  sellerStatus?: string
}
