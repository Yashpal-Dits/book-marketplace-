import { axiosInstance } from './axiosInstance'
import type { ICustomer, UpdateCustomerProfilePayload } from '@/interfaces'
import type { IUser } from '@/interfaces'

export const customerApi = {
  async getProfile(customerId: string): Promise<ICustomer> {
    const { data } = await axiosInstance.get<ICustomer>(`/customers/${customerId}`)
    return data
  },

  async updateProfile(customerId: string, payload: UpdateCustomerProfilePayload): Promise<ICustomer> {
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

    // Keep login user profile name in sync because Header reads from users/auth store.
    await axiosInstance.patch<IUser>(`/users/${customer.userId}`, {
      firstName: updatedCustomer.firstName,
      lastName: updatedCustomer.lastName,
      profileImage: updatedCustomer.profileImage,
    })

    return data
  },
}
