import { useFormik } from 'formik'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FiMail, FiSend } from 'react-icons/fi'
import { newsletterApi } from '@/api/newsletter.api'
import { newsletterSchema } from '@/schemas/newsletter.schema'

export const NewsletterSection = () => {
  const subscribeMutation = useMutation({
    mutationFn: (email: string) => newsletterApi.subscribe(email),
    onSuccess: () => {
      toast.success('Subscribed! You will hear from us soon.')
      formik.resetForm()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const formik = useFormik({
    initialValues: { email: '' },
    validationSchema: newsletterSchema,
    onSubmit: (values) => subscribeMutation.mutate(values.email),
  })

  return (
    <section className="bg-[#0d2b1f] py-16">
      <div className="mx-auto max-w-3xl px-4 text-center text-white">
        <FiMail className="mx-auto text-3xl text-emerald-400" />
        <h2 className="font-display mt-4 text-3xl font-extrabold uppercase leading-tight sm:text-4xl">
          Never Miss a <span className="text-[#f5862e]">New Chapter</span>
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-emerald-100/70">
          Subscribe to get the latest releases, weekly deals and bestseller alerts directly in your inbox.
        </p>

        <form onSubmit={formik.handleSubmit} noValidate className="mx-auto mt-8 max-w-md">
          <div className="flex items-center gap-1 rounded-full bg-white p-1.5 shadow-2xl shadow-black/30">
            <input
              type="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter your email address"
              aria-label="Email address"
              className="h-10 w-full flex-1 bg-transparent px-4 text-sm text-stone-800 outline-none placeholder:text-stone-400"
            />
            <button
              type="submit"
              disabled={subscribeMutation.isPending}
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-[#f0532d] px-5 text-sm font-semibold text-white transition hover:bg-[#d8431f] disabled:opacity-60"
            >
              <FiSend /> {subscribeMutation.isPending ? 'Subscribing…' : 'Subscribe'}
            </button>
          </div>
          {formik.touched.email && formik.errors.email ? (
            <p className="mt-2 text-left text-xs text-orange-300">{formik.errors.email}</p>
          ) : null}
        </form>
      </div>
    </section>
  )
}
