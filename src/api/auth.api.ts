import { axiosInstance } from './axiosInstance'
import { Role } from '@/enums/role.enum'
import { CustomerStatus } from '@/enums/customer-status.enum'
import { SellerStatus } from '@/enums/seller-status.enum'
import type { ICustomer } from '@/interfaces'
import type { ISeller } from '@/interfaces'
import type { IUser, SafeUser } from '@/interfaces'
import { generateId } from '@/utils/generateId'
import type {
  AuthSession,
  CustomerRegisterPayload,
  LoginPayload,
  SellerRegisterPayload
} from '@/interfaces'


// Fixed demo OTP used while the backend is mocked with json-server.
// Remove this once the real OTP backend is connected.
const MOCK_OTP = '123456'

/**
 * Thrown on login when a customer's email is not yet verified (status PENDING).
 * The UI catches this to redirect the user to the OTP verification screen.
 * Mirrors the backend's "email is not verified yet" response.
 */
export class EmailNotVerifiedError extends Error {
  email: string
  constructor(email: string) {
    super('Your email is not verified yet. Please verify your email before logging in.')
    this.name = 'EmailNotVerifiedError'
    this.email = email
  }
}

const toSafeUser = (user: IUser): SafeUser => {
  const { password: _password, ...safeUser } = user
  void _password
  return safeUser
}

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthSession> {
    const { data: users } = await axiosInstance.get<IUser[]>('/users', {
      params: { email: payload.email, password: payload.password },
    })

    const user = users[0]
    if (!user) throw new Error('Invalid login credentials')

    let profileId: string | undefined
    let sellerStatus: string | undefined

    if (user.role === Role.CUSTOMER) {
      const { data } = await axiosInstance.get<ICustomer[]>('/customers', { params: { userId: user.id } })
      const customer = data[0]
      if (customer?.status === CustomerStatus.PENDING) {
        // Matches backend: unverified customers cannot log in until OTP verified.
        throw new EmailNotVerifiedError(payload.email)
      }
      if (customer?.status === CustomerStatus.BLOCKED) {
        throw new Error('Your account has been blocked. Please contact support.')
      }
      profileId = customer?.id
    }

    if (user.role === Role.SELLER) {
      const { data } = await axiosInstance.get<ISeller[]>('/sellers', { params: { userId: user.id } })
      profileId = data[0]?.id
      sellerStatus = data[0]?.status
    }

    return { user: toSafeUser(user), role: user.role, profileId, sellerStatus }
  },

  async registerCustomer(payload: CustomerRegisterPayload): Promise<AuthSession> {
    const { data: existingUsers } = await axiosInstance.get<IUser[]>('/users', { params: { email: payload.email } })
    if (existingUsers.length) throw new Error('Email already exists')

    const now = new Date().toISOString()
    const user: IUser = {
      id: generateId('user'),
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      password: payload.password,
      role: Role.CUSTOMER,
      createdAt: now,
    }
    const customer: ICustomer = {
      id: generateId('customer'),
      userId: user.id,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      // Account starts unverified; OTP verification flips it to ACTIVE.
      status: CustomerStatus.PENDING,
      createdAt: now,
    }

    await axiosInstance.post('/users', user)
    await axiosInstance.post('/customers', customer)
    await axiosInstance.post('/carts', { id: generateId('cart'), customerId: customer.id, createdAt: now })

    // MOCK: "send" the OTP email. Real backend emails a random 6-digit code.
    // Returns devOtp so the UI can surface the demo code while mocked.
    return { user: toSafeUser(user), role: Role.CUSTOMER, profileId: customer.id, devOtp: MOCK_OTP }
  },

  async registerSeller(payload: SellerRegisterPayload): Promise<AuthSession> {
    const { data: existingUsers } = await axiosInstance.get<IUser[]>('/users', { params: { email: payload.email } })
    if (existingUsers.length) throw new Error('Email already exists')

    const now = new Date().toISOString()
    const [firstName = payload.contactPerson, ...rest] = payload.contactPerson.split(' ')
    const user: IUser = {
      id: generateId('user'),
      firstName,
      lastName: rest.join(' '),
      email: payload.email,
      password: payload.password,
      role: Role.SELLER,
      createdAt: now,
    }
    const seller: ISeller = {
      id: generateId('seller'),
      userId: user.id,
      businessName: payload.businessName,
      contactPerson: payload.contactPerson,
      email: payload.email,
      mobileNumber: payload.mobileNumber,
      status: SellerStatus.PENDING,
      createdAt: now,
    }

    await axiosInstance.post('/users', user)
    await axiosInstance.post('/sellers', seller)

    return { user: toSafeUser(user), role: Role.SELLER, profileId: seller.id, sellerStatus: seller.status }
  },

  // ───────────────────────────────────────────────────────────────────────────
  // Forgot-password / OTP flow.
  //
  // NOTE: json-server cannot send emails or generate real OTPs, so the steps
  // below are MOCKED for UI testing. A fixed demo OTP (123456) is used.
  // When the real backend is ready, replace the bodies with the matching calls,
  // e.g.:
  //   requestPasswordReset → POST /auth/forgot-password { email }
  //   verifyOtp            → POST /auth/verify-otp      { email, otp }
  //   resetPassword        → POST /auth/reset-password  { email, otp, password }
  // The function signatures can stay the same so the pages don't change.
  // ───────────────────────────────────────────────────────────────────────────

  /** Step 1 — check the email exists and "send" an OTP. */
  async requestPasswordReset(email: string): Promise<{ devOtp: string }> {
    const { data: users } = await axiosInstance.get<IUser[]>('/users', { params: { email } })
    if (!users.length) throw new Error('No account found with this email')
    // MOCK: pretend an OTP email was sent. Real backend would email a random code.
    return { devOtp: MOCK_OTP }
  },

  /** Step 2 — verify the entered OTP. */
  async verifyOtp(email: string, otp: string): Promise<{ verified: true }> {
    const { data: users } = await axiosInstance.get<IUser[]>('/users', { params: { email } })
    const user = users[0]
    if (!user) throw new Error('No account found with this email')
    // MOCK: accept the fixed demo OTP only. Real backend validates the sent code.
    if (otp !== MOCK_OTP) throw new Error('Invalid OTP. Please try again.')

    // Mirror backend: verifying a customer's email flips PENDING → ACTIVE.
    if (user.role === Role.CUSTOMER) {
      const { data: customers } = await axiosInstance.get<ICustomer[]>('/customers', { params: { userId: user.id } })
      const customer = customers[0]
      if (customer && customer.status === CustomerStatus.PENDING) {
        await axiosInstance.patch(`/customers/${customer.id}`, { status: CustomerStatus.ACTIVE })
      }
    }
    return { verified: true }
  },

  /**
   * Resend the verification OTP to an email.
   * Real backend: POST /auth/send-otp { email }
   */
  async sendOtp(email: string): Promise<{ devOtp: string }> {
    const { data: users } = await axiosInstance.get<IUser[]>('/users', { params: { email } })
    if (!users.length) throw new Error('No account found with this email')
    return { devOtp: MOCK_OTP }
  },

  /** Step 3 — set a new password after OTP verification. */
  async resetPassword(email: string, otp: string, password: string): Promise<{ success: true }> {
    const { data: users } = await axiosInstance.get<IUser[]>('/users', { params: { email } })
    const user = users[0]
    if (!user) throw new Error('No account found with this email')
    if (otp !== MOCK_OTP) throw new Error('Invalid or expired OTP. Please try again.')
    await axiosInstance.patch(`/users/${user.id}`, { password })
    return { success: true }
  },
}
