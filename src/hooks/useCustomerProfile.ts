
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { customerApi } from '@/api/customer.api'
import { useCustomerId } from '@/hooks/useCart'
import { useAuthStore } from '@/store/auth.store'
import { queryKeys } from '@/utils/queryKeys'
import type { UpdateCustomerProfilePayload } from '@/interfaces'

export const useCustomerProfile = () => {
  const customerId = useCustomerId()
  return useQuery({
    queryKey: queryKeys.customerProfile(customerId ?? ''),
    queryFn: () => customerApi.getProfile(customerId as string),
    enabled: Boolean(customerId),
  })
}

export const useUpdateCustomerProfile = () => {
  const queryClient = useQueryClient()
  const customerId = useCustomerId()
  const updateUser = useAuthStore((state) => state.updateUser)

  return useMutation({
    mutationFn: (payload: UpdateCustomerProfilePayload) => {
      if (!customerId) throw new Error('Please login as a customer to update profile')
      return customerApi.updateProfile(customerId, payload)
    },
    onSuccess: (profile) => {
      toast.success('Profile updated successfully')
      updateUser({ firstName: profile.firstName, lastName: profile.lastName, profileImage: profile.profileImage })
      queryClient.invalidateQueries({ queryKey: queryKeys.customerProfile(customerId ?? '') })
    },
    onError: (error: Error) => toast.error(error.message),
  })
}
