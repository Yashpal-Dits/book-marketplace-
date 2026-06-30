import { axiosInstance } from './axiosInstance'
import { Role } from '@/enums/role.enum'
import type { SafeUser } from '@/interfaces'
import type {
  AuthSession,
  CustomerRegisterPayload,
  LoginPayload,
  OtpResponse,
  ResetPasswordResponse,
  SellerRegisterPayload,
  VerifyOtpResponse,
} from '@/interfaces'

export class EmailNotVerifiedError extends Error {
  email: string

  constructor(email: string) {
    super('Your email is not verified yet. Please verify your email before logging in.')
    this.name = 'EmailNotVerifiedError'
    this.email = email
  }
}

interface BackendUser {
  _id?: string
  id?: string
  firstName?: string
  lastName?: string
  email: string
  role: Role
  mobileNumber?: string
  profileImage?: string
  createdAt?: string
  updatedAt?: string
}

interface BackendProfile {
  _id?: string
  id?: string
  status?: string
}

interface BackendAuthResponse {
  user: BackendUser
  customer?: BackendProfile
  seller?: BackendProfile
  customerId?: string
  sellerId?: string
  status?: string
  sellerStatus?: string
  token?: string
  accessToken?: string
  refreshToken?: string
}

const getBackendId = (value?: { _id?: string; id?: string } | string): string | undefined => {
  if (!value) return undefined
  if (typeof value === 'string') return value
  return value._id || value.id
}

const normalizeUser = (user: BackendUser): SafeUser => {
  return {
    id: getBackendId(user) || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email,
    role: user.role,
    mobileNumber: user.mobileNumber,
    profileImage: user.profileImage,
    createdAt: user.createdAt || '',
    updatedAt: user.updatedAt,
  }
}

const toAuthSession = (data: BackendAuthResponse): AuthSession => {
  const user = normalizeUser(data.user)

  const profileId =
    data.customerId ||
    data.sellerId ||
    getBackendId(data.customer) ||
    getBackendId(data.seller)

  return {
    user,
    role: user.role,
    profileId,
    sellerStatus: data.sellerStatus || data.seller?.status,
    token: data.token || data.accessToken,
    refreshToken: data.refreshToken,
  }
}

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message
  return 'Something went wrong'
}

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthSession> {
    try {
      const { data } = await axiosInstance.post<BackendAuthResponse>('/auth/login', {
        email: payload.email.trim(),
        password: payload.password,
      })

      return toAuthSession(data)
    } catch (error) {
      const message = getErrorMessage(error)

      if (message.toLowerCase().includes('email is not verified')) {
        throw new EmailNotVerifiedError(payload.email)
      }

      throw new Error(message)
    }
  },

  async registerCustomer(payload: CustomerRegisterPayload): Promise<AuthSession> {
    const { data } = await axiosInstance.post<BackendAuthResponse>('/auth/register/customer', {
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      email: payload.email.trim(),
      password: payload.password,
    })

    return toAuthSession(data)
  },

  async registerSeller(payload: SellerRegisterPayload): Promise<AuthSession> {
    const { data } = await axiosInstance.post<BackendAuthResponse>('/auth/register/seller', {
      businessName: payload.businessName.trim(),
      contactPerson: payload.contactPerson.trim(),
      email: payload.email.trim(),
      mobileNumber: payload.mobileNumber.trim(),
      password: payload.password,
    })

    return toAuthSession(data)
  },

  async sendOtp(email: string): Promise<OtpResponse> {
    const response = await axiosInstance.post('/auth/send-otp', {
      email: email.trim(),
    })

    return {
      message: response.data?.message || 'OTP sent to your email.',
    }
  },

  async verifyOtp(email: string, otp: string): Promise<VerifyOtpResponse> {
    const response = await axiosInstance.post('/auth/verify-otp', {
      email: email.trim(),
      otp,
    })

    return {
      verified: true,
      message: response.data?.message || 'OTP verified successfully.',
    }
  },

  async requestPasswordReset(email: string): Promise<OtpResponse> {
    const response = await axiosInstance.post('/auth/forgot-password', {
      email: email.trim(),
    })

    return {
      message: response.data?.message || 'Password reset OTP sent to your email.',
    }
  },

  async resetPassword(email: string, otp: string, password: string): Promise<ResetPasswordResponse> {
    const response = await axiosInstance.post('/auth/reset-password', {
      email: email.trim(),
      otp,
      newPassword: password,
    })

    return {
      success: true,
      message: response.data?.message || 'Password reset successful.',
    }
  },
}