import { useState, useEffect } from 'react'
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
import { useCustomerProfile } from '@/hooks/useCustomerProfile'
import { checkoutSchema } from '@/schemas/checkout.schema'
import { formatCurrency } from '@/utils/formatCurrency'
import type { IShippingAddress } from '@/interfaces'

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
  const { data: customerProfile } = useCustomerProfile()
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [addressMode, setAddressMode] = useState<'saved' | 'new'>('new')
  const [cartFeedback, setCartFeedback] = useState('')

  
  useEffect(() => {
    if (!isCheckoutOpen) return
    const originalStyle = window.getComputedStyle(document.body).overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [isCheckoutOpen])

  const total = items.reduce((sum, item) => sum + item.listing.price * item.quantity, 0)
  const mrpTotal = items.reduce(
    (sum, item) => sum + (item.listing.mrp > item.listing.price ? item.listing.mrp : item.listing.price) * item.quantity,
    0,
  )
  const discountTotal = Math.max(0, mrpTotal - total)
  const discountPercent = mrpTotal > 0 ? Math.round((discountTotal / mrpTotal) * 100) : 0
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
  const savedAddress: IShippingAddress | null =
    customerProfile?.mobileNumber &&
    customerProfile.addressLine &&
    customerProfile.city &&
    customerProfile.state &&
    customerProfile.pincode
      ? {
          fullName: `${customerProfile.firstName} ${customerProfile.lastName}`.trim(),
          mobileNumber: customerProfile.mobileNumber,
          addressLine: customerProfile.addressLine,
          city: customerProfile.city,
          state: customerProfile.state,
          pincode: customerProfile.pincode,
        }
      : null

  const formik = useFormik<IShippingAddress>({
    initialValues: initialAddress,
    validationSchema: checkoutSchema,
    onSubmit: (values) =>
      placeOrder.mutate(values, {
        onSuccess: () => navigate('/orders'),
      }),
  })

  const handleOpenCheckout = () => {
    setIsCheckoutOpen(true)
    if (savedAddress) {
      setAddressMode('saved')
      formik.setValues(savedAddress)
    } else {
      setAddressMode('new')
      formik.setValues(initialAddress)
    }
  }

  const handleUseSavedAddress = () => {
    if (!savedAddress) return
    setAddressMode('saved')
    formik.setValues(savedAddress)
  }

  const handleUseNewAddress = () => {
    setAddressMode('new')
    formik.setValues(initialAddress)
  }

  const showCartFeedback = (message: string) => {
    setCartFeedback(message)
    window.setTimeout(() => setCartFeedback(''), 1400)
  }

  if (isLoading) return <Loader />

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-extrabold uppercase text-[#16243d] sm:text-4xl">
        Your <span className="text-[#f0532d]">Cart</span>
      </h1>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <p className="text-sm text-stone-500">
          {items.length === 0 ? 'Your cart is empty.' : `${totalQuantity} item${totalQuantity === 1 ? '' : 's'} from your selected sellers.`}
        </p>
        {cartFeedback ? (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800" aria-live="polite">
            {cartFeedback}
          </span>
        ) : null}
      </div>

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
                  className="relative flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-4 sm:flex-row sm:items-center"
                >
                  <div className="flex gap-4">
                    <Link to={`/books/${item.book.id}`} className="shrink-0">
                      <BookCover src={item.book.coverImage} title={item.book.title} className="h-24 w-[68px] rounded shadow-md" />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link to={`/books/${item.book.id}`} className="line-clamp-2 text-sm font-bold leading-tight text-[#16243d] hover:text-[#f0532d]">
                        {item.book.title}
                      </Link>
                      <p className="mt-1 text-xs text-stone-500">{item.book.author}</p>
                      <p className="mt-2 flex flex-wrap items-center gap-1 text-[11px] text-stone-600">
                        <FaStore className="text-[#f0532d]" /> 
                        <span>Sold by</span>
                        <span className="font-bold text-[#16243d]">{item.seller.businessName}</span>
                      </p>
                      {isOutOfSync ? (
                        <p className="mt-2 text-[10px] font-bold text-red-600">
                          Only {item.listing.stock} left in stock
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 border-t border-stone-100 pt-4 sm:flex-1 sm:border-none sm:pt-0">
                    {/* quantity stepper */}
                    <div className="flex items-center rounded-full border border-stone-300 bg-stone-50/50">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        disabled={item.quantity <= 1 || updateQuantity.isPending}
                        onClick={() =>
                          updateQuantity.mutate(
                            { itemId: item.id, quantity: item.quantity - 1 },
                            { onSuccess: () => showCartFeedback('Quantity updated ✓') },
                          )
                        }
                        className="inline-flex h-8 w-8 items-center justify-center rounded-l-full text-stone-700 transition hover:bg-stone-100 disabled:opacity-40"
                      >
                        <FiMinus className="text-xs" />
                      </button>
                      <span className="w-7 text-center text-xs font-bold text-[#16243d]">{item.quantity}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        disabled={item.quantity >= item.listing.stock || updateQuantity.isPending}
                        onClick={() =>
                          updateQuantity.mutate(
                            { itemId: item.id, quantity: item.quantity + 1 },
                            { onSuccess: () => showCartFeedback('Quantity updated ✓') },
                          )
                        }
                        className="inline-flex h-8 w-8 items-center justify-center rounded-r-full text-stone-700 transition hover:bg-stone-100 disabled:opacity-40"
                      >
                        <FiPlus className="text-xs" />
                      </button>
                    </div>

                    <div className="flex flex-1 flex-col items-end justify-center gap-0.5 pr-2">
                      <div className="flex items-baseline gap-2">
                        <p className="text-base font-black text-[#16243d]">{formatCurrency(item.listing.price * item.quantity)}</p>
                        {item.listing.mrp > item.listing.price ? (
                          <p className="text-[11px] text-stone-400 line-through">{formatCurrency(item.listing.mrp * item.quantity)}</p>
                        ) : null}
                      </div>
                      <p className="hidden text-[10px] text-stone-400 sm:block">{formatCurrency(item.listing.price)} each</p>
                    </div>

                    <button
                      type="button"
                      aria-label={`Remove ${item.book.title}`}
                      onClick={() => removeItem.mutate(item.id, { onSuccess: () => showCartFeedback('Item removed ✓') })}
                      disabled={removeItem.isPending}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-stone-50 text-stone-400 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* summary */}
          <aside className="h-fit rounded-[2rem] bg-[#101d33] p-6 text-white sm:rounded-3xl sm:p-8">
            <h2 className="font-display text-lg font-extrabold uppercase tracking-tight sm:text-xl">Order Summary</h2>
            <dl className="mt-5 space-y-3.5 text-sm">
              <div className="flex justify-between text-white/60">
                <dt className="font-medium">Total MRP ({totalQuantity})</dt>
                <dd className="font-bold">{formatCurrency(mrpTotal)}</dd>
              </div>
              {discountTotal > 0 ? (
                <div className="flex justify-between text-emerald-400">
                  <dt className="font-medium">Discount {discountPercent > 0 ? `(${discountPercent}%)` : ''}</dt>
                  <dd className="font-bold">− {formatCurrency(discountTotal)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between text-white/60">
                <dt className="font-medium">Delivery</dt>
                <dd className="font-bold text-emerald-400">Free</dd>
              </div>
              <div className="mt-4 flex justify-between border-t border-white/10 pt-4 text-base font-black">
                <dt className="uppercase tracking-wider">Total</dt>
                <dd className="text-xl text-[#f5862e]">{formatCurrency(total)}</dd>
              </div>
            </dl>
            {discountTotal > 0 ? (
              <p className="mt-3 rounded-xl bg-emerald-500/10 px-3 py-2 text-center text-xs font-bold text-emerald-300">
                You save {formatCurrency(discountTotal)} on this order 🎉
              </p>
            ) : null}
            <button
              type="button"
              onClick={handleOpenCheckout}
              className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#f0532d] text-sm font-bold uppercase tracking-widest shadow-xl shadow-orange-600/20 transition hover:bg-[#d8431f]"
            >
              Proceed to Checkout <FiArrowRight />
            </button>
          </aside>
        </div>
      )}

      {/* checkout modal — shipping address (PDF Step 6) */}
      {isCheckoutOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Checkout">
          <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-[2.5rem] bg-white p-4 shadow-2xl custom-scrollbar sm:rounded-3xl sm:p-8">
            {/* Grab handle for mobile */}
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-stone-200 sm:hidden" />

            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <h2 className="font-display text-base font-extrabold uppercase tracking-tight text-[#16243d] sm:text-xl">Checkout Details</h2>
              <button
                type="button"
                aria-label="Close checkout"
                onClick={() => setIsCheckoutOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-stone-50 text-stone-400 transition hover:text-stone-700"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={formik.handleSubmit} noValidate className="mt-4 space-y-2.5">
              {savedAddress ? (
                <div className="rounded-2xl border border-stone-100 bg-stone-50/50 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Delivery Method</p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={handleUseSavedAddress}
                      className={`flex-1 rounded-xl border py-2 text-center transition ${
                        addressMode === 'saved'
                          ? 'border-[#f0532d] bg-[#f0532d] text-white shadow-md shadow-orange-500/20'
                          : 'border-stone-200 bg-white text-stone-500'
                      }`}
                    >
                      <span className="text-[11px] font-bold uppercase">Saved Info</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleUseNewAddress}
                      className={`flex-1 rounded-xl border py-2 text-center transition ${
                        addressMode === 'new'
                          ? 'border-[#f0532d] bg-[#f0532d] text-white shadow-md shadow-orange-500/20'
                          : 'border-stone-200 bg-white text-stone-500'
                      }`}
                    >
                      <span className="text-[11px] font-bold uppercase">New Address</span>
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="grid gap-2 sm:grid-cols-2">
                <FormInput
                  label={<span className="text-[10px] font-bold uppercase tracking-wider">Full Name</span>}
                  name="fullName"
                  className="h-9 text-xs"
                  value={formik.values.fullName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.fullName ? formik.errors.fullName : undefined}
                />
                <FormInput
                  label={<span className="text-[10px] font-bold uppercase tracking-wider">Mobile</span>}
                  name="mobileNumber"
                  className="h-9 text-xs"
                  inputMode="numeric"
                  maxLength={10}
                  value={formik.values.mobileNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.mobileNumber ? formik.errors.mobileNumber : undefined}
                />
              </div>

              <FormInput
                label={<span className="text-[10px] font-bold uppercase tracking-wider">Street Address</span>}
                name="addressLine"
                className="h-9 text-xs"
                value={formik.values.addressLine}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.addressLine ? formik.errors.addressLine : undefined}
              />

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <FormInput
                  label={<span className="text-[10px] font-bold uppercase tracking-wider">City</span>}
                  name="city"
                  className="h-9 text-xs"
                  value={formik.values.city}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.city ? formik.errors.city : undefined}
                />
                <FormInput
                  label={<span className="text-[10px] font-bold uppercase tracking-wider">State</span>}
                  name="state"
                  className="h-9 text-xs"
                  value={formik.values.state}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.state ? formik.errors.state : undefined}
                />
                <FormInput
                  label={<span className="text-[10px] font-bold uppercase tracking-wider">Pincode</span>}
                  name="pincode"
                  className="h-9 text-xs col-span-2 sm:col-span-1"
                  inputMode="numeric"
                  maxLength={6}
                  value={formik.values.pincode}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.pincode ? formik.errors.pincode : undefined}
                />
              </div>

              <div className="mt-4 rounded-2xl bg-[#16243d] px-5 py-4 text-white">
                <dl className="space-y-1.5 border-b border-white/10 pb-3 text-xs">
                  <div className="flex justify-between text-white/50">
                    <dt>Total MRP</dt>
                    <dd className={discountTotal > 0 ? 'line-through' : 'font-semibold'}>{formatCurrency(mrpTotal)}</dd>
                  </div>
                  {discountTotal > 0 ? (
                    <div className="flex justify-between text-emerald-400">
                      <dt>Discount {discountPercent > 0 ? `(${discountPercent}%)` : ''}</dt>
                      <dd className="font-semibold">− {formatCurrency(discountTotal)}</dd>
                    </div>
                  ) : null}
                </dl>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Total Amount</p>
                    <p className="text-xl font-extrabold">{formatCurrency(total)}</p>
                    {discountTotal > 0 ? (
                      <p className="text-[10px] font-semibold text-emerald-400">You save {formatCurrency(discountTotal)}</p>
                    ) : null}
                  </div>
                  <button
                    type="submit"
                    disabled={placeOrder.isPending}
                    className="cursor-pointer inline-flex h-11 items-center justify-center rounded-xl bg-[#f0532d] px-6 text-xs font-black uppercase tracking-widest text-white shadow-lg transition hover:bg-[#d8431f] disabled:opacity-60"
                  >
                    {placeOrder.isPending ? 'Placing...' : 'Place Order'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  )
}
