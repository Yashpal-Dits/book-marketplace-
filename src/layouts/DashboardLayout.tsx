import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  FiBookOpen,
  FiDatabase,
  FiGrid,
  FiPackage,
  FiPlusCircle,
  FiShoppingBag,
  FiShield,
  FiUser,
  FiX,
} from 'react-icons/fi'
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

const SellerSidebarExtras = () => {
  return (
    <div className="mt-5 flex flex-1 flex-col gap-4">
      <div className="rounded-[1.35rem] border border-stone-200 bg-stone-50 p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-500">Quick Actions</p>
        <div className="mt-3 space-y-2">
          <Link
            to="/seller/listings"
            className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2.5 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-amber-50 hover:text-amber-950"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-amber-100 text-amber-800">
              <FiPlusCircle />
            </span>
            Add or update stock
          </Link>
          <Link
            to="/seller/orders"
            className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2.5 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-amber-50 hover:text-amber-950"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 text-emerald-800">
              <FiShoppingBag />
            </span>
            Process seller orders
          </Link>
        </div>
      </div>

      <div className="mt-auto rounded-[1.35rem] bg-[#0d2b1f] p-4 text-white shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-300">Seller Tip</p>
        <p className="mt-2 text-sm font-semibold leading-5">Keep prices and inventory fresh.</p>
        <p className="mt-1 text-xs leading-5 text-white/65">
          Listings with active stock are easier for customers to discover and compare.
        </p>
      </div>
    </div>
  )
}

const AdminSidebarExtras = () => {
  return (
    <div className="mt-5 flex flex-1 flex-col gap-4">
      <div className="rounded-[1.35rem] border border-stone-200 bg-stone-50 p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-500">Admin Actions</p>
        <div className="mt-3 space-y-2">
          <Link
            to="/admin/sellers"
            className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2.5 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-amber-50 hover:text-amber-950"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-amber-100 text-amber-800">
              <FiPackage />
            </span>
            Review seller requests
          </Link>
          <Link
            to="/admin/books"
            className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2.5 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-amber-50 hover:text-amber-950"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 text-emerald-800">
              <FiBookOpen />
            </span>
            Approve pending books
          </Link>
          <Link
            to="/admin/catalog"
            className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2.5 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-amber-50 hover:text-amber-950"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-blue-100 text-blue-800">
              <FiDatabase />
            </span>
            Maintain catalog
          </Link>
          <Link
            to="/admin/customers"
            className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2.5 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-amber-50 hover:text-amber-950"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-purple-100 text-purple-800">
              <FiUser />
            </span>
            Manage customers
          </Link>
        </div>
      </div>

      <div className="mt-auto rounded-[1.35rem] bg-[#0d2b1f] p-4 text-white shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-300">Admin Tip</p>
        <p className="mt-2 text-sm font-semibold leading-5">Approve with marketplace quality in mind.</p>
        <p className="mt-1 text-xs leading-5 text-white/65">
          Verified sellers and clean catalog data keep the customer experience trustworthy.
        </p>
      </div>
    </div>
  )
}

export const DashboardLayout = () => {
  const navigate = useNavigate()
  const { user, impersonatedSellerId, impersonatedSellerName, stopSellerImpersonation } = useAuthStore()
  const isSellerImpersonation = user?.role === Role.ADMIN && Boolean(impersonatedSellerId)
  const isSellerWorkspace = isSellerImpersonation || user?.role === Role.SELLER
  const dashboardLinks = isSellerWorkspace ? sellerLinks : adminLinks

  const handleStopImpersonation = () => {
    stopSellerImpersonation()
    navigate('/admin/sellers')
  }

  return (
    <div className="min-h-screen bg-[#faf7ef]">
      <Header />
      <div className="grid gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-0 lg:px-0 lg:py-0">
        <aside className="custom-scrollbar hidden border-r border-stone-200/80 bg-white p-5 shadow-[10px_0_32px_rgba(15,23,42,0.06)] lg:sticky lg:top-16 lg:flex lg:h-[calc(100vh-4rem)] lg:max-h-[calc(100vh-4rem)] lg:self-start lg:flex-col lg:overflow-y-auto lg:rounded-r-[2rem]">
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

          {isSellerWorkspace ? <SellerSidebarExtras /> : <AdminSidebarExtras />}
        </aside>
        <section className="min-h-[60vh] lg:min-h-[calc(100vh-4rem)] lg:px-8 lg:py-8">
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
