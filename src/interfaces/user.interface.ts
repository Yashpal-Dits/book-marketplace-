import { Role } from '@/enums/role.enum'

export interface IUser {
  id: string
  firstName?: string
  lastName?: string
  email: string
  password: string
  role: Role
  createdAt: string
}

export type SafeUser = Omit<IUser, 'password'>
