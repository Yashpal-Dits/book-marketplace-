import { EmptyState } from '@/components/common/EmptyState'
import { Loader } from '@/components/common/Loader'
import { ProfileForm, type ProfileField } from '@/components/profile/ProfileForm'
import { useAdminProfile, useUpdateAdminProfile } from '@/hooks/useProfile'
import { adminProfileSchema } from '@/schemas/profile.schema'
import type { UpdateAdminProfilePayload } from '@/interfaces'

const adminFields: ProfileField[] = [
  { name: 'firstName', label: 'First name' },
  { name: 'lastName', label: 'Last name' },
  { name: 'mobileNumber', label: 'Mobile number', inputMode: 'numeric' },
  { name: 'profileImage', label: 'Profile image URL' },
]

export const AdminProfilePage = () => {
  const { data: profile, isLoading, isError } = useAdminProfile()
  const updateProfile = useUpdateAdminProfile()

  if (isLoading) return <Loader />
  if (isError || !profile) return <EmptyState title="Could not load admin profile" description="Please login as an admin." />

  return (
    <ProfileForm<UpdateAdminProfilePayload>
      eyebrow="Admin Account"
      title="Admin"
      highlight="Profile"
      description="Manage your admin identity and optional contact details. Marketplace approval permissions remain role-based."
      sectionTitle="Account Details"
      email={profile.email}
      status="ADMIN"
      statusClassName="bg-blue-100 text-blue-800"
      initialValues={{
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        mobileNumber: profile.mobileNumber || '',
        profileImage: profile.profileImage || '',
      }}
      validationSchema={adminProfileSchema}
      fields={adminFields}
      avatarField="profileImage"
      displayName={(values) => `${values.firstName} ${values.lastName}`}
      isSaving={updateProfile.isPending}
      onSubmit={(values, helpers) => updateProfile.mutate(values, { onSettled: () => helpers.setSubmitting(false) })}
    />
  )
}
