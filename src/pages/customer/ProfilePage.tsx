import { EmptyState } from '@/components/common/EmptyState'
import { Loader } from '@/components/common/Loader'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { useCustomerProfile, useUpdateCustomerProfile } from '@/hooks/useProfile'
import { useOrders } from '@/hooks/useOrders'
import { customerProfileSchema } from '@/schemas/profile.schema'
import type { UpdateCustomerProfilePayload, ProfileField, IOrderDetailed } from '@/interfaces'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { FiPackage, FiChevronRight } from 'react-icons/fi'
import { formatDate } from '@/utils/formatDate'
import { cn } from '@/utils/cn'

const customerFields: ProfileField[] = [
  { name: 'firstName', label: 'First name' },
  { name: 'lastName', label: 'Last name' },
  { name: 'mobileNumber', label: 'Mobile number', inputMode: 'numeric' },
  { name: 'profileImage', label: 'Profile image URL' },
  { name: 'addressLine', label: 'Shipping address', as: 'textarea' },
  { name: 'city', label: 'City' },
  { name: 'state', label: 'State' },
  { name: 'pincode', label: 'Pincode', inputMode: 'numeric' },
]

export const ProfilePage = () => {
  const { data: profile, isLoading: profileLoading, isError: profileError } = useCustomerProfile()
  const { data: ordersData, isLoading: ordersLoading } = useOrders()
  const updateProfile = useUpdateCustomerProfile()
  const navigate = useNavigate()

  if (profileLoading) return <Loader />
  if (profileError || !profile) return <EmptyState title="Could not load profile" description="Please make sure you are logged in as a customer." />

  const recentOrders = (ordersData as IOrderDetailed[])?.slice(0, 5) || []

  return (
    <div className="space-y-6">
      <ProfileForm<UpdateCustomerProfilePayload>
        eyebrow="Customer Account"
        title="Manage"
        highlight="Profile"
        description="Keep your name, contact number, shipping address, and profile image updated for faster checkout."
        sectionTitle="Personal Details"
        email={profile.email}
        initialValues={{
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          mobileNumber: profile.mobileNumber || '',
          addressLine: profile.addressLine || '',
          city: profile.city || '',
          state: profile.state || '',
          pincode: profile.pincode || '',
          profileImage: profile.profileImage || '',
        }}
        validationSchema={customerProfileSchema}
        fields={customerFields}
        avatarField="profileImage"
        displayName={(values) => `${values.firstName} ${values.lastName}`}
        locationText={(values) => (values.city ? `${values.city}, ${values.state}` : '')}
        isSaving={updateProfile.isPending}
        onSubmit={(values, helpers) => updateProfile.mutate(values, { onSettled: () => helpers.setSubmitting(false) })}
      />

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-stone-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-stone-100 p-6">
            <div>
              <h2 className="font-display text-xl font-extrabold uppercase text-[#16243d]">My Recent Orders</h2>
              <p className="text-sm text-stone-500">Your last few purchases at a glance.</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="gap-2"
              onClick={() => navigate('/orders')}
            >
              <FiPackage /> View All
            </Button>
          </div>

          <div className="p-6">
            {ordersLoading ? (
              <div className="flex justify-center py-10"><Loader /></div>
            ) : recentOrders.length === 0 ? (
              <div className="py-10 text-center text-stone-500">
                <p>You haven't placed any orders yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100">
                      <th className="pb-4">Order ID</th>
                      <th className="pb-4">Date</th>
                      <th className="pb-4">Amount</th>
                      <th className="pb-4">Status</th>
                      <th className="pb-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {recentOrders.map((order: IOrderDetailed) => (
                      <tr key={order.id} className="group transition hover:bg-stone-50">
                        <td className="py-4 text-sm font-medium text-[#16243d]">#{order.id.slice(-6).toUpperCase()}</td>
                        <td className="py-4 text-sm text-stone-500">{formatDate(order.createdAt)}</td>
                        <td className="py-4 text-sm font-semibold text-[#16243d]">₹{order.totalAmount}</td>
                        <td className="py-4">
                          <span className={cn(
                            'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                            order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' : 
                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                          )}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <Button
                            type="button"
                            variant="secondary"
                            className="h-8 px-3 text-xs gap-1"
                            onClick={() => navigate(`/orders/${order.id}`)}
                          >
                            Details <FiChevronRight />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
