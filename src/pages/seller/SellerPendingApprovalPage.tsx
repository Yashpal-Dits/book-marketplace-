import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FiClock, FiHome, FiLogOut, FiMail } from 'react-icons/fi'
import { useAuthStore } from '@/store/auth.store'

export const SellerPendingApprovalPage = () => {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login', { replace: true })
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-4xl items-center px-4 py-12">
      <div className="w-full overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-stone-200">
        <div className="bg-[#0d2b1f] px-6 py-8 text-center text-white sm:px-10">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white/10 text-3xl text-emerald-300">
            <FiClock />
          </div>

          <h1 className="font-display mt-5 text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
            Seller Approval Pending
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/75">
            Your email has been verified, but your seller account still needs admin approval before you can access seller features.
          </p>
        </div>

        <div className="px-6 py-8 sm:px-10">
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-left">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-amber-900">
              <FiMail /> What happens next?
            </h2>

            <ul className="mt-4 space-y-3 text-sm leading-6 text-stone-700">
              <li className="flex gap-3">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                Admin will review your seller registration details.
              </li>

              <li className="flex gap-3">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                Once approved, you can log in and manage listings, inventory, and seller orders.
              </li>

              <li className="flex gap-3">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                If your account remains pending for a long time, please contact marketplace support.
              </li>
            </ul>
          </div>

          {user?.email ? (
            <p className="mt-5 text-center text-xs text-stone-500">
              Signed in as <span className="font-semibold text-stone-700">{user.email}</span>
            </p>
          ) : null}

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Link
              to="/"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-5 text-sm font-semibold text-stone-700 transition hover:border-[#f0532d] hover:text-[#f0532d]"
            >
              <FiHome /> Go Home
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#f0532d] px-5 text-sm font-semibold text-white transition hover:bg-[#d8431f]"
            >
              <FiLogOut /> Logout
            </button>
          </div>

          <p className="mt-6 text-center text-xs leading-5 text-stone-400">
            You cannot create listings or access the seller dashboard until admin approval is complete.
          </p>
        </div>
      </div>
    </section>
  )
}