import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import { FiArrowRight, FiMinus, FiPlus, FiShoppingBag, FiTrash2, FiX } from 'react-icons/fi'
import { FaStore } from 'react-icons/fa'
import { BookCover } from '@/components/common/BookCover'
import { EmptyState } from '@/components/common/EmptyState'
import { FormInput } from '@/components/common/FormInput'
import { Loader } from '@/components/common/Loader'
import { useCart, useRemoveCartItem, useUpdateCartQuantity } from '@/hooks/useCart'
import { usePlaceOrder } from '@/hooks/useOrders'
import { checkoutSchema } from '@/schemas/checkout.schema'
import { formatCurrency } from '@/utils/formatCurrency'
import type { IShippingAddress } from '@/interfaces/order.interface'

const initialAddress: IShippingAddress = {
  fullName: '',
  mobileNumber: '',
  addressLine: '',
  city: '',
  state: '',
  pincode: '',
}

export const CartPage = () => {
  const navigate = useNavigate()
  const { data: items = [], isLoading } = useCart()
  const updateQuantity = useUpdateCartQuantity()
  const removeItem = useRemoveCartItem()
  const placeOrder = usePlaceOrder()
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  const total = items.reduce((sum, item) => sum + item.listing.price * item.quantity, 0)
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)

  const formik = useFormik<IShippingAddress>({
    initialValues: initialAddress,
    validationSchema: checkoutSchema,
    onSubmit: (values) =>
      placeOrder.mutate(values, {
        onSuccess: () => navigate('/orders'),
      }),
  })

  if (isLoading) return <Loader />

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-extrabold uppercase text-[#16243d] sm:text-4xl">
        Your <span className="text-[#f0532d]">Cart</span>
      </h1>
      <p className="mt-1 text-sm text-stone-500">
        {items.length === 0 ? 'Your cart is empty.' : `${totalQuantity} item${totalQuantity === 1 ? '' : 's'} from your selected sellers.`}
      </p>

      {items.length === 0 ? (
        <div className="mt-10">
          <EmptyState title="Nothing here yet" description="Browse the marketplace and pick a seller to add books to your cart." />
          <div className="mt-6 text-center">
            <Link
              to="/books"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[#f0532d] px-6 text-sm font-semibold text-white transition hover:bg-[#d8431f]"
            >
              <FiShoppingBag /> Browse Books
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* cart lines */}
          <div className="space-y-4">
            {items.map((item) => {
              const isOutOfSync = item.quantity > item.listing.stock
              return (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 sm:flex-nowrap"
                >
                  <Link to={`/books/${item.book.id}`} className="shrink-0">
                    <BookCover src={item.book.coverImage} title={item.book.title} className="h-24 w-[68px] rounded shadow-md" />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link to={`/books/${item.book.id}`} className="line-clamp-1 text-sm font-bold text-[#16243d] hover:text-[#f0532d]">
                      {item.book.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-stone-500">{item.book.author}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-stone-600">
                      <FaStore className="text-[#f0532d]" /> Sold by{' '}
                      <span className="font-semibold">{item.seller.businessName}</span>
                    </p>
                    {isOutOfSync ? (
                      <p className="mt-1 text-xs font-semibold text-red-600">
                        Only {item.listing.stock} left in stock — reduce quantity to checkout
                      </p>
                    ) : null}
                  </div>

                  {/* quantity stepper */}
                  <div className="flex items-center rounded-full border border-stone-300">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      disabled={item.quantity <= 1 || updateQuantity.isPending}
                      onClick={() => updateQuantity.mutate({ itemId: item.id, quantity: item.quantity - 1 })}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-l-full text-stone-700 transition hover:bg-stone-100 disabled:opacity-40"
                    >
                      <FiMinus className="text-sm" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-[#16243d]">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      disabled={item.quantity >= item.listing.stock || updateQuantity.isPending}
                      onClick={() => updateQuantity.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-r-full text-stone-700 transition hover:bg-stone-100 disabled:opacity-40"
                    >
                      <FiPlus className="text-sm" />
                    </button>
                  </div>

                  <div className="w-24 text-right">
                    <p className="text-sm font-bold text-[#16243d]">{formatCurrency(item.listing.price * item.quantity)}</p>
                    <p className="text-[11px] text-stone-400">{formatCurrency(item.listing.price)} each</p>
                  </div>

                  <button
                    type="button"
                    aria-label={`Remove ${item.book.title}`}
                    onClick={() => removeItem.mutate(item.id)}
                    disabled={removeItem.isPending}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-stone-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              )
            })}
          </div>

          {/* summary */}
          <aside className="h-fit rounded-2xl bg-[#101d33] p-6 text-white">
            <h2 className="font-display text-xl font-extrabold uppercase">Order Summary</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between text-white/70">
                <dt>Items ({totalQuantity})</dt>
                <dd>{formatCurrency(total)}</dd>
              </div>
              <div className="flex justify-between text-white/70">
                <dt>Delivery</dt>
                <dd className="font-semibold text-emerald-400">Free</dd>
              </div>
              <div className="flex justify-between border-t border-white/15 pt-3 text-base font-bold">
                <dt>Total</dt>
                <dd>{formatCurrency(total)}</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => setIsCheckoutOpen(true)}
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#f0532d] text-sm font-semibold transition hover:bg-[#d8431f]"
            >
              Proceed to Checkout <FiArrowRight />
            </button>
          </aside>
        </div>
      )}

      {/* checkout modal — shipping address (PDF Step 6) */}
      {isCheckoutOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label="Checkout">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-extrabold uppercase text-[#16243d]">Shipping Address</h2>
              <button
                type="button"
                aria-label="Close checkout"
                onClick={() => setIsCheckoutOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-100"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={formik.handleSubmit} noValidate className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  label="Full Name"
                  name="fullName"
                  value={formik.values.fullName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.fullName ? formik.errors.fullName : undefined}
                  placeholder="Aarav Sharma"
                />
                <FormInput
                  label="Mobile Number"
                  name="mobileNumber"
                  inputMode="numeric"
                  maxLength={10}
                  value={formik.values.mobileNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.mobileNumber ? formik.errors.mobileNumber : undefined}
                  placeholder="9876543210"
                />
              </div>
              <FormInput
                label="Address"
                name="addressLine"
                value={formik.values.addressLine}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.addressLine ? formik.errors.addressLine : undefined}
                placeholder="Flat / Street / Area"
              />
              <div className="grid gap-4 sm:grid-cols-3">
                <FormInput
                  label="City"
                  name="city"
                  value={formik.values.city}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.city ? formik.errors.city : undefined}
                  placeholder="Mumbai"
                />
                <FormInput
                  label="State"
                  name="state"
                  value={formik.values.state}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.state ? formik.errors.state : undefined}
                  placeholder="Maharashtra"
                />
                <FormInput
                  label="Pincode"
                  name="pincode"
                  inputMode="numeric"
                  maxLength={6}
                  value={formik.values.pincode}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.pincode ? formik.errors.pincode : undefined}
                  placeholder="400001"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl bg-stone-50 px-4 py-3">
                <span className="text-sm text-stone-600">Payable Amount</span>
                <span className="text-lg font-bold text-[#16243d]">{formatCurrency(total)}</span>
              </div>

              <button
                type="submit"
                disabled={placeOrder.isPending}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#f0532d] text-sm font-semibold text-white transition hover:bg-[#d8431f] disabled:opacity-60"
              >
                {placeOrder.isPending ? 'Placing Order…' : 'Place Order'}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  )
}
