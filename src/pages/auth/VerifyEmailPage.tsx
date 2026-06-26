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

/**
 * Email verification via OTP. The email is passed through navigation state
 * (from registration or an unverified login attempt). Verifying flips the
 * customer's status to ACTIVE on the backend, then routes to Login.
 */
export const VerifyEmailPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const email = (location.state as { email?: string } | null)?.email ?? ''

  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState<string | undefined>()
  const [resendIn, setResendIn] = useState(RESEND_SECONDS)

  // No email in state → nothing to verify; send the user to register.
  useEffect(() => {
    if (!email) navigate('/register', { replace: true })
  }, [email, navigate])

  useEffect(() => {
    if (resendIn <= 0) return
    const t = setInterval(() => setResendIn((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [resendIn])

  const verifyMutation = useMutation({
    mutationFn: () => authApi.verifyOtp(email, otp),
    onSuccess: () => {
      toast.success('Email verified successfully! You can now log in.')
      navigate('/login', { replace: true })
    },
    onError: (error: Error) => setOtpError(error.message),
  })

  const resendMutation = useMutation({
    mutationFn: () => authApi.sendOtp(email),
    onSuccess: (res) => {
      setResendIn(RESEND_SECONDS)
      setOtp('')
      setOtpError(undefined)
      toast.success(`OTP resent to ${email} (demo code: ${res.devOtp})`, { duration: 6000 })
    },
    onError: (error: Error) => toast.error(error.message),
  })

  if (!email) return null

  return (
    <AuthShell mode="register">
      <div>
        <h1 className="font-display text-2xl font-extrabold uppercase tracking-tight text-[#0b1235] sm:text-3xl lg:text-4xl">
          Verify Your Email
        </h1>
        <p className="mt-2 text-sm text-stone-500 sm:mt-3">
          Enter the 6-digit code we sent to{' '}
          <span className="font-semibold text-stone-700">{email}</span> to activate your account.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (otp.length === OTP_LENGTH) verifyMutation.mutate()
        }}
        className="mt-8 space-y-5 sm:mt-10"
      >
        <OtpInput value={otp} onChange={setOtp} length={OTP_LENGTH} hasError={Boolean(otpError)} disabled={verifyMutation.isPending} />
        {otpError ? <p className="text-center text-xs font-medium text-red-600">{otpError}</p> : null}

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
