import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { authApi } from '@/api/auth.api'
import { useAuthStore } from '@/store/auth.store'

export const useAuth = () => useAuthStore()

export const useChangePassword = () => {
  return useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string
      newPassword: string
    }) => authApi.changePassword(currentPassword, newPassword),
    onSuccess: (data) => {
      toast.success(data?.message || 'Password changed successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
