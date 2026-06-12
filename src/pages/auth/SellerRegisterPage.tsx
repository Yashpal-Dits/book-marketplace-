import { useMutation } from '@tanstack/react-query'
import { useFormik } from 'formik'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '@/api/auth.api'
import { AuthShell } from '@/components/common/AuthShell'
import { FormInput } from '@/components/common/FormInput'
import { PasswordInput } from '@/components/common/PasswordInput'
import { sellerRegisterSchema } from '@/schemas/auth.schema'
import { useAuthStore } from '@/store/auth.store'

export const SellerRegisterPage = () => {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)

  const mutation = useMutation({
    mutationFn: authApi.registerSeller,
    onSuccess: (session) => {
      setSession(session)
      toast.success('Seller registration submitted for admin approval')
      navigate('/seller/pending-approval')
    },
    onError: (error) => toast.error(error.message),
  })

  const formik = useFormik({
    initialValues: {
      businessName: '',
      contactPerson: '',
      email: '',
      mobileNumber: '',
      password: '',
    },
    validationSchema: sellerRegisterSchema,
    onSubmit: (values) => mutation.mutate(values),
  })

  return (
    <AuthShell mode="seller">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0b1235] sm:text-3xl lg:text-4xl">
          Register Your Bookstore
        </h1>
        <p className="mt-2 text-sm text-stone-500 sm:mt-3">
          Seller status will be pending until admin approval.
        </p>
      </div>

      <form onSubmit={formik.handleSubmit} noValidate className="mt-7 space-y-4 sm:mt-8">
        <FormInput
          label="Business Name * (Required)"
          name="businessName"
          autoComplete="organization"
          maxLength={80}
          value={formik.values.businessName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.businessName ? formik.errors.businessName : undefined}
        />

        <FormInput
          label="Contact Person * (Required)"
          name="contactPerson"
          autoComplete="name"
          maxLength={60}
          value={formik.values.contactPerson}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.contactPerson ? formik.errors.contactPerson : undefined}
        />

        <div className="grid gap-4 sm:grid-cols-2">
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

          <FormInput
            label="Mobile Number * (Required)"
            name="mobileNumber"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={10}
            value={formik.values.mobileNumber}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.mobileNumber ? formik.errors.mobileNumber : undefined}
          />
        </div>

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
          {mutation.isPending ? 'Submitting...' : 'Submit seller registration'}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-stone-500 sm:mt-8">
        Want to buy books?{' '}
        <Link to="/register" className="font-semibold text-[#f0532d] hover:underline">
          Customer register
        </Link>
      </p>
    </AuthShell>
  )
}
