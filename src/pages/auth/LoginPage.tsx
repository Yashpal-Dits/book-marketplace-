import { useMutation } from '@tanstack/react-query'
import { useFormik } from 'formik'
import toast from 'react-hot-toast'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { authApi } from '@/api/auth.api'
import { AuthShell } from '@/components/common/AuthShell'
import { FormInput } from '@/components/common/FormInput'
import { PasswordInput } from '@/components/common/PasswordInput'
import { Role } from '@/enums/role.enum'
import { SellerStatus } from '@/enums/seller-status.enum'
import { loginSchema } from '@/schemas/auth.schema'
import { useAuthStore } from '@/store/auth.store'

export const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const setSession = useAuthStore((state) => state.setSession)

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (session) => {
      setSession(session)
      toast.success('Login successful')

      const from = (location.state as { from?: { pathname: string } } | null)
        ?.from?.pathname

      if (from) return navigate(from, { replace: true })

      if (session.role === Role.ADMIN) return navigate('/admin/dashboard')

      if (session.role === Role.SELLER) {
        return navigate(
          session.sellerStatus === SellerStatus.APPROVED
            ? '/seller/dashboard'
            : '/seller/pending-approval',
        )
      }

      return navigate('/')
    },
    onError: (error) => toast.error(error.message),
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0b1235] sm:text-3xl lg:text-4xl">
          Welcome Back to Bseller!
        </h1>
        <p className="mt-2 text-sm text-stone-500 sm:mt-3">Sign in to your account</p>
      </div>

      <form onSubmit={formik.handleSubmit} noValidate className="mt-8 space-y-5 sm:mt-10">
        <FormInput
          label="Email * (Required)"
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
          label="Password * (Required)"
          name="password"
          autoComplete="current-password"
          maxLength={50}
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

          <button type="button" className="transition hover:text-[#f0532d]">
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#f0532d] text-sm font-semibold text-white transition hover:bg-[#d8431f] disabled:cursor-not-allowed disabled:opacity-60"
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
