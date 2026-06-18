import { useState } from 'react'
import { Form, Formik } from 'formik'
import { Link } from 'react-router-dom'
import { FiCamera, FiEdit3, FiMail, FiMapPin, FiShoppingBag, FiUser, FiX } from 'react-icons/fi'
import { FaStore } from 'react-icons/fa'
import { EmptyState } from '@/components/common/EmptyState'
import { BookCover } from '@/components/common/BookCover'
import { Loader } from '@/components/common/Loader'
import { FormInput } from '@/components/common/FormInput'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { OrderStatusTracker } from '@/components/orders/OrderStatusTracker'
import { useCustomerProfile, useUpdateCustomerProfile } from '@/hooks/useProfile'
import { useOrders } from '@/hooks/useOrders'
import { customerProfileSchema } from '@/schemas/profile.schema'
import { formatDate } from '@/utils/formatDate'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/utils/cn'
import type { IOrderDetailed, UpdateCustomerProfilePayload } from '@/interfaces'

const sidebarLinks = [
  { id: 'profile', label: 'My Profile', icon: FiUser },
  { id: 'security', label: 'Security Options', icon: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  )},
  { id: 'orders', label: 'My Orders', icon: FiShoppingBag },
]

const DetailField = ({ label, value }: { label: string; value?: string }) => (
  <div className="space-y-1">
    <p className="text-xs font-medium text-stone-400">{label}</p>
    <p className="text-sm font-semibold text-stone-800">{value || '-'}</p>
  </div>
)

export const ProfilePage = () => {
  const { data: profile, isLoading: profileLoading, isError: profileError } = useCustomerProfile()
  const { data: ordersData = [], isLoading: ordersLoading, isError: ordersError } = useOrders()
  const updateProfile = useUpdateCustomerProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  if (profileLoading) return <Loader />
  if (profileError || !profile) return <EmptyState title="Could not load profile" description="Please make sure you are logged in as a customer." />

  const initialValues: UpdateCustomerProfilePayload = {
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    mobileNumber: profile.mobileNumber || '',
    addressLine: profile.addressLine || '',
    city: profile.city || '',
    state: profile.state || '',
    pincode: profile.pincode || '',
    profileImage: profile.profileImage || '',
  }

  const handleImageFile = (file?: File, setFieldValue?: (field: string, value: string) => void) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      window.alert('Please select an image file')
      return
    }
    if (file.size > 700 * 1024) {
      window.alert('Please select an image smaller than 700 KB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result ?? '')
      if (setFieldValue) setFieldValue('profileImage', result)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
        {/* Top Banner exactly like Admin/Seller profile */}
        <div className="mb-8 rounded-[2rem] bg-[#0d2b1f] p-6 text-white shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Customer Account</p>
          <h1 className="font-display mt-2 text-3xl font-extrabold uppercase sm:text-4xl">
            Customer <span className="text-[#f5862e]">Portal</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
            Manage your public profile, shipping addresses, security options, and track all your placed orders.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Left Sidebar */}
          <aside className="h-fit rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3 border-b border-stone-100 pb-4">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#0d2b1f] text-[#f5862e]">
                <FiUser size={20} />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-[#16243d]">Settings</h3>
                <p className="text-xs text-stone-400">Customer preferences</p>
              </div>
            </div>
            <nav className="space-y-1.5">
              {sidebarLinks.map((link) => {
                const Icon = link.icon
                const isActive = activeTab === link.id
                return (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => setActiveTab(link.id)}
                    className={cn(
                      'flex w-full cursor-pointer items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-semibold transition',
                      isActive
                        ? 'bg-[#0d2b1f] text-[#f5862e] shadow-lg shadow-emerald-950/10'
                        : 'text-stone-500 hover:bg-stone-100 hover:text-stone-800'
                    )}
                  >
                    <Icon className={isActive ? 'text-[#f5862e]' : 'text-stone-400'} size={18} />
                    {link.label}
                  </button>
                )
              })}
            </nav>
          </aside>

          {/* Right Content */}
          <div>
            {activeTab === 'profile' && (
              <Formik
                enableReinitialize
                initialValues={initialValues}
                validationSchema={customerProfileSchema}
                onSubmit={(values, helpers) => {
                  updateProfile.mutate(values, {
                    onSettled: () => {
                      helpers.setSubmitting(false)
                      setIsEditing(false)
                    },
                  })
                }}
              >
                {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting }) => {
                  const avatarUrl = values.profileImage || ''
                  const displayName = `${values.firstName || ''} ${values.lastName || ''}`.trim()
                  const displayInitials = displayName
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join('')
                    .toUpperCase()

                  return (
                    <Form className="space-y-6">
                      {/* Profile Card */}
                      <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="text-lg font-bold text-stone-900">Profile Information</h2>
                          {!isEditing ? (
                            <button
                              type="button"
                              onClick={() => setIsEditing(true)}
                              className="inline-flex items-center gap-2 rounded-lg bg-[#f0532d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#d8431f]"
                            >
                              <FiEdit3 size={14} /> Edit
                            </button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-600 transition hover:bg-stone-50"
                              >
                                <FiX size={14} /> Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={isSubmitting || updateProfile.isPending}
                                className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-[#f0532d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#d8431f] disabled:opacity-60"
                              >
                                <FiEdit3 size={14} /> {updateProfile.isPending ? 'Saving...' : 'Save'}
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                          <div className="relative">
                            {isEditing ? (
                              <label
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                  e.preventDefault()
                                  handleImageFile(e.dataTransfer.files?.[0], setFieldValue)
                                }}
                                className="group relative grid h-20 w-20 cursor-pointer place-items-center overflow-hidden rounded-full bg-amber-100 text-2xl font-bold text-amber-800 ring-4 ring-amber-50 transition hover:ring-amber-300"
                              >
                                {avatarUrl ? (
                                  <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                  <span>{displayInitials || <FiUser />}</span>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 opacity-0 transition group-hover:opacity-100">
                                  <FiCamera className="text-white" size={18} />
                                </div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="sr-only"
                                  onChange={(e) => handleImageFile(e.currentTarget.files?.[0], setFieldValue)}
                                />
                              </label>
                            ) : (
                              <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-amber-100 text-2xl font-bold text-amber-800 ring-4 ring-amber-50">
                                {avatarUrl ? (
                                  <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                  <span>{displayInitials || <FiUser />}</span>
                                )}
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-stone-900">{displayName || 'Profile'}</h3>
                            <p className="text-sm text-stone-400">Customer</p>
                          </div>
                        </div>

                        {isEditing && (
                          <label
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault()
                              handleImageFile(e.dataTransfer.files?.[0], setFieldValue)
                            }}
                            className="mb-8 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-3 text-sm transition hover:border-[#f0532d] hover:bg-orange-50"
                          >
                            <FiCamera className="text-stone-400" />
                            <span className="cursor-pointer text-stone-600">Drag & drop image here or click to upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={(e) => handleImageFile(e.currentTarget.files?.[0], setFieldValue)}
                            />
                          </label>
                        )}

                        {/* Personal Details */}
                        <div className="mb-8">
                          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-stone-900">Personal Details</h4>
                          {!isEditing ? (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                              <DetailField label="First Name" value={profile.firstName} />
                              <DetailField label="Last Name" value={profile.lastName} />
                              <DetailField label="Email address" value={profile.email} />
                              <DetailField label="Phone" value={profile.mobileNumber} />
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <FormInput name="firstName" label="First Name" value={values.firstName} onChange={handleChange} onBlur={handleBlur} error={touched.firstName && errors.firstName ? String(errors.firstName) : undefined} />
                              <FormInput name="lastName" label="Last Name" value={values.lastName} onChange={handleChange} onBlur={handleBlur} error={touched.lastName && errors.lastName ? String(errors.lastName) : undefined} />
                              <div className="space-y-1">
                                <label className="cursor-pointer block text-xs font-medium text-stone-500">Email address</label>
                                <div className="flex h-11 items-center rounded-xl border border-stone-200 bg-stone-50 px-4 text-sm text-stone-500">
                                  <FiMail className="mr-2 text-stone-400" size={14} />
                                  {profile.email}
                                </div>
                              </div>
                              <FormInput name="mobileNumber" label="Phone" inputMode="numeric" value={values.mobileNumber} onChange={handleChange} onBlur={handleBlur} error={touched.mobileNumber && errors.mobileNumber ? String(errors.mobileNumber) : undefined} />
                            </div>
                          )}
                        </div>

                        {/* Address */}
                        <div>
                          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-stone-900">Address</h4>
                          {!isEditing ? (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                              <DetailField label="City" value={profile.city} />
                              <DetailField label="State" value={profile.state} />
                              <DetailField label="Postal Code" value={profile.pincode} />
                              <div className="sm:col-span-2 space-y-1">
                                <p className="text-xs font-medium text-stone-400">Shipping Address</p>
                                <p className="text-sm font-semibold text-stone-800">{profile.addressLine || '-'}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <FormInput name="city" label="City" value={values.city} onChange={handleChange} onBlur={handleBlur} error={touched.city && errors.city ? String(errors.city) : undefined} />
                              <FormInput name="state" label="State" value={values.state} onChange={handleChange} onBlur={handleBlur} error={touched.state && errors.state ? String(errors.state) : undefined} />
                              <FormInput name="pincode" label="Postal Code" inputMode="numeric" value={values.pincode} onChange={handleChange} onBlur={handleBlur} error={touched.pincode && errors.pincode ? String(errors.pincode) : undefined} />
                              <label className="cursor-pointer block text-left sm:col-span-2">
                                <span className="cursor-pointer mb-1.5 block text-sm font-medium text-stone-700">Shipping Address</span>
                                <textarea
                                  name="addressLine"
                                  value={values.addressLine}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  className="min-h-24 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-700 focus:ring-4 focus:ring-amber-900/10"
                                />
                                {touched.addressLine && errors.addressLine ? <span className="cursor-pointer mt-1 block text-xs text-red-600">{String(errors.addressLine)}</span> : null}
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    </Form>
                  )
                }}
              </Formik>
            )}

            {activeTab === 'security' && (
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-stone-900 mb-6">Security Options</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between py-4 border-b border-stone-100">
                    <div>
                      <p className="text-sm font-semibold text-stone-800">Password</p>
                      <p className="text-xs text-stone-400 mt-1">Last updated 2 months ago</p>
                    </div>
                    <button
                      type="button"
                      className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-600 transition hover:bg-stone-50"
                    >
                      Change Password
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-4 border-b border-stone-100">
                    <div>
                      <p className="text-sm font-semibold text-stone-800">Two-Factor Authentication</p>
                      <p className="text-xs text-stone-400 mt-1">Add an extra layer of security</p>
                    </div>
                    <button
                      type="button"
                      className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-[#f0532d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#d8431f]"
                    >
                      Enable
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-sm font-semibold text-stone-800">Active Sessions</p>
                      <p className="text-xs text-stone-400 mt-1">1 active session on this device</p>
                    </div>
                    <button
                      type="button"
                      className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Logout All
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-stone-900">My Orders</h2>
                    <p className="text-xs text-stone-400 mt-1">Track every order and its current status.</p>
                  </div>
                </div>

                {ordersLoading ? (
                  <Loader />
                ) : ordersError ? (
                  <EmptyState title="Could not load orders" description="Make sure the JSON server is running on port 4000." />
                ) : ordersData.length === 0 ? (
                  <>
                    <EmptyState title="No orders yet" description="Your placed orders and their tracking status will appear here." />
                    <div className="text-center">
                      <Link
                        to="/books"
                        className="cursor-pointer inline-flex h-11 items-center gap-2 rounded-full bg-[#f0532d] px-6 text-sm font-semibold text-white transition hover:bg-[#d8431f]"
                      >
                        <FiShoppingBag /> Start Shopping
                      </Link>
                    </div>
                  </>
                ) : (
                  (ordersData as IOrderDetailed[]).map((order) => (
                    <article key={order.id} className="cursor-pointer overflow-hidden rounded-2xl border border-stone-200 bg-white">
                      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 bg-stone-50/70 px-5 py-3.5">
                        <div>
                          <p className="text-xs text-stone-500">
                            Order <span className="cursor-pointer font-mono font-semibold text-stone-700">#{order.id.slice(-10)}</span> · Placed on{' '}
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="cursor-pointer text-sm font-bold text-[#16243d]">{formatCurrency(order.totalAmount)}</span>
                          <OrderStatusBadge status={order.status} />
                        </div>
                      </header>

                      <div className="px-5 pt-5">
                        <OrderStatusTracker status={order.status} />
                      </div>

                      <ul className="divide-y divide-stone-100 px-5 py-3">
                        {order.items.map((item) => (
                          <li key={item.id} className="flex flex-wrap items-center justify-between gap-4 py-3.5">
                            <div className="flex items-center gap-3.5 min-w-0">
                              <BookCover src={item.coverImage} title={item.bookTitle} className="h-16 w-11 shrink-0 rounded shadow-sm object-cover" />
                              <div className="min-w-0">
                                <Link to={`/books/${item.bookId}`} className="cursor-pointer line-clamp-1 text-sm font-bold text-[#16243d] hover:text-[#f0532d]">
                                  {item.bookTitle}
                                </Link>
                                <p className="mt-1 flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                                  <FaStore className="text-[#f0532d]" /> {item.sellerName} · Qty {item.quantity} ×{' '}
                                  {formatCurrency(item.priceAtPurchase)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="cursor-pointer text-base font-extrabold text-[#16243d]">{formatCurrency(item.subtotal)}</span>
                            </div>
                          </li>
                        ))}
                      </ul>

                      <footer className="flex items-start gap-2 border-t border-stone-100 bg-stone-50/70 px-5 py-3 text-xs text-stone-600">
                        <FiMapPin className="mt-0.5 shrink-0 text-[#f0532d]" />
                        <span>
                          <span className="cursor-pointer font-semibold">{order.shippingAddress.fullName}</span> · {order.shippingAddress.addressLine},{' '}
                          {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode} ·{' '}
                          {order.shippingAddress.mobileNumber}
                        </span>
                      </footer>
                    </article>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
