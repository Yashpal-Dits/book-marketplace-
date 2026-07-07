import { EmptyState } from '@/components/common/EmptyState'

export const AdminProfilePage = () => {
  return (
    <EmptyState
      title="Admin profile is not available yet"
      description="Your backend does not currently expose an admin profile endpoint. We will wire this after the admin module migration."
    />
  )
}