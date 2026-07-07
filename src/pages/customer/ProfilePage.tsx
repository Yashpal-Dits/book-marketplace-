import { useState } from 'react'
import { Form, Formik } from 'formik'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  FiCalendar,
  FiCamera,
  FiCheckCircle,
  FiCreditCard,
  FiEdit3,
  FiHome,
  FiLock,
  FiMail,
  FiMapPin,
  FiPackage,
  FiPhone,
  FiShield,
  FiShoppingBag,
  FiTruck,
  FiUser,
  FiX,
  FiXCircle,
  FiZap,
} from 'react-icons/fi'
import { FaStore } from 'react-icons/fa'
import { EmptyState } from '@/components/common/EmptyState'
import { BookCover } from '@/components/common/BookCover'
import { Loader } from '@/components/common/Loader'
import { FormInput } from '@/components/common/FormInput'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { OrderStatusTracker } from '@/components/orders/OrderStatusTracker'
import { OrderStatus } from '@/enums/order-status.enum'
import { useCustomerProfile, useUpdateCustomerProfile } from '@/hooks/useCustomerProfile'
import { useCancelOrder, useOrders } from '@/hooks/useOrders'
import { isOrderCancellableByCustomer } from '@/utils/orderStatus'
import { customerProfileSchema } from '@/schemas/profile.schema'
import { formatDate } from '@/utils/formatDate'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/utils/cn'
import type { IOrderDetailed, UpdateCustomerProfilePayload } from '@/interfaces'



type ProfileTab = 'profile' | 'security' | 'orders'
type Tone = 'emerald' | 'amber' | 'blue' | 'orange' | 'red' | 'stone'

const sidebarLinks: Array<{ id: ProfileTab; label: string; icon: typeof FiUser }> = [
  { id: 'profile', label: 'My Profile', icon: FiUser },
  { id: 'security', label: 'Security Options', icon: FiShield },
  { id: 'orders', label: 'My Orders', icon: FiShoppingBag },
]

const toneClasses: Record<Tone, { shell: string; icon: string; value: string }> = {
  emerald: { shell: 'border-emerald-100 bg-emerald-50', icon: 'bg-emerald-100 text-emerald-800', value: 'text-emerald-800' },
  amber: { shell: 'border-amber-100 bg-amber-50', icon: 'bg-amber-100 text-amber-800', value: 'text-amber-800' },
  blue: { shell: 'border-blue-100 bg-blue-50', icon: 'bg-blue-100 text-blue-800', value: 'text-blue-800' },
  orange: { shell: 'border-orange-100 bg-orange-50', icon: 'bg-orange-100 text-orange-800', value: 'text-orange-800' },
  red: { shell: 'border-red-100 bg-red-50', icon: 'bg-red-100 text-red-700', value: 'text-red-700' },
  stone: { shell: 'border-stone-200 bg-stone-50', icon: 'bg-stone-200 text-stone-700', value: 'text-stone-800' },
}

const DetailField = ({ label, value, icon: Icon }: { label: string; value?: string; icon?: typeof FiUser }) => (
  <div className="rounded-2xl border border-stone-100 bg-stone-50/70 p-4">
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
      {Icon ? <Icon className="text-primary" /> : null}
      {label}
    </div>
    <p className="mt-2 break-words text-sm font-bold text-stone-800">{value || '-'}</p>
  </div>
)

const StatCard = ({
  label,
  value,
  description,
  icon: Icon,
  tone = 'amber',
}: {
  label: string
  value: string | number
  description: string
  icon: typeof FiUser
  tone?: Tone
}) => {
  const styles = toneClasses[tone]

  return (
    <div className={cn('rounded-3xl border p-5 shadow-sm', styles.shell)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">{label}</p>
          <p className={cn('mt-2 text-2xl font-extrabold', styles.value)}>{value}</p>
        </div>
        <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-lg', styles.icon)}>
          <Icon />
        </span>
      </div>
      <p className="mt-3 text-xs leading-5 text-stone-500">{description}</p>
    </div>
  )
}

const DemoTag = () => (
  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700">
    Demo
  </span>
)

const ChecklistItem = ({ completed, label }: { completed: boolean; label: string }) => (
  <div className="flex items-center gap-3 rounded-2xl bg-stone-50 px-3 py-2.5">
    <span
      className={cn(
        'grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs',
        completed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700',
      )}
    >
      {completed ? <FiCheckCircle /> : <FiZap />}
    </span>
    <span className="text-sm font-semibold text-stone-700">{label}</span>
  </div>
)

export const ProfilePage = () => {
  const { data: profile, isLoading: profileLoading, isError: profileError } = useCustomerProfile()
  const { data: ordersData = [], isLoading: ordersLoading, isError: ordersError } = useOrders()
  const updateProfile = useUpdateCustomerProfile()
  const cancelOrder = useCancelOrder()
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile')
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null)

  const handleCancelOrder = (orderId: string) => {
    cancelOrder.mutate(orderId, { onSettled: () => setConfirmCancelId(null) })
  }

  if (profileLoading) return <Loader />
  if (profileError || !profile) return <EmptyState title="Could not load profile" description="Please make sure you are logged in as a customer." />

  const customerOrders = ordersData as IOrderDetailed[]
  const totalOrders = customerOrders.length
  const activeOrders = customerOrders.filter(

    (order) => order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.CANCELLED,
  ).length

  const deliveredOrders = customerOrders.filter((order) => order.status === OrderStatus.DELIVERED).length

  const totalBooks = customerOrders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0)

  const totalSpent = customerOrders
    .filter((order) => order.status !== OrderStatus.CANCELLED)
    .reduce((sum, order) => sum + order.totalAmount, 0)

  const recentItems = customerOrders.flatMap((order) => order.items.map((item) => ({ ...item, orderCreatedAt: order.createdAt }))).slice(0, 3)
  const displayName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
  const displayInitials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    
  const completionFields = [
    profile.firstName,
    profile.lastName,
    profile.mobileNumber,
    profile.addressLine,
    profile.city,
    profile.state,
    profile.pincode,
    profile.profileImage,
  ]
  const profileCompletion = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100)
  const hasSavedAddress = Boolean(profile.addressLine && profile.city && profile.state && profile.pincode)
  const memberSince = formatDate(profile.createdAt)

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
      toast.error('Please select an image file')
      return
    }
    if (file.size > 700 * 1024) {
      toast.error('Please select an image smaller than 700 KB')
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
    <div className="min-h-screen bg-[#faf7ef]">
      <div className="w-full px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6 overflow-hidden rounded-3xl bg-[#0d2b1f] p-5 text-white shadow-sm sm:rounded-[2rem] sm:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Customer Account</p>
              <h1 className="font-display mt-2 text-2xl font-extrabold uppercase sm:text-4xl">
                Customer <span className="text-[#f5862e]">Portal</span>
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
                Manage your profile, delivery details, security preferences, and order history from one personal dashboard.
              </p>
            </div>

            <div className="w-full max-w-xs rounded-2xl bg-white/10 p-4 lg:w-72">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">Profile Completion</p>
                <span className="text-sm font-extrabold text-[#f5862e]">{profileCompletion}%</span>
              </div>
              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-[#f5862e] transition-all duration-500"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
              <p className="mt-2.5 text-xs leading-5 text-white/60">
                {profileCompletion >= 100
                  ? 'Your profile is fully complete. Nice!'
                  : 'Add your photo and delivery details to reach 100%.'}
              </p>
            </div>
          </div>
        </div>

        <section className="mb-6 grid gap-3 sm:mb-8 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Orders" value={totalOrders} description="Orders placed from your customer account." icon={FiShoppingBag} tone="amber" />
          <StatCard label="Books Bought" value={totalBooks} description="Total book quantity purchased across orders." icon={FiPackage} tone="blue" />
          <StatCard label="Total Spend" value={formatCurrency(totalSpent)} description="Calculated from all non-cancelled orders." icon={FiCreditCard} tone="emerald" />
          <StatCard label="Active Orders" value={activeOrders} description="Orders still moving through seller fulfilment." icon={FiTruck} tone="orange" />
        </section>

        {/* Mobile tab switcher — quick access without scrolling the sidebar */}
        <nav className="mb-6 flex gap-2 overflow-x-auto pb-1 lg:hidden" aria-label="Profile sections">
          {sidebarLinks.map((link) => {
            const Icon = link.icon
            const isActive = activeTab === link.id
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => setActiveTab(link.id)}
                className={cn(
                  'inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition',
                  isActive
                    ? 'border-[#0d2b1f] bg-[#0d2b1f] text-[#f5862e] shadow-sm'
                    : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50',
                )}
              >
                <Icon size={16} className={isActive ? 'text-[#f5862e]' : 'text-stone-400'} />
                {link.label}
              </button>
            )
          })}
        </nav>

        <div className="grid gap-6 lg:grid-cols-[300px_1fr] lg:gap-8">
          <aside className="hidden h-fit rounded-3xl border border-stone-200 bg-white p-5 shadow-sm lg:sticky lg:top-24 lg:block">
            <div className="rounded-[1.5rem] bg-[#0d2b1f] p-4 text-white">
              <div className="flex items-center gap-3">
                <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full bg-amber-100 text-lg font-extrabold text-amber-800 ring-4 ring-white/10">
                  {profile.profileImage ? <img src={profile.profileImage} alt="Profile" className="h-full w-full object-cover" /> : displayInitials || <FiUser />}
                </span>
                <div className="min-w-0">
                  <h2 className="line-clamp-1 text-sm font-extrabold">{displayName || 'Customer'}</h2>
                  <p className="mt-1 truncate text-xs text-white/60">{profile.email}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-2xl bg-white/10 p-3">
                  <p className="text-lg font-extrabold text-[#f5862e]">{totalOrders}</p>
                  <p className="text-[10px] uppercase tracking-wide text-white/60">Orders</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <p className="text-lg font-extrabold text-[#f5862e]">{deliveredOrders}</p>
                  <p className="text-[10px] uppercase tracking-wide text-white/60">Delivered</p>
                </div>
              </div>
            </div>

            <div className="mt-5 border-b border-stone-100 pb-4">
              <div className="mb-4 flex items-center gap-3">
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
                          : 'text-stone-500 hover:bg-stone-100 hover:text-stone-800',
                      )}
                    >
                      <Icon className={isActive ? 'text-[#f5862e]' : 'text-stone-400'} size={18} />
                      {link.label}
                    </button>
                  )
                })}
              </nav>
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-amber-800">
                  <FiCalendar /> Member Since
                </p>
                <p className="mt-2 text-sm font-bold text-[#16243d]">{memberSince}</p>
              </div>
              <Link
                to="/books"
                className="flex items-center justify-center gap-2 rounded-full bg-[#f0532d] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#d8431f]"
              >
                <FiShoppingBag /> Continue Shopping
              </Link>
            </div>
          </aside>

          <div className="min-w-0">
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
                  const formDisplayName = `${values.firstName || ''} ${values.lastName || ''}`.trim()
                  const formDisplayInitials = formDisplayName
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join('')
                    .toUpperCase()

                  return (
                    <Form className="space-y-6">
                      <div className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
                        <div className="mb-6 flex flex-col gap-3 border-b border-stone-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Personal Details</p>
                            <h2 className="mt-1 text-xl font-extrabold text-stone-900">Profile Information</h2>
                          </div>
                          {!isEditing ? (
                            <button
                              type="button"
                              onClick={() => setIsEditing(true)}
                              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#f0532d] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#d8431f] sm:w-auto"
                            >
                              <FiEdit3 size={14} /> Edit Profile
                            </button>
                          ) : (
                            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                              <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-600 transition hover:bg-stone-50"
                              >
                                <FiX size={14} /> Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={isSubmitting || updateProfile.isPending}
                                className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-full bg-[#f0532d] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#d8431f] disabled:opacity-60"
                              >
                                <FiEdit3 size={14} /> {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="mb-8 flex flex-col gap-4 rounded-3xl bg-stone-50 p-4 sm:flex-row sm:items-center">
                          <div className="relative">
                            {isEditing ? (
                              <label
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                  e.preventDefault()
                                  handleImageFile(e.dataTransfer.files?.[0], setFieldValue)
                                }}
                                className="group relative grid h-24 w-24 cursor-pointer place-items-center overflow-hidden rounded-full bg-amber-100 text-2xl font-bold text-amber-800 ring-4 ring-white transition hover:ring-amber-300"
                              >
                                {avatarUrl ? (
                                  <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                  <span>{formDisplayInitials || <FiUser />}</span>
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
                              <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-full bg-amber-100 text-2xl font-bold text-amber-800 ring-4 ring-white">
                                {avatarUrl ? (
                                  <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                  <span>{formDisplayInitials || <FiUser />}</span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-xl font-extrabold text-stone-900">{formDisplayName || 'Profile'}</h3>
                            <p className="mt-1 flex items-center gap-2 text-sm text-stone-500">
                              <FiMail className="text-primary" /> {profile.email}
                            </p>
                            <p className="mt-1 flex items-center gap-2 text-sm text-stone-500">
                              <FiCalendar className="text-primary" /> Customer since {memberSince}
                            </p>
                          </div>
                        </div>

                        {isEditing && (
                          <label
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault()
                              handleImageFile(e.dataTransfer.files?.[0], setFieldValue)
                            }}
                            className="mb-8 flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-4 text-sm transition hover:border-[#f0532d] hover:bg-orange-50"
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

                        <div className="space-y-8">
                          <div>
                            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-stone-900">Personal Details</h4>
                            {!isEditing ? (
                              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <DetailField label="First Name" value={profile.firstName} icon={FiUser} />
                                <DetailField label="Last Name" value={profile.lastName} icon={FiUser} />
                                <DetailField label="Email Address" value={profile.email} icon={FiMail} />
                                <DetailField label="Phone" value={profile.mobileNumber} icon={FiPhone} />
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <FormInput name="firstName" label="First Name" value={values.firstName} onChange={handleChange} onBlur={handleBlur} error={touched.firstName && errors.firstName ? String(errors.firstName) : undefined} />
                                <FormInput name="lastName" label="Last Name" value={values.lastName} onChange={handleChange} onBlur={handleBlur} error={touched.lastName && errors.lastName ? String(errors.lastName) : undefined} />
                                <div className="space-y-1">
                                  <label className="block text-xs font-medium text-stone-500">Email address</label>
                                  <div className="flex h-11 items-center rounded-xl border border-stone-200 bg-stone-50 px-4 text-sm text-stone-500">
                                    <FiMail className="mr-2 text-stone-400" size={14} />
                                    {profile.email}
                                  </div>
                                </div>
                                <FormInput name="mobileNumber" label="Phone" inputMode="numeric" value={values.mobileNumber} onChange={handleChange} onBlur={handleBlur} error={touched.mobileNumber && errors.mobileNumber ? String(errors.mobileNumber) : undefined} />
                              </div>
                            )}
                          </div>

                          <div>
                            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-stone-900">Delivery Address</h4>
                            {!isEditing ? (
                              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <DetailField label="City" value={profile.city} icon={FiHome} />
                                <DetailField label="State" value={profile.state} icon={FiMapPin} />
                                <DetailField label="Postal Code" value={profile.pincode} icon={FiMapPin} />
                                <div className="rounded-2xl border border-stone-100 bg-stone-50/70 p-4 sm:col-span-2">
                                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
                                    <FiMapPin className="text-primary" /> Shipping Address
                                  </p>
                                  <p className="mt-2 break-words text-sm font-bold leading-6 text-stone-800">{profile.addressLine || '-'}</p>
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
                                  {touched.addressLine && errors.addressLine ? <span className="mt-1 block text-xs text-red-600">{String(errors.addressLine)}</span> : null}
                                </label>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                    </Form>
                  )
                }}
              </Formik>
            )}

            {activeTab === 'security' && (
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                <div className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
                  <div className="mb-2 flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#0d2b1f] text-[#f5862e]">
                      <FiLock />
                    </span>
                    <div>
                      <h2 className="text-xl font-extrabold text-stone-900">Security Options</h2>
                      <p className="text-sm text-stone-500">Manage account protection and session preferences.</p>
                    </div>
                  </div>
                  <div className="mt-6 space-y-4">
                    <div className="flex flex-col gap-3 rounded-2xl border border-stone-100 bg-stone-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="flex items-center gap-2 text-sm font-semibold text-stone-800">
                          Password <DemoTag />
                        </p>
                        <p className="mt-1 text-xs text-stone-500">Password changes are planned for a future backend integration.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toast('Available once a real backend is connected', { icon: '🔒' })}
                        className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-600 transition hover:bg-stone-50"
                      >
                        Change Password
                      </button>
                    </div>
                    <div className="flex flex-col gap-3 rounded-2xl border border-stone-100 bg-stone-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="flex items-center gap-2 text-sm font-semibold text-stone-800">
                          Two-Factor Authentication <DemoTag />
                        </p>
                        <p className="mt-1 text-xs text-stone-500">Add an extra layer of security when real auth is connected.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toast('Two-factor auth is coming soon', { icon: '🛡️' })}
                        className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-full bg-[#f0532d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#d8431f]"
                      >
                        Enable
                      </button>
                    </div>
                    <div className="flex flex-col gap-3 rounded-2xl border border-stone-100 bg-stone-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="flex items-center gap-2 text-sm font-semibold text-stone-800">
                          Active Sessions <DemoTag />
                        </p>
                        <p className="mt-1 text-xs text-stone-500">Current demo session is stored locally through Zustand persist.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toast('Session management is coming soon', { icon: '💻' })}
                        className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        Logout All
                      </button>
                    </div>
                  </div>
                </div>

                <aside className="space-y-6">
                  <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
                    <h3 className="font-display text-lg font-extrabold uppercase text-heading">Security Health</h3>
                    <div className="mt-4 space-y-3">
                      <ChecklistItem completed={Boolean(profile.email)} label="Email linked" />
                      <ChecklistItem completed={Boolean(profile.mobileNumber)} label="Mobile number added" />
                      <ChecklistItem completed={hasSavedAddress} label="Delivery address saved" />
                      <ChecklistItem completed={profileCompletion >= 80} label="Profile mostly complete" />
                    </div>
                  </div>
                  <div className="rounded-3xl bg-[#0d2b1f] p-5 text-white shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">Privacy Note</p>
                    <p className="mt-2 text-sm leading-6 text-white/70">
                      This demo uses JSON Server and local browser storage. In production, passwords and sessions should be handled by a secure backend.
                    </p>
                  </div>
                </aside>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Order Center</p>
                      <h2 className="mt-1 text-xl font-extrabold text-stone-900">My Orders</h2>
                      <p className="mt-1 text-sm text-stone-500">Track purchases, seller fulfilment status, and delivery address for every order.</p>
                    </div>
                    <Link
                      to="/books"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f0532d] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#d8431f]"
                    >
                      <FiShoppingBag /> Shop More Books
                    </Link>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard label="All Orders" value={totalOrders} description="Complete order history." icon={FiShoppingBag} tone="amber" />
                  <StatCard label="In Progress" value={activeOrders} description="Created, accepted, or shipped." icon={FiTruck} tone="orange" />
                  <StatCard label="Delivered" value={deliveredOrders} description="Successfully fulfilled orders." icon={FiCheckCircle} tone="emerald" />
                  <StatCard label="Total Paid" value={formatCurrency(totalSpent)} description="Total from non-cancelled orders." icon={FiCreditCard} tone="blue" />
                </div>

                {recentItems.length ? (
                  <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
                    <h3 className="font-display text-lg font-extrabold uppercase text-heading">Recently Purchased Books</h3>
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      {recentItems.map((item) => (
                        <Link
                          key={item.id}
                          to={`/books/${item.bookId}`}
                          className="flex items-center gap-3 rounded-2xl border border-stone-100 bg-stone-50/70 p-3 transition hover:border-primary/30 hover:bg-orange-50"
                        >
                          <BookCover src={item.coverImage} title={item.bookTitle} className="h-16 w-11 shrink-0 rounded-md shadow-sm" />
                          <div className="min-w-0">
                            <p className="line-clamp-2 text-sm font-bold text-heading">{item.bookTitle}</p>
                            <p className="mt-1 text-xs text-stone-500">Bought {formatDate(item.orderCreatedAt)}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}

                {ordersLoading ? (
                  <Loader />
                ) : ordersError ? (
                  <EmptyState title="Could not load orders" description="Please make sure your backend is running and you are logged in as a customer." />
                ) : customerOrders.length === 0 ? (
                  <div className="rounded-3xl border border-stone-200 bg-white p-10 shadow-sm">
                    <EmptyState title="No orders yet" description="Your placed orders and their tracking status will appear here." />
                    <div className="mt-5 text-center">
                      <Link
                        to="/books"
                        className="cursor-pointer inline-flex h-11 items-center gap-2 rounded-full bg-[#f0532d] px-6 text-sm font-semibold text-white transition hover:bg-[#d8431f]"
                      >
                        <FiShoppingBag /> Start Shopping
                      </Link>
                    </div>
                  </div>
                ) : (
                  customerOrders.map((order) => (
                    <article key={order.id} className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
                      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 bg-stone-50/70 px-5 py-3.5">
                        <div>
                          <p className="text-xs text-stone-500">
                            Order <span className="font-mono font-semibold text-stone-700">#{order.id.slice(-10)}</span> · Placed on{' '}
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-[#16243d]">{formatCurrency(order.totalAmount)}</span>
                          <OrderStatusBadge status={order.status} />
                        </div>
                      </header>

                      <div className="px-5 pt-5">
                        <OrderStatusTracker status={order.status} />
                      </div>

                      <ul className="divide-y divide-stone-100 px-5 py-3">
                        {order.items.map((item) => (
                          <li key={item.id} className="flex flex-wrap items-center justify-between gap-4 py-3.5">
                            <div className="flex min-w-0 items-center gap-3.5">
                              <BookCover src={item.coverImage} title={item.bookTitle} className="h-16 w-11 shrink-0 rounded object-cover shadow-sm" />
                              <div className="min-w-0">
                                <Link to={`/books/${item.bookId}`} className="cursor-pointer line-clamp-1 text-sm font-bold text-[#16243d] hover:text-[#f0532d]">
                                  {item.bookTitle}
                                </Link>
                                <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-stone-500">
                                  <FaStore className="text-[#f0532d]" /> {item.sellerName} · Qty {item.quantity} ×{' '}
                                  {formatCurrency(item.priceAtPurchase)}
                                </p>
                              </div>
                            </div>
                            <div className="shrink-0 text-right">
                              <span className="text-base font-extrabold text-[#16243d]">{formatCurrency(item.subtotal)}</span>
                            </div>
                          </li>
                        ))}
                      </ul>

                      <footer className="flex flex-wrap items-start justify-between gap-3 border-t border-stone-100 bg-stone-50/70 px-5 py-3 text-xs text-stone-600">
                        <div className="flex min-w-0 items-start gap-2">
                          <FiMapPin className="mt-0.5 shrink-0 text-[#f0532d]" />
                          <span>
                            <span className="font-semibold">{order.shippingAddress.fullName}</span> · {order.shippingAddress.addressLine},{' '}
                            {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode} ·{' '}
                            {order.shippingAddress.mobileNumber}
                          </span>
                        </div>

                        {isOrderCancellableByCustomer(order.status) && (
                          <div className="shrink-0">
                            {confirmCancelId === order.id ? (
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-stone-600">Cancel this order?</span>
                                <button
                                  type="button"
                                  disabled={cancelOrder.isPending}
                                  onClick={() => handleCancelOrder(order.id)}
                                  className="cursor-pointer rounded-full bg-red-600 px-3 py-1.5 font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
                                >
                                  {cancelOrder.isPending ? 'Cancelling…' : 'Yes, cancel'}
                                </button>
                                <button
                                  type="button"
                                  disabled={cancelOrder.isPending}
                                  onClick={() => setConfirmCancelId(null)}
                                  className="cursor-pointer rounded-full border border-stone-200 bg-white px-3 py-1.5 font-semibold text-stone-600 transition hover:bg-stone-50"
                                >
                                  Keep order
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmCancelId(order.id)}
                                className="cursor-pointer inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-bold text-red-600 transition hover:bg-red-50"
                              >
                                <FiXCircle /> Cancel order
                              </button>
                            )}
                          </div>
                        )}
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
