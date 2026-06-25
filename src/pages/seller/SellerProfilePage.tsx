import { useState } from 'react'
import { Form, Formik } from 'formik'
import toast from 'react-hot-toast'
import {
  FiAlertTriangle,
  FiBookOpen,
  FiBox,
  FiCalendar,
  FiCamera,
  FiCheckCircle,
  FiClock,
  FiEdit3,
  FiHome,
  FiMail,
  FiMapPin,
  FiPhone,
  FiShoppingBag,
  FiTrendingUp,
  FiUser,
  FiX,
  FiZap,
} from 'react-icons/fi'
import { FaStore } from 'react-icons/fa'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { FormInput } from '@/components/common/FormInput'
import { Loader } from '@/components/common/Loader'
import { SellerStatus } from '@/enums/seller-status.enum'
import { useSellerProfile, useUpdateSellerProfile } from '@/hooks/useProfile'
import { useSellerDashboard } from '@/hooks/useSeller'
import { sellerProfileSchema } from '@/schemas/profile.schema'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'
import { cn } from '@/utils/cn'
import type { UpdateSellerProfilePayload } from '@/interfaces'

type SellerTab = 'profile' | 'store'
type Tone = 'emerald' | 'amber' | 'blue' | 'orange' | 'red' | 'stone'

const sidebarLinks: Array<{ id: SellerTab; label: string; icon: typeof FiUser }> = [
  { id: 'profile', label: 'Store Profile', icon: FaStore },
  { id: 'store', label: 'Store Insights', icon: FiTrendingUp },
]

const statusClass: Record<SellerStatus, string> = {
  [SellerStatus.PENDING]: 'bg-amber-100 text-amber-800',
  [SellerStatus.APPROVED]: 'bg-emerald-100 text-emerald-800',
  [SellerStatus.REJECTED]: 'bg-red-100 text-red-700',
}

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

const fieldError = (
  errors: Partial<Record<keyof UpdateSellerProfilePayload, string>>,
  touched: Partial<Record<keyof UpdateSellerProfilePayload, boolean>>,
  name: keyof UpdateSellerProfilePayload,
) => (touched[name] && errors[name] ? String(errors[name]) : undefined)

export const SellerProfilePage = () => {
  const { data: profile, isLoading, isError } = useSellerProfile()
  const { data: stats } = useSellerDashboard()
  const updateProfile = useUpdateSellerProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<SellerTab>('profile')

  if (isLoading) return <Loader />
  if (isError || !profile) return <EmptyState title="Could not load seller profile" description="Please login as a seller." />

  const displayName = profile.businessName || 'Store'
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
  const memberSince = formatDate(profile.createdAt)
  const hasAddress = Boolean(profile.businessAddress && profile.city && profile.state && profile.pincode)

  const completionFields = [
    profile.businessName,
    profile.contactPerson,
    profile.mobileNumber,
    profile.businessAddress,
    profile.city,
    profile.state,
    profile.pincode,
    profile.storeLogo,
  ]
  const profileCompletion = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100)

  const initialValues: UpdateSellerProfilePayload = {
    businessName: profile.businessName || '',
    contactPerson: profile.contactPerson || '',
    mobileNumber: profile.mobileNumber || '',
    businessAddress: profile.businessAddress || '',
    city: profile.city || '',
    state: profile.state || '',
    pincode: profile.pincode || '',
    storeLogo: profile.storeLogo || '',
  }

  const handleImageFile = (file: File | undefined, setFieldValue: (field: string, value: string) => void) => {
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
    reader.onload = () => setFieldValue('storeLogo', String(reader.result ?? ''))
    reader.readAsDataURL(file)
  }

  return (
    <div className="min-h-screen bg-[#faf7ef]">
      <div className="w-full space-y-6 px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Header banner */}
      <section className="overflow-hidden rounded-3xl bg-secondary p-5 text-white shadow-sm sm:rounded-[2rem] sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Seller Account</p>
            <h1 className="font-display mt-2 text-2xl font-extrabold uppercase sm:text-4xl">
              Store <span className="text-accent">Profile</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
              Manage your public store identity, business contact details, and track your store performance. Approval status is controlled by admin.
            </p>
          </div>

          <div className="w-full max-w-xs rounded-2xl bg-white/10 p-4 lg:w-72">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">Profile Completion</p>
              <span className="text-sm font-extrabold text-accent">{profileCompletion}%</span>
            </div>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${profileCompletion}%` }} />
            </div>
            <p className="mt-2.5 text-xs leading-5 text-white/60">
              {profileCompletion >= 100 ? 'Your store profile is fully complete. Nice!' : 'Add your logo and business address to reach 100%.'}
            </p>
          </div>
        </div>
      </section>

      {/* Stat cards */}
      <section className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        <StatCard label="Total Listings" value={stats?.totalListings ?? '—'} description="Books you currently offer." icon={FiBookOpen} tone="amber" />
        <StatCard label="Active Listings" value={stats?.activeListings ?? '—'} description="Visible to customers right now." icon={FiBox} tone="emerald" />
        <StatCard label="Order Items" value={stats?.totalOrders ?? '—'} description="Order lines across all listings." icon={FiShoppingBag} tone="blue" />
        <StatCard label="Delivered Revenue" value={stats ? formatCurrency(stats.revenue) : '—'} description="Earned from delivered orders." icon={FiTrendingUp} tone="emerald" />
      </section>

      {/* Mobile tab switcher */}
      <nav className="flex gap-2 overflow-x-auto pb-1 lg:hidden" aria-label="Profile sections">
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
                isActive ? 'border-secondary bg-secondary text-accent shadow-sm' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50',
              )}
            >
              <Icon size={16} className={isActive ? 'text-accent' : 'text-stone-400'} />
              {link.label}
            </button>
          )
        })}
      </nav>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr] lg:gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden h-fit rounded-3xl border border-stone-200 bg-white p-5 shadow-sm lg:sticky lg:top-24 lg:block">
          <div className="rounded-[1.5rem] bg-secondary p-4 text-white">
            <div className="flex items-center gap-3">
              <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full bg-amber-100 text-lg font-extrabold text-amber-800 ring-4 ring-white/10">
                {profile.storeLogo ? <img src={profile.storeLogo} alt="Store logo" className="h-full w-full object-cover" /> : initials || <FaStore />}
              </span>
              <div className="min-w-0">
                <h2 className="line-clamp-1 text-sm font-extrabold">{displayName}</h2>
                <p className="mt-1 truncate text-xs text-white/60">{profile.email}</p>
              </div>
            </div>
            <Badge className={cn('mt-4', statusClass[profile.status])}>{profile.status}</Badge>
          </div>

          <nav className="mt-5 space-y-1.5">
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
                    isActive ? 'bg-secondary text-accent shadow-lg shadow-emerald-950/10' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-800',
                  )}
                >
                  <Icon className={isActive ? 'text-accent' : 'text-stone-400'} size={18} /> {link.label}
                </button>
              )
            })}
          </nav>

          <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 p-4">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-amber-800">
              <FiCalendar /> Seller Since
            </p>
            <p className="mt-2 text-sm font-bold text-heading">{memberSince}</p>
          </div>
        </aside>

        {/* Main content */}
        <div className="min-w-0">
          {activeTab === 'profile' && (
            <Formik<UpdateSellerProfilePayload>
              enableReinitialize
              initialValues={initialValues}
              validationSchema={sellerProfileSchema}
              onSubmit={(values, helpers) =>
                updateProfile.mutate(values, {
                  onSettled: () => {
                    helpers.setSubmitting(false)
                    setIsEditing(false)
                  },
                })
              }
            >
              {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting }) => {
                const logoUrl = values.storeLogo || ''
                const formInitials = (values.businessName || 'Store')
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
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Business Details</p>
                          <h2 className="mt-1 text-xl font-extrabold text-stone-900">Store Information</h2>
                        </div>
                        {!isEditing ? (
                          <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover sm:w-auto"
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
                              className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-60"
                            >
                              <FiEdit3 size={14} /> {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* logo + identity */}
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
                              {logoUrl ? (
                                <img src={logoUrl} alt="Store logo" className="h-full w-full object-cover" />
                              ) : (
                                <span>{formInitials || <FaStore />}</span>
                              )}
                              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 opacity-0 transition group-hover:opacity-100">
                                <FiCamera className="text-white" size={18} />
                              </div>
                              <input type="file" accept="image/*" className="sr-only" onChange={(e) => handleImageFile(e.currentTarget.files?.[0], setFieldValue)} />
                            </label>
                          ) : (
                            <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-full bg-amber-100 text-2xl font-bold text-amber-800 ring-4 ring-white">
                              {logoUrl ? <img src={logoUrl} alt="Store logo" className="h-full w-full object-cover" /> : <span>{formInitials || <FaStore />}</span>}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xl font-extrabold text-stone-900">{values.businessName || 'Store'}</h3>
                          <p className="mt-1 flex items-center gap-2 text-sm text-stone-500">
                            <FiMail className="text-primary" /> {profile.email}
                          </p>
                          <p className="mt-1 flex items-center gap-2 text-sm text-stone-500">
                            <FiCalendar className="text-primary" /> Seller since {memberSince}
                          </p>
                        </div>
                      </div>

                      {/* Business identity */}
                      <div className="space-y-8">
                        <div>
                          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-stone-900">Business Identity</h4>
                          {!isEditing ? (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <DetailField label="Business Name" value={profile.businessName} icon={FaStore} />
                              <DetailField label="Contact Person" value={profile.contactPerson} icon={FiUser} />
                              <DetailField label="Email Address" value={profile.email} icon={FiMail} />
                              <DetailField label="Mobile Number" value={profile.mobileNumber} icon={FiPhone} />
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <FormInput label="Business Name" name="businessName" value={values.businessName} onChange={handleChange} onBlur={handleBlur} error={fieldError(errors, touched, 'businessName')} />
                              <FormInput label="Contact Person" name="contactPerson" value={values.contactPerson} onChange={handleChange} onBlur={handleBlur} error={fieldError(errors, touched, 'contactPerson')} />
                              <div className="space-y-1">
                                <label className="block text-xs font-medium text-stone-500">Email address</label>
                                <div className="flex h-11 items-center rounded-xl border border-stone-200 bg-stone-50 px-4 text-sm text-stone-500">
                                  <FiMail className="mr-2 text-stone-400" size={14} />
                                  {profile.email}
                                </div>
                              </div>
                              <FormInput label="Mobile Number" name="mobileNumber" inputMode="numeric" value={values.mobileNumber} onChange={handleChange} onBlur={handleBlur} error={fieldError(errors, touched, 'mobileNumber')} />
                            </div>
                          )}
                        </div>

                        {/* Business address */}
                        <div>
                          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-stone-900">Business Address</h4>
                          {!isEditing ? (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <DetailField label="City" value={profile.city} icon={FiHome} />
                              <DetailField label="State" value={profile.state} icon={FiMapPin} />
                              <DetailField label="Pincode" value={profile.pincode} icon={FiMapPin} />
                              <div className="rounded-2xl border border-stone-100 bg-stone-50/70 p-4 sm:col-span-2">
                                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
                                  <FiMapPin className="text-primary" /> Store Address
                                </p>
                                <p className="mt-2 break-words text-sm font-bold leading-6 text-stone-800">{profile.businessAddress || '-'}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <FormInput label="City" name="city" value={values.city} onChange={handleChange} onBlur={handleBlur} error={fieldError(errors, touched, 'city')} />
                              <FormInput label="State" name="state" value={values.state} onChange={handleChange} onBlur={handleBlur} error={fieldError(errors, touched, 'state')} />
                              <FormInput label="Pincode" name="pincode" inputMode="numeric" value={values.pincode} onChange={handleChange} onBlur={handleBlur} error={fieldError(errors, touched, 'pincode')} />
                              <label className="block text-left sm:col-span-2">
                                <span className="mb-1.5 block text-sm font-medium text-stone-700">Store Address</span>
                                <textarea
                                  name="businessAddress"
                                  value={values.businessAddress}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  className="min-h-24 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-primary focus:ring-4 focus:ring-orange-500/10"
                                />
                                {fieldError(errors, touched, 'businessAddress') ? <span className="mt-1 block text-xs text-red-600">{fieldError(errors, touched, 'businessAddress')}</span> : null}
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

          {activeTab === 'store' && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Total Stock" value={stats?.totalStock ?? '—'} description="Units across all your listings." icon={FiBox} tone="blue" />
                <StatCard label="Low Stock" value={stats?.lowStockCount ?? '—'} description="Listings running low (≤ 5)." icon={FiAlertTriangle} tone="amber" />
                <StatCard label="Pending Orders" value={stats?.createdOrders ?? '—'} description="New orders awaiting action." icon={FiClock} tone="orange" />
                <StatCard label="Pending Books" value={stats?.pendingBooks ?? '—'} description="Book requests awaiting admin." icon={FiBookOpen} tone="stone" />
              </div>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                <div className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
                  <h3 className="font-display text-lg font-extrabold uppercase text-heading">Store Setup Checklist</h3>
                  <div className="mt-4 space-y-3">
                    <ChecklistItem completed={Boolean(profile.businessName)} label="Business name added" />
                    <ChecklistItem completed={Boolean(profile.mobileNumber)} label="Contact number added" />
                    <ChecklistItem completed={hasAddress} label="Business address saved" />
                    <ChecklistItem completed={Boolean(profile.storeLogo)} label="Store logo uploaded" />
                    <ChecklistItem completed={(stats?.activeListings ?? 0) > 0} label="At least one active listing" />
                    <ChecklistItem completed={profile.status === SellerStatus.APPROVED} label="Store approved by admin" />
                  </div>
                </div>

                <aside className="space-y-6">
                  <div className="rounded-3xl bg-secondary p-5 text-white shadow-sm">
                    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">
                      <FiZap /> Seller Tips
                    </p>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-white/75">
                      <li>• Keep stock updated to avoid out-of-stock listings.</li>
                      <li>• Process new orders quickly to keep customers happy.</li>
                      <li>• Add a clear store logo to build trust.</li>
                    </ul>
                  </div>
                  <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Approval Status</p>
                    <div className="mt-3 flex items-center gap-3">
                      <Badge className={statusClass[profile.status]}>{profile.status}</Badge>
                      <span className="text-xs text-stone-500">Controlled by admin</span>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}
