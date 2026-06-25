import { Link, NavLink, Outlet } from 'react-router-dom'
import {
  FiBookOpen,
  FiDatabase,
  FiGrid,
  FiHelpCircle,
  FiPackage,
  FiPlusCircle,
  FiShoppingBag,
  FiShield,
  FiUser,
} from 'react-icons/fi'
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
  { to: '/admin/catalog', label: 'Catalog Management', icon: FiDatabase },
  { to: '/admin/customers', label: 'Customer Management', icon: FiUser },
]

const SellerSidebarExtras = () => (
    <div className="mt-5 flex flex-1 flex-col gap-4">
      <div className="rounded-[1.35rem] border border-stone-200 bg-stone-50 p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-500">Quick Actions</p>
        <div className="mt-3 space-y-2">
          <Link to="/seller/listings" className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2.5 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-amber-50">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-amber-100 text-amber-800"><FiPlusCircle /></span>
            Add or update stock
          </Link>
          <Link to="/seller/orders" className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2.5 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-amber-50">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-amber-100 text-amber-800"><FiShoppingBag /></span>
            Process orders
          </Link>
        </div>
      </div>

      <div className="mt-auto rounded-[1.35rem] bg-[#0d2b1f] p-4 text-white">
        <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-300">
          <FiHelpCircle /> Seller Tip
        </p>
        <p className="mt-2 text-xs leading-5 text-white/70">
          Keep your stock updated and process new orders quickly to rank higher with customers.
        </p>
      </div>
    </div>
)

const AdminSidebarExtras = () => (
    <div className="mt-5 flex flex-1 flex-col gap-4">
      <div className="rounded-[1.35rem] border border-stone-200 bg-stone-50 p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-500">Admin Actions</p>
        <div className="mt-3 space-y-2">
          <Link to="/admin/sellers" className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2.5 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-amber-50">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-amber-100 text-amber-800"><FiPackage /></span>
            Review seller requests
          </Link>
          <Link to="/admin/books" className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2.5 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-amber-50">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-amber-100 text-amber-800"><FiBookOpen /></span>
            Approve books
          </Link>
        </div>
      </div>

      <div className="mt-auto rounded-[1.35rem] bg-[#0d2b1f] p-4 text-white">
        <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-300">
          <FiHelpCircle /> Admin Note
        </p>
        <p className="mt-2 text-xs leading-5 text-white/70">
          Review pending sellers and books regularly to keep the marketplace catalog fresh and trustworthy.
        </p>
      </div>
    </div>
)

export const DashboardLayout = () => {
  const { user, impersonatedSellerId, impersonatedSellerName } = useAuthStore()
  const isSellerImpersonation = user?.role === Role.ADMIN && Boolean(impersonatedSellerId)
  const isSellerWorkspace = isSellerImpersonation || user?.role === Role.SELLER
  const dashboardLinks = isSellerWorkspace ? sellerLinks : adminLinks

  return (
    <div className="flex min-h-screen w-full max-w-full flex-col [overflow-x:clip] bg-[#faf7ef]">
      <Header />
      <div className="flex-1 grid w-full px-3 py-6 sm:px-6 lg:grid-cols-[280px_1fr] lg:gap-0 lg:px-0 lg:py-0">
        <div className="custom-scrollbar hidden border-r border-stone-200/80 bg-white lg:sticky lg:top-16 lg:block lg:h-[calc(100vh-4rem)] lg:overflow-y-auto lg:rounded-r-[2rem]">
          <aside className="flex min-h-full flex-col p-5">
            <div className="rounded-2xl bg-[#0d2b1f] p-4 text-white">
              <h2 className="font-display text-xl font-extrabold uppercase">
                {isSellerImpersonation ? impersonatedSellerName : user?.role === Role.ADMIN ? 'Admin Portal' : 'Seller Portal'}
              </h2>
            </div>
            <nav className="mt-4 space-y-1">
              {dashboardLinks.map((link) => {
                const Icon = link.icon
                return (
                  <NavLink key={link.to} to={link.to} className={({ isActive }) => cn('flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition', isActive ? 'bg-amber-100 text-amber-950 font-bold' : 'text-stone-600 hover:bg-amber-50')}>
                    <Icon /> {link.label}
                  </NavLink>
                )
              })}
            </nav>
            {isSellerWorkspace ? <SellerSidebarExtras /> : <AdminSidebarExtras />}
          </aside>
        </div>
        <section className="w-full min-w-0 max-w-full overflow-x-hidden lg:px-8 lg:py-8">
          <Outlet />
        </section>
      </div>
      <Footer />
    </div>
  )
}
