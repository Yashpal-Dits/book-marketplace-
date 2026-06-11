import { useMutation } from '@tanstack/react-query'
import { useFormik } from 'formik'
import toast from 'react-hot-toast'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FiEye } from 'react-icons/fi'
import { authApi } from '@/api/auth.api'
import { AuthShell } from '@/components/common/AuthShell'
import { Button } from '@/components/common/Button'
import { FormInput } from '@/components/common/FormInput'
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
        <h1 className=" text-3xl font-bold tracking-tight text-[#0b1235] sm:text-4xl ">
          Welcome Back to Paper Haven!
        </h1>
        <p className="mt-3 text-sm text-stone-500">
          Sign in to your account
        </p>
      </div>

      <form onSubmit={formik.handleSubmit} className="mt-10 space-y-5">
        <FormInput
          label="Email * (Required)"
          name="email"
          maxLength={50}
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email ? formik.errors.email : undefined}
        />

        <div className="relative">
          <FormInput
            label="Password * (Required)"
            name="password"
            type="password"
            maxLength={50}
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.password ? formik.errors.password : undefined
            }
          />
          <FiEye className="absolute right-4 top-10 text-stone-400" />
        </div>

        <div className="flex items-center justify-between text-xs text-stone-500">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formik.values.rememberMe}
              onChange={formik.handleChange}
              className="h-3.5 w-3.5 accent-black"
            />
            Remember Me
          </label>

          <button type="button" className="hover:text-amber-900">
            Forgot Password?
          </button>
        </div>

        <Button
          type="submit"
          disabled={mutation.isPending}
          className="h-12 w-full rounded-lg bg-[#202124] hover:bg-black"
        >
          {mutation.isPending ? 'Logging in...' : 'Login'}
        </Button>
      </form>

      <p className="mt-10 text-center text-xs text-stone-500">
        Don&apos;t have any account?{' '}
        <Link to="/register" className="font-medium text-amber-900">
          Register
        </Link>
      </p>
    </AuthShell>
  )
}