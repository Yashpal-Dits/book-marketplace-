import { useMutation } from '@tanstack/react-query'
import { useFormik } from 'formik'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '@/api/auth.api'
import { AuthShell } from '@/components/common/AuthShell'
import { Button } from '@/components/common/Button'
import { FormInput } from '@/components/common/FormInput'
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
        <h1 className="text-3xl font-bold tracking-tight text-[#0b1235] sm:text-4xl">
          Register Your Bookstore
        </h1>
        <p className="mt-3 text-sm text-stone-500">
          Seller status will be pending until admin approval.
        </p>
      </div>

      <form onSubmit={formik.handleSubmit} className="mt-8 space-y-4">
        <FormInput
          label="Business Name  * (Required)"
          name="businessName"
          maxLength={80}
          value={formik.values.businessName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={
            formik.touched.businessName
              ? formik.errors.businessName
              : undefined
          }
        />

        <FormInput
          label="Contact Person  * (Required)"
          name="contactPerson"
          maxLength={60}
          value={formik.values.contactPerson}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={
            formik.touched.contactPerson
              ? formik.errors.contactPerson
              : undefined
          }
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput
            label="Email  * (Required)"
            name="email"
            maxLength={100}
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email ? formik.errors.email : undefined}
          />

          <FormInput
            label="Mobile Number  * (Required)"
            name="mobileNumber"
            maxLength={10}
            value={formik.values.mobileNumber}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.mobileNumber
                ? formik.errors.mobileNumber
                : undefined
            }
          />
        </div>

        <FormInput
          label="Password  * (Required)"
          name="password"
          type="password"
          maxLength={64}
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
          {mutation.isPending
            ? 'Submitting...'
            : 'Submit seller registration'}
        </Button>
      </form>

      <p className="mt-8 text-center text-xs text-stone-500">
        Want to buy books?{' '}
        <Link to="/register" className="font-medium text-amber-900">
          Customer register
        </Link>
      </p>
    </AuthShell>
  )
}