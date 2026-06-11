import { axiosInstance } from './axiosInstance'
import { Role } from '@/enums/role.enum'
import { SellerStatus } from '@/enums/seller-status.enum'
import type { AuthSession, CustomerRegisterPayload, LoginPayload, SellerRegisterPayload } from '@/interfaces/auth.interface'
import type { ICustomer } from '@/interfaces/customer.interface'
import type { ISeller } from '@/interfaces/seller.interface'
import type { IUser, SafeUser } from '@/interfaces/user.interface'
import { generateId } from '@/utils/generateId'

const toSafeUser = (user: IUser): SafeUser => {
  const { password: _password, ...safeUser } = user
  void _password
  return safeUser
}

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthSession> {
    const { data: users } = await axiosInstance.get<IUser[]>('/users', {
      params: { email: payload.email, password: payload.password },
    })

    const user = users[0]
    if (!user) throw new Error('Invalid login credentials')

    let profileId: string | undefined
    let sellerStatus: string | undefined

    if (user.role === Role.CUSTOMER) {
      const { data } = await axiosInstance.get<ICustomer[]>('/customers', { params: { userId: user.id } })
      profileId = data[0]?.id
    }

    if (user.role === Role.SELLER) {
      const { data } = await axiosInstance.get<ISeller[]>('/sellers', { params: { userId: user.id } })
      profileId = data[0]?.id
      sellerStatus = data[0]?.status
    }

    return { user: toSafeUser(user), role: user.role, profileId, sellerStatus }
  },

  async registerCustomer(payload: CustomerRegisterPayload): Promise<AuthSession> {
    const { data: existingUsers } = await axiosInstance.get<IUser[]>('/users', { params: { email: payload.email } })
    if (existingUsers.length) throw new Error('Email already exists')

    const now = new Date().toISOString()
    const user: IUser = {
      id: generateId('user'),
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      password: payload.password,
      role: Role.CUSTOMER,
      createdAt: now,
    }
    const customer: ICustomer = {
      id: generateId('customer'),
      userId: user.id,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      createdAt: now,
    }

    await axiosInstance.post('/users', user)
    await axiosInstance.post('/customers', customer)
    await axiosInstance.post('/carts', { id: generateId('cart'), customerId: customer.id, createdAt: now })

    return { user: toSafeUser(user), role: Role.CUSTOMER, profileId: customer.id }
  },

  async registerSeller(payload: SellerRegisterPayload): Promise<AuthSession> {
    const { data: existingUsers } = await axiosInstance.get<IUser[]>('/users', { params: { email: payload.email } })
    if (existingUsers.length) throw new Error('Email already exists')

    const now = new Date().toISOString()
    const [firstName = payload.contactPerson, ...rest] = payload.contactPerson.split(' ')
    const user: IUser = {
      id: generateId('user'),
      firstName,
      lastName: rest.join(' '),
      email: payload.email,
      password: payload.password,
      role: Role.SELLER,
      createdAt: now,
    }
    const seller: ISeller = {
      id: generateId('seller'),
      userId: user.id,
      businessName: payload.businessName,
      contactPerson: payload.contactPerson,
      email: payload.email,
      mobileNumber: payload.mobileNumber,
      status: SellerStatus.PENDING,
      createdAt: now,
    }

    await axiosInstance.post('/users', user)
    await axiosInstance.post('/sellers', seller)

    return { user: toSafeUser(user), role: Role.SELLER, profileId: seller.id, sellerStatus: seller.status }
  },
}
