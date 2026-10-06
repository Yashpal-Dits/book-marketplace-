import { axiosInstance } from './axiosInstance'
import type { ICustomer, UpdateCustomerProfilePayload } from '@/interfaces'

export const customerApi = {
  async getProfile(customerId?: string): Promise<ICustomer> {
    const { data } = await axiosInstance.get<ICustomer>('/customer/profile', {
      params: { customerId },
    })
    return data
  },

  async updateProfile(payload: UpdateCustomerProfilePayload, customerId?: string): Promise<ICustomer> {
    const { data } = await axiosInstance.patch<ICustomer>('/customer/profile', {
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      mobileNumber: payload.mobileNumber.trim(),
      addressLine: payload.addressLine.trim(),
      city: payload.city.trim(),
      state: payload.state.trim(),
      pincode: payload.pincode.trim(),
      profileImage: payload.profileImage?.trim() || '',
    }, { params: { customerId } })

    return data
  },
}
