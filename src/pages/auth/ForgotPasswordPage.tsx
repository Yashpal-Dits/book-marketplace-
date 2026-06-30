import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useFormik } from 'formik'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiMail } from 'react-icons/fi'
import { authApi } from '@/api/auth.api'
import { AuthShell } from '@/components/common/AuthShell'
import { FormInput } from '@/components/common/FormInput'
import { OtpInput } from '@/components/common/OtpInput'
import { PasswordInput } from '@/components/common/PasswordInput'
import { forgotPasswordSchema, resetPasswordSchema } from '@/schemas/auth.schema'

type Step = 'email' | 'otp' | 'reset'

const OTP_LENGTH = 6
const RESEND_SECONDS = 30

export const ForgotPasswordPage = () => {
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState<string | undefined>()
  const [resendIn, setResendIn] = useState(0)

  useEffect(() => {
    if (resendIn <= 0) return

    const timer = setInterval(() => {
      setResendIn((seconds) => seconds - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [resendIn])

  /**
   * Step 1:
   * Ask backend to generate/send password reset OTP.
   */
  const requestMutation = useMutation({
    mutationFn: (value: string) => authApi.requestPasswordReset(value),
    onSuccess: (_res, value) => {
      setEmail(value)
      setOtp('')
      setOtpError(undefined)
      setStep('otp')
      setResendIn(RESEND_SECONDS)

      toast.success(`OTP sent to ${value}. Please check your email.`, {
        duration: 6000,
      })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  /**
   * Step 2:
   * Do NOT call /auth/verify-otp here.
   *
   * Your backend /auth/verify-otp removes OTP from database after verifying.
   * If we call it here, then /auth/reset-password fails because OTP is gone.
   *
   * So here we only check OTP length locally and move to reset screen.
   * The backend will verify OTP securely inside /auth/reset-password.
   */
  const handleOtpContinue = () => {
    if (otp.length !== OTP_LENGTH) {
      setOtpError('OTP must be 6 digits')
      return
    }

    setOtpError(undefined)
    setStep('reset')
  }

  /**
   * Step 3:
   * Send email + OTP + newPassword to backend.
   * Backend verifies OTP and updates password.
   */
  const resetMutation = useMutation({
    mutationFn: (password: string) => authApi.resetPassword(email, otp, password),
    onSuccess: () => {
      toast.success('Password reset successful! Please log in with your new password.')
      navigate('/login')
    },
    onError: (error: Error) => {
      toast.error(error.message)

      /**
       * If OTP expired/invalid, send user back to OTP step.
       */
      const message = error.message.toLowerCase()
      if (message.includes('otp') || message.includes('password reset request')) {
        setStep('otp')
      }
    },
  })

  const emailFormik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: forgotPasswordSchema,
    onSubmit: ({ email: value }) => {
      requestMutation.mutate(value)
    },
  })

  const resetFormik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationSchema: resetPasswordSchema,
    onSubmit: ({ password }) => {
      resetMutation.mutate(password)
    },
  })

  const handleResend = () => {
    if (resendIn > 0 || !email) return

    setOtp('')
    setOtpError(undefined)
    requestMutation.mutate(email)
  }

  return (
    <AuthShell mode="login">
      {step === 'email' && (
        <>
          <div>
            <h1 className="font-display text-2xl font-extrabold uppercase tracking-tight text-[#0b1235] sm:text-3xl lg:text-4xl">
              Forgot Password?
            </h1>
            <p className="mt-2 text-sm text-stone-500 sm:mt-3">
              Enter the email linked to your account and we&apos;ll send you a 6-digit verification code.
            </p>
          </div>

          <form onSubmit={emailFormik.handleSubmit} noValidate className="mt-8 space-y-5 sm:mt-10">
            <FormInput
              label={
                <>
                  Email <span className="text-[#f0532d] font-bold">*</span>
                </>
              }
              name="email"
              type="email"
              autoComplete="email"
              maxLength={50}
              value={emailFormik.values.email}
              onChange={emailFormik.handleChange}
              onBlur={emailFormik.handleBlur}
              error={emailFormik.touched.email ? emailFormik.errors.email : undefined}
            />

            <button
              type="submit"
              disabled={requestMutation.isPending}
              className="cursor-pointer inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#f0532d] text-sm font-semibold text-white transition hover:bg-[#d8431f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiMail /> {requestMutation.isPending ? 'Sending code...' : 'Send verification code'}
            </button>
          </form>
        </>
      )}

      {step === 'otp' && (
        <>
          <div>
            <h1 className="font-display text-2xl font-extrabold uppercase tracking-tight text-[#0b1235] sm:text-3xl lg:text-4xl">
              Verify Code
            </h1>
            <p className="mt-2 text-sm text-stone-500 sm:mt-3">
              Enter the 6-digit code sent to{' '}
              <span className="font-semibold text-stone-700">{email}</span>.
            </p>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault()
              handleOtpContinue()
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
              disabled={requestMutation.isPending}
            />

            {otpError ? (
              <p className="text-center text-xs font-medium text-red-600">{otpError}</p>
            ) : null}

            <button
              type="submit"
              disabled={otp.length !== OTP_LENGTH}
              className="cursor-pointer inline-flex h-12 w-full items-center justify-center rounded-full bg-[#f0532d] text-sm font-semibold text-white transition hover:bg-[#d8431f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Verify & continue
            </button>

            <div className="text-center text-xs text-stone-500">
              Didn&apos;t get the code?{' '}
              {resendIn > 0 ? (
                <span className="font-semibold text-stone-400">Resend in {resendIn}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={requestMutation.isPending}
                  className="cursor-pointer font-semibold text-[#f0532d] hover:underline disabled:opacity-60"
                >
                  {requestMutation.isPending ? 'Sending...' : 'Resend OTP'}
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setStep('email')
                setOtp('')
                setOtpError(undefined)
              }}
              className="mx-auto flex cursor-pointer items-center gap-1.5 text-xs font-medium text-stone-500 transition hover:text-[#f0532d]"
            >
              <FiArrowLeft /> Change email
            </button>
          </form>
        </>
      )}

      {step === 'reset' && (
        <>
          <div>
            <h1 className="font-display text-2xl font-extrabold uppercase tracking-tight text-[#0b1235] sm:text-3xl lg:text-4xl">
              Set New Password
            </h1>
            <p className="mt-2 text-sm text-stone-500 sm:mt-3">
              Create a new password for{' '}
              <span className="font-semibold text-stone-700">{email}</span>.
            </p>
          </div>

          <form onSubmit={resetFormik.handleSubmit} noValidate className="mt-8 space-y-5 sm:mt-10">
            <PasswordInput
              label={
                <>
                  New Password <span className="text-[#f0532d] font-bold">*</span>
                </>
              }
              name="password"
              autoComplete="new-password"
              maxLength={15}
              value={resetFormik.values.password}
              onChange={resetFormik.handleChange}
              onBlur={resetFormik.handleBlur}
              error={resetFormik.touched.password ? resetFormik.errors.password : undefined}
            />

            <PasswordInput
              label={
                <>
                  Confirm Password <span className="text-[#f0532d] font-bold">*</span>
                </>
              }
              name="confirmPassword"
              autoComplete="new-password"
              maxLength={15}
              value={resetFormik.values.confirmPassword}
              onChange={resetFormik.handleChange}
              onBlur={resetFormik.handleBlur}
              error={resetFormik.touched.confirmPassword ? resetFormik.errors.confirmPassword : undefined}
            />

            <button
              type="submit"
              disabled={resetMutation.isPending}
              className="cursor-pointer inline-flex h-12 w-full items-center justify-center rounded-full bg-[#f0532d] text-sm font-semibold text-white transition hover:bg-[#d8431f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resetMutation.isPending ? 'Resetting...' : 'Reset password'}
            </button>

            <button
              type="button"
              onClick={() => setStep('otp')}
              className="mx-auto flex cursor-pointer items-center gap-1.5 text-xs font-medium text-stone-500 transition hover:text-[#f0532d]"
            >
              <FiArrowLeft /> Back to OTP
            </button>
          </form>
        </>
      )}

      <p className="mt-8 text-center text-xs text-stone-500 sm:mt-10">
        Remember your password?{' '}
        <Link to="/login" className="font-semibold text-[#f0532d] hover:underline">
          Back to Login
        </Link>
      </p>
    </AuthShell>
  )
}