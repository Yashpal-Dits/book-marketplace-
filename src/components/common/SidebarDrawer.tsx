import { Link, NavLink, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FaBookOpen } from 'react-icons/fa'
import { Role } from '@/enums/role.enum'
import { SellerStatus } from '@/enums/seller-status.enum'
import { useAuthStore } from '@/store/auth.store'
import { useUiStore } from '@/store/ui.store'
import { cn } from '@/utils/cn'
import {
  FiBookOpen,
  FiClock,
  FiDatabase,
  FiGrid,
  FiHome,
  FiLogIn,
  FiLogOut,
  FiPackage,
  FiPercent,
  FiShoppingBag,
  FiShoppingCart,
  FiStar,
  FiTrendingUp,
  FiUser,
  FiX,
} from 'react-icons/fi'

const customerLinks = [
  { to: '/', label: 'Home', icon: FiHome },
  { to: '/books', label: 'Shop Books', icon: FiBookOpen },
  { to: '/bestsellers', label: 'Best Sellers', icon: FiStar },
  { to: '/new-arrivals', label: 'New Arrivals', icon: FiTrendingUp },
  { to: '/deals', label: 'Deals & Offers', icon: FiPercent },
  { to: '/cart', label: 'Cart', icon: FiShoppingCart },
  { to: '/orders', label: 'My Orders', icon: FiShoppingBag },
  { to: '/customer/profile', label: 'My Profile', icon: FiUser },
]

const sellerLinks = [
  { to: '/seller/dashboard', label: 'Seller Dashboard', icon: FiGrid },
  { to: '/seller/listings', label: 'Listings & Inventory', icon: FiBookOpen },
  { to: '/seller/orders', label: 'Seller Orders', icon: FiShoppingBag },
  { to: '/seller/profile', label: 'Seller Profile', icon: FiUser },
  { to: '/', label: 'Preview Store', icon: FiHome },
]

const pendingSellerLinks = [
  { to: '/', label: 'Home', icon: FiHome },
  { to: '/seller/pending-approval', label: 'Approval Pending', icon: FiClock },
]

const adminLinks = [
  { to: '/admin/dashboard', label: 'Admin Dashboard', icon: FiGrid },
  { to: '/admin/sellers', label: 'Seller Approval', icon: FiPackage },
  { to: '/admin/books', label: 'Book Approval', icon: FiBookOpen },
  { to: '/admin/catalog', label: 'Catalog Management', icon: FiDatabase },
  { to: '/admin/customers', label: 'Customer Management', icon: FiUser },
  { to: '/admin/profile', label: 'Admin Profile', icon: FiUser },
  { to: '/', label: 'Preview Store', icon: FiHome },
]

export const SidebarDrawer = () => {
  const navigate = useNavigate()
  const { isSidebarOpen, closeSidebar } = useUiStore()
  const { user, isAuthenticated, sellerStatus, logout } = useAuthStore()

  const isPendingSeller = user?.role === Role.SELLER && sellerStatus === SellerStatus.PENDING

  const links =
    user?.role === Role.ADMIN
      ? adminLinks
      : isPendingSeller
        ? pendingSellerLinks
        : user?.role === Role.SELLER
          ? sellerLinks
          : customerLinks

  const profilePath =
    user?.role === Role.ADMIN
      ? '/admin/profile'
      : user?.role === Role.SELLER
        ? '/seller/profile'
        : '/customer/profile'

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName ?? ''}`.trim()
    : user?.email

  const initials = displayName
    ?.split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  const handleLogout = () => {
    logout()
    closeSidebar()
    toast.success('Logged out successfully')
    navigate('/login', { replace: true })
  }

  return (
    <>
      <div
        aria-hidden="true"
        onClick={closeSidebar}
        className={cn(
          'fixed inset-0 z-50 bg-black/30 backdrop-blur-sm transition-opacity duration-300',
          isSidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navigation sidebar"
        className={cn(
          'fixed left-0 top-0 z-50 flex h-dvh w-[86vw] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <header className="flex items-center justify-between bg-[#0d2b1f] px-5 py-4 text-white">
          <Link
            to="/"
            onClick={closeSidebar}
            className="flex items-center gap-2 text-lg font-bold text-emerald-300"
          >
            <FaBookOpen className="text-[#f5862e]" />
            <span className="font-display tracking-wide">Bseller</span>
          </Link>

          <button
            type="button"
            aria-label="Close menu"
            onClick={closeSidebar}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10"
          >
            <FiX />
          </button>
        </header>

        <div className="border-b border-stone-100 bg-[#faf7ef] p-5">
          {isAuthenticated ? (
            isPendingSeller ? (
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-amber-100 text-sm font-bold text-amber-800">
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      initials || <FiUser />
                    )}
                  </span>

                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-[#16243d]">
                      Hello, {displayName}
                    </span>
                    <span className="block truncate text-xs text-stone-500">
                      {user?.email}
                    </span>
                  </span>
                </div>

                <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium leading-5 text-amber-800">
                  Your seller account is pending admin approval.
                </div>
              </div>
            ) : (
              <Link
                to={profilePath}
                onClick={closeSidebar}
                className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm transition hover:bg-orange-50"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-amber-100 text-sm font-bold text-amber-800">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    initials || <FiUser />
                  )}
                </span>

                <span className="min-w-0">
                  <span className="block text-sm font-bold text-[#16243d]">
                    Hello, {displayName}
                  </span>
                  <span className="block truncate text-xs text-stone-500">
                    {user?.email}
                  </span>
                </span>
              </Link>
            )
          ) : (
            <Link
              to="/login"
              onClick={closeSidebar}
              className="flex items-center justify-center gap-2 rounded-full bg-[#f0532d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#d8431f]"
            >
              <FiLogIn /> Login / Register
            </Link>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <p className="px-3 text-xs font-bold uppercase tracking-[0.18em] text-stone-400">
            Menu
          </p>

          <div className="mt-3 space-y-1">
            {links.map((link) => {
              const Icon = link.icon

              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-stone-700 transition hover:bg-orange-50 hover:text-[#f0532d]',
                      isActive && 'bg-orange-100 text-[#f0532d]',
                    )
                  }
                  end={link.to === '/'}
                >
                  <Icon />
                  {link.label}
                </NavLink>
              )
            })}

            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                <FiLogOut />
                Logout
              </button>
            ) : null}
          </div>
        </nav>

        <footer className="border-t border-stone-100 p-4 text-xs leading-5 text-stone-500">
          {isPendingSeller
            ? 'You can access seller features once admin approves your seller account.'
            : 'Books are shown only when approved and actively listed by approved sellers.'}
        </footer>
      </aside>
    </>
  )
}