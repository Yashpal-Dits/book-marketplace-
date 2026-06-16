import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { profileApi } from '@/api/profile.api'
import { Role } from '@/enums/role.enum'
import { useAuthStore } from '@/store/auth.store'
import { queryKeys } from '@/utils/queryKeys'
import type { UpdateCustomerProfilePayload } from '@/interfaces'
import type { UpdateSellerProfilePayload } from '@/interfaces'
import type { UpdateAdminProfilePayload } from '@/interfaces'

export const useCustomerProfile = () => {
  const { user, profileId, impersonatedCustomerId } = useAuthStore()
  const effectiveProfileId = user?.role === Role.ADMIN && impersonatedCustomerId 
    ? impersonatedCustomerId 
    : profileId

  return useQuery({
    queryKey: queryKeys.customerProfile(effectiveProfileId ?? ''),
    queryFn: () => profileApi.getCustomerProfile(effectiveProfileId as string),
    enabled: (user?.role === Role.CUSTOMER && Boolean(profileId)) || (user?.role === Role.ADMIN && Boolean(impersonatedCustomerId)),
  })
}

export const useUpdateCustomerProfile = () => {
  const queryClient = useQueryClient()
  const { user, profileId, impersonatedCustomerId, updateUser } = useAuthStore()
  const effectiveProfileId = user?.role === Role.ADMIN && impersonatedCustomerId 
    ? impersonatedCustomerId 
    : profileId

  return useMutation({
    mutationFn: (payload: UpdateCustomerProfilePayload) => {
      if (!effectiveProfileId) throw new Error('Customer profile not found')
      return profileApi.updateCustomerProfile(effectiveProfileId, payload)
    },
    onSuccess: (profile) => {
      toast.success('Profile updated successfully')
      if (user?.role !== Role.ADMIN) {
        updateUser({ firstName: profile.firstName, lastName: profile.lastName, profileImage: profile.profileImage })
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.customerProfile(effectiveProfileId ?? '') })
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export const useSellerProfile = () => {
  const { user, profileId } = useAuthStore()
  return useQuery({
    queryKey: queryKeys.sellerProfile(profileId ?? ''),
    queryFn: () => profileApi.getSellerProfile(profileId as string),
    enabled: user?.role === Role.SELLER && Boolean(profileId),
  })
}

export const useUpdateSellerProfile = () => {
  const queryClient = useQueryClient()
  const { profileId, updateUser } = useAuthStore()

  return useMutation({
    mutationFn: (payload: UpdateSellerProfilePayload) => {
      if (!profileId) throw new Error('Seller profile not found')
      return profileApi.updateSellerProfile(profileId, payload)
    },
    onSuccess: (profile) => {
      toast.success('Seller profile updated')
      const [firstName = profile.contactPerson, ...rest] = profile.contactPerson.split(' ')
      updateUser({ firstName, lastName: rest.join(' '), profileImage: profile.storeLogo })
      queryClient.invalidateQueries({ queryKey: queryKeys.sellerProfile(profileId ?? '') })
      queryClient.invalidateQueries({ queryKey: ['seller'] })
      queryClient.invalidateQueries({ queryKey: ['admin'] })
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export const useAdminProfile = () => {
  const user = useAuthStore((state) => state.user)
  return useQuery({
    queryKey: queryKeys.adminProfile(user?.id ?? ''),
    queryFn: () => profileApi.getAdminProfile(user?.id as string),
    enabled: user?.role === Role.ADMIN && Boolean(user?.id),
  })
}

export const useUpdateAdminProfile = () => {
  const queryClient = useQueryClient()
  const { user, updateUser } = useAuthStore()

  return useMutation({
    mutationFn: (payload: UpdateAdminProfilePayload) => {
      if (!user?.id) throw new Error('Admin profile not found')
      return profileApi.updateAdminProfile(user.id, payload)
    },
    onSuccess: (profile) => {
      toast.success('Admin profile updated')
      updateUser(profile)
      queryClient.invalidateQueries({ queryKey: queryKeys.adminProfile(user?.id ?? '') })
    },
    onError: (error: Error) => toast.error(error.message),
  })
}
