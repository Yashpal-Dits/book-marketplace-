import { Role } from '@/enums/role.enum'

export interface IUser {
  id: string
  firstName?: string
  lastName?: string
  email: string
  password: string
  role: Role
  mobileNumber?: string
  profileImage?: string
  createdAt: string
  updatedAt?: string
}

export type SafeUser = Omit<IUser, 'password'>

export interface UpdateAdminProfilePayload {
  firstName: string
  lastName: string
  mobileNumber?: string
  profileImage?: string
}
