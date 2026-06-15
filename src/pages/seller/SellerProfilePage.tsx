import { EmptyState } from '@/components/common/EmptyState'
import { Loader } from '@/components/common/Loader'
import { ProfileForm, type ProfileField } from '@/components/profile/ProfileForm'
import { SellerStatus } from '@/enums/seller-status.enum'
import { useSellerProfile, useUpdateSellerProfile } from '@/hooks/useProfile'
import { sellerProfileSchema } from '@/schemas/profile.schema'
import type { UpdateSellerProfilePayload } from '@/interfaces'

const sellerFields: ProfileField[] = [
  { name: 'businessName', label: 'Business name' },
  { name: 'contactPerson', label: 'Contact person' },
  { name: 'mobileNumber', label: 'Mobile number', inputMode: 'numeric' },
  { name: 'businessAddress', label: 'Business address', as: 'textarea' },
  { name: 'city', label: 'City' },
  { name: 'state', label: 'State' },
  { name: 'pincode', label: 'Pincode', inputMode: 'numeric' },
]

const statusClass: Record<SellerStatus, string> = {
  [SellerStatus.PENDING]: 'bg-amber-100 text-amber-800',
  [SellerStatus.APPROVED]: 'bg-emerald-100 text-emerald-800',
  [SellerStatus.REJECTED]: 'bg-red-100 text-red-700',
}

export const SellerProfilePage = () => {
  const { data: profile, isLoading, isError } = useSellerProfile()
  const updateProfile = useUpdateSellerProfile()

  if (isLoading) return <Loader />
  if (isError || !profile) return <EmptyState title="Could not load seller profile" description="Please login as a seller." />

  return (
    <ProfileForm<UpdateSellerProfilePayload>
      eyebrow="Seller Account"
      title="Store"
      highlight="Profile"
      description="Manage your public store identity and business contact details. Approval status is controlled only by admin."
      sectionTitle="Business Details"
      email={profile.email}
      status={profile.status}
      statusClassName={statusClass[profile.status]}
      initialValues={{
        businessName: profile.businessName || '',
        contactPerson: profile.contactPerson || '',
        mobileNumber: profile.mobileNumber || '',
        businessAddress: profile.businessAddress || '',
        city: profile.city || '',
        state: profile.state || '',
        pincode: profile.pincode || '',
        storeLogo: profile.storeLogo || '',
      }}
      validationSchema={sellerProfileSchema}
      fields={sellerFields}
      avatarField="storeLogo"
      displayName={(values) => values.businessName}
      locationText={(values) => (values.city ? `${values.city}, ${values.state}` : '')}
      noteTitle=""
      noteDescription=""
      isSaving={updateProfile.isPending}
      onSubmit={(values, helpers) => updateProfile.mutate(values, { onSettled: () => helpers.setSubmitting(false) })}
    />
  )
}
