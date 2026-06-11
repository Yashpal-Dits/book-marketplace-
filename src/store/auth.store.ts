import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthSession } from '@/interfaces/auth.interface'
import type { SafeUser } from '@/interfaces/user.interface'
import { AUTH_STORAGE_KEY } from '@/utils/constants'

interface AuthState {
  user: SafeUser | null
  profileId?: string
  sellerStatus?: string
  isAuthenticated: boolean
  setSession: (session: AuthSession) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profileId: undefined,
      sellerStatus: undefined,
      isAuthenticated: false,
      setSession: (session) =>
        set({
          user: session.user,
          profileId: session.profileId,
          sellerStatus: session.sellerStatus,
          isAuthenticated: true,
        }),
      logout: () => set({ user: null, profileId: undefined, sellerStatus: undefined, isAuthenticated: false }),
    }),
    { name: AUTH_STORAGE_KEY },
  ),
)
