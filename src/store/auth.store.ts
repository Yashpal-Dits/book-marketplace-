import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthState } from '@/interfaces'
import { AUTH_STORAGE_KEY } from '@/utils/constants'

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profileId: undefined,
      sellerStatus: undefined,
      token: undefined,
      refreshToken: undefined,

      impersonatedSellerId: undefined,
      impersonatedSellerName: undefined,
      impersonatedCustomerId: undefined,
      impersonatedCustomerName: undefined,

      isAuthenticated: false,

      setSession: (session) =>
        set({
          user: session.user,
          profileId: session.profileId,
          sellerStatus: session.sellerStatus,
          token: session.token,
          refreshToken: session.refreshToken,

          impersonatedSellerId: undefined,
          impersonatedSellerName: undefined,
          impersonatedCustomerId: undefined,
          impersonatedCustomerName: undefined,

          isAuthenticated: true,
        }),

      updateUser: (user) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...user } : state.user,
        })),

      startSellerImpersonation: (seller) =>
        set({
          impersonatedSellerId: seller.id,
          impersonatedSellerName: seller.businessName,
        }),

      stopSellerImpersonation: () =>
        set({
          impersonatedSellerId: undefined,
          impersonatedSellerName: undefined,
        }),

      startCustomerImpersonation: (customer) =>
        set({
          impersonatedCustomerId: customer.id,
          impersonatedCustomerName: customer.name,
        }),

      stopCustomerImpersonation: () =>
        set({
          impersonatedCustomerId: undefined,
          impersonatedCustomerName: undefined,
        }),

      logout: () =>
        set({
          user: null,
          profileId: undefined,
          sellerStatus: undefined,
          token: undefined,
          refreshToken: undefined,

          impersonatedSellerId: undefined,
          impersonatedSellerName: undefined,
          impersonatedCustomerId: undefined,
          impersonatedCustomerName: undefined,

          isAuthenticated: false,
        }),
    }),
    { name: AUTH_STORAGE_KEY },
  ),
)