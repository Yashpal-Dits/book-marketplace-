import { useMutation } from '@tanstack/react-query'
import { useFormik } from 'formik'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '@/api/auth.api'
import { AuthShell } from '@/components/common/AuthShell'
import { Button } from '@/components/common/Button'
import { FormInput } from '@/components/common/FormInput'
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
        <h1 className="text-3xl font-bold tracking-tight text-[#0b1235] sm:text-4xl">
          Create Your Paper Haven Account
        </h1>
        <p className="mt-3 text-sm text-stone-500">
          Register as a customer and start buying books.
        </p>
      </div>

      <form onSubmit={formik.handleSubmit} className="mt-9 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput
            label="First Name * (Required)"
            name="firstName"
            maxLength={20}
            value={formik.values.firstName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.firstName ? formik.errors.firstName : undefined
            }
          />

          <FormInput
            label="Last Name  * (Required)"
            name="lastName"
            maxLength={20}
            value={formik.values.lastName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.lastName ? formik.errors.lastName : undefined
            }
          />
        </div>

        <FormInput
          label="Email  * (Required)"
          name="email"
          maxLength={50}
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email ? formik.errors.email : undefined}
        />

        <FormInput
          label="Password  * (Required)"
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

        <Button
          type="submit"
          disabled={mutation.isPending}
          className="h-12 w-full rounded-lg bg-[#202124] hover:bg-black"
        >
          {mutation.isPending ? 'Creating account...' : 'Register'}
        </Button>
      </form>

      <div className="my-8 flex items-center gap-4 text-xs text-stone-400">
        <span className="h-px flex-1 bg-stone-200" />
        Seller account
        <span className="h-px flex-1 bg-stone-200" />
      </div>

      <Link
        to="/seller-register"
        className="block rounded-lg border border-stone-200 px-4 py-3 text-center text-sm text-stone-600 transition hover:bg-stone-50"
      >
        Register as seller instead
      </Link>

      <p className="mt-8 text-center text-xs text-stone-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-amber-900">
          Login
        </Link>
      </p>
    </AuthShell>
  )
}