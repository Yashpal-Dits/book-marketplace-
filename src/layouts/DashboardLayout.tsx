import { NavLink, Outlet } from 'react-router-dom'
import { FiBookOpen, FiGrid, FiPackage, FiShoppingBag, FiShield } from 'react-icons/fi'
import { Header } from '@/components/common/Header'
import { Footer } from '@/components/common/Footer'
import { Role } from '@/enums/role.enum'
import { useAuthStore } from '@/store/auth.store'
import { cn } from '@/utils/cn'

const sellerLinks = [
  { to: '/seller/dashboard', label: 'Seller Dashboard', icon: FiGrid },
  { to: '/seller/listings', label: 'Listings & Inventory', icon: FiBookOpen },
  { to: '/seller/orders', label: 'Seller Orders', icon: FiShoppingBag },
]

const adminLinks = [
  { to: '/admin/dashboard', label: 'Admin Dashboard', icon: FiShield },
  { to: '/admin/sellers', label: 'Seller Approval', icon: FiPackage },
  { to: '/admin/books', label: 'Book Approval', icon: FiBookOpen },
]

export const DashboardLayout = () => {
  const user = useAuthStore((state) => state.user)
  const dashboardLinks = user?.role === Role.ADMIN ? adminLinks : sellerLinks

  return (
    <div className="min-h-screen bg-[#faf7ef]">
      <Header />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
        <aside className="h-fit rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
          <div className="rounded-2xl bg-[#0d2b1f] p-4 text-white">
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-300">Workspace</p>
            <h2 className="mt-1 font-display text-xl font-extrabold uppercase">
              {user?.role === Role.ADMIN ? 'Admin Portal' : 'Seller Portal'}
            </h2>
            <p className="mt-2 text-xs text-white/65">{user?.email}</p>
          </div>

          <nav className="mt-4 space-y-1 text-sm">
            {dashboardLinks.map((link) => {
              const Icon = link.icon
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-2xl px-3 py-2.5 font-medium text-stone-600 transition hover:bg-amber-50 hover:text-amber-900',
                      isActive && 'bg-amber-100 text-amber-950',
                    )
                  }
                >
                  <Icon />
                  {link.label}
                </NavLink>
              )
            })}
          </nav>
        </aside>
        <section className="min-h-[60vh]">
          <Outlet />
        </section>
      </div>
      <Footer />
    </div>
  )
}
