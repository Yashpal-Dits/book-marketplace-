import { useMutation } from '@tanstack/react-query'
import { useFormik } from 'formik'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { authApi, EmailNotVerifiedError } from '@/api/auth.api'
import { AuthShell } from '@/components/common/AuthShell'
import { FormInput } from '@/components/common/FormInput'
import { PasswordInput } from '@/components/common/PasswordInput'
import { Role } from '@/enums/role.enum'
import { SellerStatus } from '@/enums/seller-status.enum'
import { loginSchema } from '@/schemas/auth.schema'
import { useAuthStore } from '@/store/auth.store'


export const LoginPage = () => {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (session) => {
      setSession(session)
      toast.success('Login successful')

      // Always route to the role's home (ignore any previously-visited page).
      if (session.role === Role.ADMIN) {
        return navigate('/admin/dashboard', { replace: true })
      }

      if (session.role === Role.SELLER) {
        const sellerHome =
          session.sellerStatus === SellerStatus.APPROVED ? '/seller/dashboard' : '/seller/pending-approval'
        return navigate(sellerHome, { replace: true })
      }

      return navigate('/', { replace: true })
    },
    onError: async (error) => {
      // Unverified customer → take them to the email verification screen and
      // (best practice) resend a fresh OTP so they can finish in one step.
      if (error instanceof EmailNotVerifiedError) {
        toast.error(error.message)
        try {
          const res = await authApi.sendOtp(error.email)
          toast.success(`Verification code sent (demo code: ${res.devOtp})`, { duration: 6000 })
        } catch {
          // ignore resend failure; user can resend from the verify screen
        }
        return navigate('/verify-email', { state: { email: error.email } })
      }
      toast.error(error.message)
    },
  })

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
    validationSchema: loginSchema,
    onSubmit: ({ email, password }) => mutation.mutate({ email, password }),
  })

  return (
    <AuthShell mode="login">
      <div className="text-center lg:text-left">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f0532d]">Welcome back</p>
        <h1 className="font-display mt-2 text-3xl font-extrabold uppercase tracking-tight text-[#0b1235] sm:text-4xl">
          Sign in to <span className="text-[#f0532d]">Bseller</span>
        </h1>
        <p className="mt-2 text-sm text-stone-500 sm:mt-3">Enter your details to continue shopping.</p>
      </div>

      <form onSubmit={formik.handleSubmit} noValidate className="mt-8 space-y-5 sm:mt-10">
        <FormInput
          label={<>Email <span className="text-[#f0532d] font-bold">*</span></>}
          name="email"
          type="email"
          autoComplete="email"
          maxLength={50}
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email ? formik.errors.email : undefined}
        />

        <PasswordInput
          label={<>Password <span className="text-[#f0532d] font-bold">*</span></>}
          name="password"
          autoComplete="current-password"
          maxLength={15}
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password ? formik.errors.password : undefined}
        />

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formik.values.rememberMe}
              onChange={formik.handleChange}
              className="h-3.5 w-3.5 accent-[#f0532d]"
            />
            Remember Me
          </label>

          <Link to="/forgot-password" className="font-medium transition hover:text-[#f0532d]">
            Forgot Password?
          </Link>
        </div>

        <div className="pt-1 pb-1 text-center text-xs text-stone-400 font-medium">
          <span className="text-[#f0532d] font-extrabold">*</span> All fields required
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="cursor-pointer inline-flex h-12 w-full items-center justify-center rounded-full bg-[#f0532d] text-sm font-semibold text-white transition hover:bg-[#d8431f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {mutation.isPending ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="mt-8 text-center text-xs text-stone-500 sm:mt-10">
        Don&apos;t have any account?{' '}
        <Link to="/register" className="font-semibold text-[#f0532d] hover:underline">
          Register
        </Link>
      </p>
    </AuthShell>
  )
}
