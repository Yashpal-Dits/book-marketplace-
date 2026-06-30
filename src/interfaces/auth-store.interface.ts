import type { AuthSession } from '@/interfaces/auth.interface'
import type { ISeller } from '@/interfaces/seller.interface'
import type { SafeUser } from '@/interfaces/user.interface'

export interface AuthState {
  user: SafeUser | null
  profileId?: string
  sellerStatus?: string
  token?: string
  refreshToken?: string

  impersonatedSellerId?: string
  impersonatedSellerName?: string
  impersonatedCustomerId?: string
  impersonatedCustomerName?: string

  isAuthenticated: boolean

  setSession: (session: AuthSession) => void
  updateUser: (user: Partial<SafeUser>) => void

  startSellerImpersonation: (seller: Pick<ISeller, 'id' | 'businessName'>) => void
  stopSellerImpersonation: () => void

  startCustomerImpersonation: (customer: { id: string; name: string }) => void
  stopCustomerImpersonation: () => void

  logout: () => void
}