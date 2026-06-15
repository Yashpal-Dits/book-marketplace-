import { EmptyState } from '@/components/common/EmptyState'
import { Loader } from '@/components/common/Loader'
import { ProfileForm, type ProfileField } from '@/components/profile/ProfileForm'
import { useCustomerProfile, useUpdateCustomerProfile } from '@/hooks/useProfile'
import { customerProfileSchema } from '@/schemas/profile.schema'
import type { UpdateCustomerProfilePayload } from '@/interfaces'

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
  const { data: profile, isLoading, isError } = useCustomerProfile()
  const updateProfile = useUpdateCustomerProfile()

  if (isLoading) return <Loader />
  if (isError || !profile) return <EmptyState title="Could not load profile" description="Please make sure you are logged in as a customer." />

  return (
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
  )
}
