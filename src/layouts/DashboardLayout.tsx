import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { FiBookOpen, FiGrid, FiPackage, FiShoppingBag, FiShield, FiUser, FiX, FiDatabase } from 'react-icons/fi'
import { Header } from '@/components/common/Header'
import { Footer } from '@/components/common/Footer'
import { Button } from '@/components/common/Button'
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
  { to: '/admin/catalog', label: 'Catalog Management', icon: FiDatabase },
  { to: '/admin/customers', label: 'Customer Management', icon: FiUser },
]

export const DashboardLayout = () => {
  const navigate = useNavigate()
  const { user, impersonatedSellerId, impersonatedSellerName, stopSellerImpersonation } = useAuthStore()
  const isSellerImpersonation = user?.role === Role.ADMIN && Boolean(impersonatedSellerId)
  const dashboardLinks = isSellerImpersonation || user?.role === Role.SELLER ? sellerLinks : adminLinks

  const handleStopImpersonation = () => {
    stopSellerImpersonation()
    navigate('/admin/sellers')
  }

  return (
    <div className="min-h-screen bg-[#faf7ef]">
      <Header />
      <div className="grid gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
        <aside className="h-fit rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
          <div className="rounded-2xl bg-[#0d2b1f] p-4 text-white">
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-300">
              {isSellerImpersonation ? 'Impersonating' : 'Workspace'}
            </p>
            <h2 className="mt-1 font-display text-xl font-extrabold uppercase">
              {isSellerImpersonation ? impersonatedSellerName : user?.role === Role.ADMIN ? 'Admin Portal' : 'Seller Portal'}
            </h2>
            <p className="mt-2 text-xs text-white/65">{user?.email}</p>
          </div>

          {isSellerImpersonation ? (
            <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
              <p className="font-semibold">Admin seller view is active.</p>
              <p className="mt-1">Actions will be performed for this seller.</p>
              <Button type="button" variant="secondary" onClick={handleStopImpersonation} className="mt-3 h-9 w-full gap-2 text-xs">
                <FiX /> Stop view
              </Button>
            </div>
          ) : null}

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
          {isSellerImpersonation ? (
            <div className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Impersonate Seller Dashboard</p>
              <h1 className="mt-1 font-display text-2xl font-extrabold uppercase text-[#16243d]">
                Viewing as {impersonatedSellerName}
              </h1>
              <p className="mt-1 text-sm text-amber-900/80">
                You are still logged in as admin, but seller dashboard data and actions are scoped to this seller.
              </p>
            </div>
          ) : null}
          <Outlet />
        </section>
      </div>
      <Footer />
    </div>
  )
}
