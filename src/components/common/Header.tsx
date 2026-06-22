import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FiAlertTriangle, FiLogOut, FiMenu, FiShoppingCart, FiUser } from 'react-icons/fi'
import { FaBookOpen } from 'react-icons/fa'
import { Role } from '@/enums/role.enum'
import { useAuthStore } from '@/store/auth.store'
import { useUiStore } from '@/store/ui.store'
import { useCart } from '@/hooks/useCart'
import { SidebarDrawer } from '@/components/common/SidebarDrawer'
import { cn } from '@/utils/cn'

const customerNavLinks = [
  { to: '/', label: 'Home' },
  { to: '/books', label: 'Shop' },
  { to: '/bestsellers', label: 'Best Sellers' },
  { to: '/new-arrivals', label: 'New Arrivals' },
  { to: '/deals', label: 'Deals & Offers' },
]

const sellerNavLinks = [
  { to: '/seller/dashboard', label: 'Dashboard' },
  { to: '/seller/listings', label: 'Listings' },
  { to: '/seller/orders', label: 'Orders' },
  { to: '/', label: 'Preview Store' },
]

const adminNavLinks = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/sellers', label: 'Seller Approval' },
  { to: '/admin/books', label: 'Book Approval' },
  { to: '/', label: 'Preview Store' },
]

export const Header = () => {
  const { user, isAuthenticated, logout, impersonatedCustomerId } = useAuthStore()
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)
  const navigate = useNavigate()
  const { data: cartItems = [] } = useCart()
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false)
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const handleLogout = () => {
    logout()
    setIsLogoutConfirmOpen(false)
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const isImpersonatingCustomer = user?.role === Role.ADMIN && Boolean(impersonatedCustomerId)
  const profilePath = isImpersonatingCustomer
    ? '/customer/profile'
    : user?.role === Role.ADMIN 
      ? '/admin/profile' 
      : user?.role === Role.SELLER 
        ? '/seller/profile' 
        : '/customer/profile'

  const navLinks = isImpersonatingCustomer 
    ? customerNavLinks 
    : user?.role === Role.ADMIN 
      ? adminNavLinks 
      : user?.role === Role.SELLER 
        ? sellerNavLinks 
        : customerNavLinks

  const shouldShowCart = !isAuthenticated || user?.role === Role.CUSTOMER || isImpersonatingCustomer

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn('text-sm font-medium transition hover:text-emerald-300', isActive ? 'text-emerald-300' : 'text-white/85')

  return (
    <>
      <header className="sticky top-0 z-40 bg-secondary/95 text-white backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open menu"
              onClick={toggleSidebar}
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-xl transition hover:bg-white/10 lg:hidden"
            >
              <FiMenu />
            </button>
            <Link to="/" className="cursor-pointer flex items-center gap-2 text-lg font-bold text-emerald-300">
              <FaBookOpen className="text-accent" /> <span className="cursor-pointer font-display tracking-wide">Bseller</span>
            </Link>
          </div>

          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClass} end={link.to === '/'}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            {shouldShowCart ? (
              <Link
                to="/cart"
                aria-label="Cart"
                className="relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition hover:bg-white/10"
              >
                <FiShoppingCart />
                <span className="cursor-pointer absolute -right-0.5 -top-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold">
                  {cartCount}
                </span>
              </Link>
            ) : null}

            {isAuthenticated ? (
              <>
                <Link
                  to={profilePath}
                  aria-label="Profile"
                  className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-semibold transition hover:bg-white/15"
                >
                  <FiUser className="text-lg" />
                  <span className="cursor-pointer hidden sm:inline">{user?.firstName || user?.email}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsLogoutConfirmOpen(true)}
                  aria-label="Logout"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-full px-3 text-sm font-semibold transition hover:bg-white/10"
                >
                  <FiLogOut />
                  <span className="cursor-pointer hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="cursor-pointer hidden text-sm text-white/85 transition hover:text-emerald-300 sm:inline">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="cursor-pointer ml-1 inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-semibold transition hover:bg-primary-hover"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {isLogoutConfirmOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Confirm logout">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-amber-700">
              <FiAlertTriangle className="text-xl" />
            </div>
            <h2 className="mt-4 font-display text-2xl font-extrabold uppercase text-heading">Logout?</h2>
            <p className="mt-2 text-sm leading-6 text-stone-500">
              Are you sure you want to logout from your account?
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="inline-flex h-11 items-center justify-center rounded-full border border-stone-200 bg-white text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="cursor-pointer inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-white transition hover:bg-primary-hover"
              >
                <FiLogOut /> Logout
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <SidebarDrawer />
    </>
  )
}
