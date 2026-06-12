import { useMutation } from '@tanstack/react-query'
import { useFormik } from 'formik'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '@/api/auth.api'
import { AuthShell } from '@/components/common/AuthShell'
import { FormInput } from '@/components/common/FormInput'
import { PasswordInput } from '@/components/common/PasswordInput'
import { customerRegisterSchema } from '@/schemas/auth.schema'
import { useAuthStore } from '@/store/auth.store'

export const RegisterPage = () => {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)

  const mutation = useMutation({
    mutationFn: authApi.registerCustomer,
    onSuccess: (session) => {
      setSession(session)
      toast.success('Customer registration successful')
      navigate('/')
    },
    onError: (error) => toast.error(error.message),
  })

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
    validationSchema: customerRegisterSchema,
    onSubmit: (values) => mutation.mutate(values),
  })

  return (
    <AuthShell mode="register">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0b1235] sm:text-3xl lg:text-4xl">
          Create Your Bseller Account
        </h1>
        <p className="mt-2 text-sm text-stone-500 sm:mt-3">
          Register as a customer and start buying books.
        </p>
      </div>

      <form onSubmit={formik.handleSubmit} noValidate className="mt-7 space-y-5 sm:mt-9">
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
          <FormInput
            label="First Name * (Required)"
            name="firstName"
            autoComplete="given-name"
            maxLength={20}
            value={formik.values.firstName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.firstName ? formik.errors.firstName : undefined}
          />

          <FormInput
            label="Last Name * (Required)"
            name="lastName"
            autoComplete="family-name"
            maxLength={20}
            value={formik.values.lastName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.lastName ? formik.errors.lastName : undefined}
          />
        </div>

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
          autoComplete="new-password"
          maxLength={50}
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password ? formik.errors.password : undefined}
        />

        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#f0532d] text-sm font-semibold text-white transition hover:bg-[#d8431f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {mutation.isPending ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <div className="my-6 flex items-center gap-4 text-xs text-stone-400 sm:my-8">
        <span className="h-px flex-1 bg-stone-200" />
        Seller account
        <span className="h-px flex-1 bg-stone-200" />
      </div>

      <Link
        to="/seller-register"
        className="block rounded-full border border-stone-200 px-4 py-3 text-center text-sm text-stone-600 transition hover:border-[#f0532d] hover:text-[#f0532d]"
      >
        Register as seller instead
      </Link>

      <p className="mt-6 text-center text-xs text-stone-500 sm:mt-8">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-[#f0532d] hover:underline">
          Login
        </Link>
      </p>
    </AuthShell>
  )
}
