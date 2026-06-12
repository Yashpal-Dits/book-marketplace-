import { useFormik } from 'formik'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FiSend } from 'react-icons/fi'
import { BookCover } from '@/components/common/BookCover'
import { newsletterApi } from '@/api/newsletter.api'
import { newsletterSchema } from '@/schemas/newsletter.schema'
import { useApprovedBooks } from '@/hooks/useBooks'

/** "Get a 20% discount on your first order" banner with email capture. */
export const DiscountBannerSection = () => {
  const { data: books = [] } = useApprovedBooks()
  const covers = books.filter((b) => b.coverImage).slice(0, 4)
  const leftCovers = covers.slice(0, 2)
  const rightCovers = covers.slice(2, 4)

  const subscribeMutation = useMutation({
    mutationFn: (email: string) => newsletterApi.subscribe(email),
    onSuccess: () => {
      toast.success('Discount code sent! Check your inbox.')
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
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[2rem] border border-amber-900/10 bg-[#f3ecd9] px-6 py-12 sm:px-10">
        {/* decorative sparkles */}
        <span className="absolute left-[30%] top-6 text-lg text-[#f0532d]" aria-hidden>✦</span>
        <span className="absolute right-[28%] top-8 text-sm text-emerald-600" aria-hidden>✦</span>
        <span className="absolute bottom-8 left-[26%] text-sm text-amber-500" aria-hidden>✦</span>
        <span className="absolute bottom-10 right-[24%] text-lg text-[#f0532d]" aria-hidden>✦</span>

        {/* tilted covers — left */}
        <div className="pointer-events-none absolute -left-4 bottom-0 hidden items-end gap-2 md:flex" aria-hidden>
          {leftCovers.map((book, i) => (
            <div
              key={book.id}
              className="w-24 overflow-hidden rounded-md shadow-2xl lg:w-28"
              style={{ transform: `rotate(${i === 0 ? -14 : -4}deg) translateY(${i === 0 ? 24 : 10}px)` }}
            >
              <BookCover src={book.coverImage} title={book.title} className="aspect-[3/4.2] w-full" />
            </div>
          ))}
        </div>

        {/* tilted covers — right */}
        <div className="pointer-events-none absolute -right-4 bottom-0 hidden items-end gap-2 md:flex" aria-hidden>
          {rightCovers.map((book, i) => (
            <div
              key={book.id}
              className="w-24 overflow-hidden rounded-md shadow-2xl lg:w-28"
              style={{ transform: `rotate(${i === 0 ? 5 : 15}deg) translateY(${i === 0 ? 10 : 24}px)` }}
            >
              <BookCover src={book.coverImage} title={book.title} className="aspect-[3/4.2] w-full" />
            </div>
          ))}
        </div>

        <div className="relative mx-auto max-w-md text-center">
          <h2 className="font-display text-2xl font-extrabold uppercase leading-tight text-[#16243d] sm:text-3xl">
            Get a <span className="text-[#f0532d]">20% Discount</span> on Your First Order!
          </h2>

          <form onSubmit={formik.handleSubmit} noValidate className="mx-auto mt-6 max-w-sm">
            <div className="flex items-center gap-1 rounded-full bg-white p-1.5 shadow-lg shadow-amber-900/10">
              <input
                type="email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter your email"
                aria-label="Email address"
                className="h-10 w-full flex-1 bg-transparent px-4 text-sm text-stone-800 outline-none placeholder:text-stone-400"
              />
              <button
                type="submit"
                disabled={subscribeMutation.isPending}
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-[#f0532d] px-5 text-sm font-semibold text-white transition hover:bg-[#d8431f] disabled:opacity-60"
              >
                <FiSend /> {subscribeMutation.isPending ? 'Sending…' : 'Send'}
              </button>
            </div>
            {formik.touched.email && formik.errors.email ? (
              <p className="mt-2 text-left text-xs text-red-600">{formik.errors.email}</p>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  )
}
