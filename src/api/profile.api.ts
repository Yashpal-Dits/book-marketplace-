import { axiosInstance } from './axiosInstance'
import type { ICustomer, UpdateCustomerProfilePayload } from '@/interfaces'
import type { ISeller, UpdateSellerProfilePayload } from '@/interfaces'
import type { IUser, SafeUser, UpdateAdminProfilePayload } from '@/interfaces'

const toSafeUser = (user: IUser): SafeUser => {
  const { password: _password, ...safeUser } = user
  void _password
  return safeUser
}

export const profileApi = {
  async getCustomerProfile(customerId: string): Promise<ICustomer> {
    const { data } = await axiosInstance.get<ICustomer>(`/customers/${customerId}`)
    return data
  },

  async updateCustomerProfile(customerId: string, payload: UpdateCustomerProfilePayload): Promise<ICustomer> {
    const { data: customer } = await axiosInstance.get<ICustomer>(`/customers/${customerId}`)
    const updatedCustomer = {
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      mobileNumber: payload.mobileNumber.trim(),
      addressLine: payload.addressLine.trim(),
      city: payload.city.trim(),
      state: payload.state.trim(),
      pincode: payload.pincode.trim(),
      profileImage: payload.profileImage?.trim() || '',
      updatedAt: new Date().toISOString(),
    }

    const { data } = await axiosInstance.patch<ICustomer>(`/customers/${customerId}`, updatedCustomer)
    await axiosInstance.patch(`/users/${customer.userId}`, {
      firstName: updatedCustomer.firstName,
      lastName: updatedCustomer.lastName,
      profileImage: updatedCustomer.profileImage,
    })
    return data
  },

  async getSellerProfile(sellerId: string): Promise<ISeller> {
    const { data } = await axiosInstance.get<ISeller>(`/sellers/${sellerId}`)
    return data
  },

  async updateSellerProfile(sellerId: string, payload: UpdateSellerProfilePayload): Promise<ISeller> {
    const { data: seller } = await axiosInstance.get<ISeller>(`/sellers/${sellerId}`)
    const updatedSeller = {
      businessName: payload.businessName.trim(),
      contactPerson: payload.contactPerson.trim(),
      mobileNumber: payload.mobileNumber.trim(),
      businessAddress: payload.businessAddress.trim(),
      city: payload.city.trim(),
      state: payload.state.trim(),
      pincode: payload.pincode.trim(),
      storeLogo: payload.storeLogo?.trim() || '',
      updatedAt: new Date().toISOString(),
    }

    const { data } = await axiosInstance.patch<ISeller>(`/sellers/${sellerId}`, updatedSeller)
    const [firstName = payload.contactPerson, ...rest] = payload.contactPerson.trim().split(' ')
    await axiosInstance.patch(`/users/${seller.userId}`, {
      firstName,
      lastName: rest.join(' '),
      profileImage: updatedSeller.storeLogo,
    })
    return data
  },

  async getAdminProfile(userId: string): Promise<SafeUser> {
    const { data } = await axiosInstance.get<IUser>(`/users/${userId}`)
    return toSafeUser(data)
  },

  async updateAdminProfile(userId: string, payload: UpdateAdminProfilePayload): Promise<SafeUser> {
    const { data } = await axiosInstance.patch<IUser>(`/users/${userId}`, {
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      mobileNumber: payload.mobileNumber?.trim() || '',
      profileImage: payload.profileImage?.trim() || '',
      updatedAt: new Date().toISOString(),
    })
    return toSafeUser(data)
  },
}
