import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { authApi } from '@/api/auth.api'
import { AuthShell } from '@/components/common/AuthShell'
import { OtpInput } from '@/components/common/OtpInput'

const OTP_LENGTH = 6
const RESEND_SECONDS = 30

type VerifyEmailState = {
  email?: string
  source?: 'customer-register' | 'seller-register' | string
}

export const VerifyEmailPage = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const state = (location.state as VerifyEmailState | null) || {}
  const email = state.email || ''
  const isSellerVerification = state.source === 'seller-register'

  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState<string | undefined>()
  const [resendIn, setResendIn] = useState(RESEND_SECONDS)

  useEffect(() => {
    if (!email) navigate('/register', { replace: true })
  }, [email, navigate])

  useEffect(() => {
    if (resendIn <= 0) return

    const timer = setInterval(() => {
      setResendIn((seconds) => seconds - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [resendIn])

  const verifyMutation = useMutation({
    mutationFn: () => authApi.verifyOtp(email, otp),
    onSuccess: () => {
      if (isSellerVerification) {
        toast.success('Email verified successfully! Your seller account is now pending admin approval.', {
          duration: 6000,
        })
      } else {
        toast.success('Email verified successfully! You can now log in.', {
          duration: 6000,
        })
      }

      navigate('/login', { replace: true })
    },
    onError: (error: Error) => {
      setOtpError(error.message)
    },
  })

  const resendMutation = useMutation({
    mutationFn: () => authApi.sendOtp(email),
    onSuccess: () => {
      setResendIn(RESEND_SECONDS)
      setOtp('')
      setOtpError(undefined)

      toast.success(`OTP resent to ${email}.`, {
        duration: 6000,
      })
    },
    onError: (error: Error) => toast.error(error.message),
  })

  if (!email) return null

  return (
    <AuthShell mode={isSellerVerification ? 'seller' : 'register'}>
      <div>
        <h1 className="font-display text-2xl font-extrabold uppercase tracking-tight text-[#0b1235] sm:text-3xl lg:text-4xl">
          Verify Your Email
        </h1>

        <p className="mt-2 text-sm text-stone-500 sm:mt-3">
          Enter the 6-digit code we sent to{' '}
          <span className="font-semibold text-stone-700">{email}</span>.
        </p>

        {isSellerVerification ? (
          <p className="mt-2 text-xs font-medium text-stone-500">
            After email verification, your seller account will remain pending until admin approval.
          </p>
        ) : null}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (otp.length === OTP_LENGTH) verifyMutation.mutate()
        }}
        className="mt-8 space-y-5 sm:mt-10"
      >
        <OtpInput
          value={otp}
          onChange={(value) => {
            setOtp(value)
            setOtpError(undefined)
          }}
          length={OTP_LENGTH}
          hasError={Boolean(otpError)}
          disabled={verifyMutation.isPending}
        />

        {otpError ? (
          <p className="text-center text-xs font-medium text-red-600">{otpError}</p>
        ) : null}

        <button
          type="submit"
          disabled={otp.length !== OTP_LENGTH || verifyMutation.isPending}
          className="cursor-pointer inline-flex h-12 w-full items-center justify-center rounded-full bg-[#f0532d] text-sm font-semibold text-white transition hover:bg-[#d8431f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {verifyMutation.isPending ? 'Verifying...' : 'Verify email'}
        </button>

        <div className="text-center text-xs text-stone-500">
          Didn&apos;t get the code?{' '}
          {resendIn > 0 ? (
            <span className="font-semibold text-stone-400">Resend in {resendIn}s</span>
          ) : (
            <button
              type="button"
              onClick={() => resendMutation.mutate()}
              disabled={resendMutation.isPending}
              className="cursor-pointer font-semibold text-[#f0532d] hover:underline disabled:opacity-60"
            >
              {resendMutation.isPending ? 'Sending...' : 'Resend OTP'}
            </button>
          )}
        </div>
      </form>

      <Link
        to="/login"
        className="mx-auto mt-6 flex w-fit cursor-pointer items-center gap-1.5 text-xs font-medium text-stone-500 transition hover:text-[#f0532d]"
      >
        <FiArrowLeft /> Back to Login
      </Link>
    </AuthShell>
  )
}