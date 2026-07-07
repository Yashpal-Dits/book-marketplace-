import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { customerApi } from '@/api/customer.api'
import { Role } from '@/enums/role.enum'
import { useAuthStore } from '@/store/auth.store'
import { queryKeys } from '@/utils/queryKeys'
import type { UpdateCustomerProfilePayload } from '@/interfaces'

export const useCustomerProfile = () => {
  const { user, profileId, impersonatedCustomerId } = useAuthStore()

  const effectiveProfileId =
    user?.role === Role.ADMIN && impersonatedCustomerId
      ? impersonatedCustomerId
      : profileId

  return useQuery({
    queryKey: queryKeys.customerProfile(effectiveProfileId ?? 'me'),
    queryFn: customerApi.getProfile,
    enabled:
      (user?.role === Role.CUSTOMER && Boolean(profileId)) ||
      (user?.role === Role.ADMIN && Boolean(impersonatedCustomerId)),
  })
}

export const useUpdateCustomerProfile = () => {
  const queryClient = useQueryClient()
  const { user, profileId, impersonatedCustomerId, updateUser } = useAuthStore()

  const effectiveProfileId =
    user?.role === Role.ADMIN && impersonatedCustomerId
      ? impersonatedCustomerId
      : profileId

  return useMutation({
    mutationFn: (payload: UpdateCustomerProfilePayload) =>
      customerApi.updateProfile(payload),

    onSuccess: (profile) => {
      toast.success('Profile updated successfully')

      if (user?.role !== Role.ADMIN) {
        updateUser({
          firstName: profile.firstName,
          lastName: profile.lastName,
          profileImage: profile.profileImage,
        })
      }

      queryClient.invalidateQueries({
        queryKey: queryKeys.customerProfile(effectiveProfileId ?? 'me'),
      })
    },

    onError: (error: Error) => toast.error(error.message),
  })
}
