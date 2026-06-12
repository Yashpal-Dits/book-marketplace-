import { Link, NavLink, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FiHeart, FiLogOut, FiMenu, FiShoppingCart, FiUser, FiX } from 'react-icons/fi'
import { FaBookOpen } from 'react-icons/fa'
import { Role } from '@/enums/role.enum'
import { useAuthStore } from '@/store/auth.store'
import { useUiStore } from '@/store/ui.store'
import { useCart } from '@/hooks/useCart'
import { cn } from '@/utils/cn'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/books', label: 'Shop' },
  { to: '/orders', label: 'Orders' },
]

export const Header = () => {
  const { user, isAuthenticated, logout } = useAuthStore()
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUiStore()
  const navigate = useNavigate()
  const { data: cartItems = [] } = useCart()
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const dashboardPath =
    user?.role === Role.ADMIN ? '/admin/dashboard' : user?.role === Role.SELLER ? '/seller/dashboard' : null

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn('text-sm font-medium transition hover:text-emerald-300', isActive ? 'text-emerald-300' : 'text-white/85')

  return (
    <header className="sticky top-0 z-40 bg-[#0d2b1f]/95 text-white backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" onClick={closeMobileMenu} className="flex items-center gap-2 text-lg font-bold text-emerald-300">
          <FaBookOpen className="text-[#f5862e]" /> <span className="font-display tracking-wide">Bseller</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass} end={link.to === '/'}>
              {link.label}
            </NavLink>
          ))}
          {dashboardPath ? (
            <NavLink to={dashboardPath} className={linkClass}>
              Dashboard
            </NavLink>
          ) : null}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/cart"
            aria-label="Cart"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10"
          >
            <FiShoppingCart />
            <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#f0532d] text-[9px] font-bold">
              {cartCount}
            </span>
          </Link>
          <button
            type="button"
            aria-label="Wishlist"
            className="relative hidden h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10 sm:inline-flex"
          >
            <FiHeart />
            <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#f0532d] text-[9px] font-bold">
              0
            </span>
          </button>

          {isAuthenticated ? (
            <>
              <span className="hidden items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs sm:flex">
                <FiUser /> {user?.firstName || user?.email}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Logout"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10"
              >
                <FiLogOut />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden text-sm text-white/85 transition hover:text-emerald-300 sm:inline">
                Login
              </Link>
              <Link
                to="/register"
                className="ml-1 inline-flex h-9 items-center rounded-full bg-[#f0532d] px-4 text-sm font-semibold transition hover:bg-[#d8431f]"
              >
                Register
              </Link>
            </>
          )}

          <button
            type="button"
            aria-label="Toggle menu"
            onClick={toggleMobileMenu}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10 md:hidden"
          >
            {isMobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* mobile menu */}
      {isMobileMenuOpen ? (
        <nav className="border-t border-white/10 bg-[#0d2b1f] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClass} end={link.to === '/'} onClick={closeMobileMenu}>
                {link.label}
              </NavLink>
            ))}
            {dashboardPath ? (
              <NavLink to={dashboardPath} className={linkClass} onClick={closeMobileMenu}>
                Dashboard
              </NavLink>
            ) : null}
            {!isAuthenticated ? (
              <NavLink to="/login" className={linkClass} onClick={closeMobileMenu}>
                Login
              </NavLink>
            ) : null}
          </div>
        </nav>
      ) : null}
    </header>
  )
}
