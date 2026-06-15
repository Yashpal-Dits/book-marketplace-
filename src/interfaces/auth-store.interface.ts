import type { AuthSession } from '@/interfaces/auth.interface'
import type { ISeller } from '@/interfaces/seller.interface'
import type { SafeUser } from '@/interfaces/user.interface'

export interface AuthState {
  user: SafeUser | null
  profileId?: string
  sellerStatus?: string
  impersonatedSellerId?: string
  impersonatedSellerName?: string
  isAuthenticated: boolean
  setSession: (session: AuthSession) => void
  updateUser: (user: Partial<SafeUser>) => void
  startSellerImpersonation: (seller: Pick<ISeller, 'id' | 'businessName'>) => void
  stopSellerImpersonation: () => void
  logout: () => void
}
