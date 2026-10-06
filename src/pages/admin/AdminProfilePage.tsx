import { FiSave, FiShield, FiUser } from 'react-icons/fi'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { FormInput } from '@/components/common/FormInput'
import { Loader } from '@/components/common/Loader'
import { useAdminProfile, useUpdateAdminProfile } from '@/hooks/useAdmin'

export const AdminProfilePage = () => {
  const { data: profile, isLoading, isError } = useAdminProfile()
  const updateProfile = useUpdateAdminProfile()

  if (isLoading) return <Loader />
  if (isError || !profile) {
    return <EmptyState title="Could not load admin profile" description="Please try again after checking the API connection." />
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] bg-secondary p-6 text-white shadow-sm">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300"><FiShield /> Administrator</p>
        <h1 className="font-display mt-2 text-3xl font-extrabold uppercase">Account <span className="text-accent">Profile</span></h1>
        <p className="mt-2 text-sm text-white/70">Signed in as {profile.email}</p>
      </section>

      <section className="mx-auto max-w-3xl rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-xl text-amber-800"><FiUser /></span>
          <div>
            <h2 className="text-lg font-extrabold text-heading">Personal details</h2>
            <p className="text-sm text-stone-500">These values come from your administrator account.</p>
          </div>
        </div>

        <form
          className="grid gap-5 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault()
            const values = new FormData(event.currentTarget)
            updateProfile.mutate({
              firstName: String(values.get('firstName') || '').trim(),
              lastName: String(values.get('lastName') || '').trim(),
              mobileNumber: String(values.get('mobileNumber') || '').trim(),
              profileImage: String(values.get('profileImage') || '').trim(),
            })
          }}
        >
          <FormInput label="First name" name="firstName" defaultValue={profile.firstName || ''} required />
          <FormInput label="Last name" name="lastName" defaultValue={profile.lastName || ''} />
          <FormInput label="Mobile number" name="mobileNumber" defaultValue={profile.mobileNumber || ''} />
          <FormInput label="Profile image URL" name="profileImage" defaultValue={profile.profileImage || ''} />
          <div className="flex justify-end sm:col-span-2">
            <Button type="submit" disabled={updateProfile.isPending} className="gap-2">
              <FiSave /> {updateProfile.isPending ? 'Saving...' : 'Save profile'}
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}
