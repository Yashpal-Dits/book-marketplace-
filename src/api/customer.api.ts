import { axiosInstance } from './axiosInstance'
import type { ICustomer, UpdateCustomerProfilePayload } from '@/interfaces'

export const customerApi = {
  async getProfile(): Promise<ICustomer> {
    const { data } = await axiosInstance.get<ICustomer>('/customer/profile')
    return data
  },

  async updateProfile(payload: UpdateCustomerProfilePayload): Promise<ICustomer> {
    const { data } = await axiosInstance.patch<ICustomer>('/customer/profile', {
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      mobileNumber: payload.mobileNumber.trim(),
      addressLine: payload.addressLine.trim(),
      city: payload.city.trim(),
      state: payload.state.trim(),
      pincode: payload.pincode.trim(),
      profileImage: payload.profileImage?.trim() || '',
    })

    return data
  },
}
