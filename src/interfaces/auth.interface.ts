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
  token?: string
  refreshToken?: string
}

export interface OtpResponse {
  message: string
}

export interface VerifyOtpResponse {
  verified: true
  message: string
}

export interface ResetPasswordResponse {
  success: true
  message: string
}