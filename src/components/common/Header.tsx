import { useState, useEffect } from 'react'
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

  useEffect(() => {
    if (!isLogoutConfirmOpen) return
    const originalStyle = window.getComputedStyle(document.body).overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [isLogoutConfirmOpen])

  const handleLogout = () => {
    logout()
    setIsLogoutConfirmOpen(false)
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const isImpersonatingCustomer = user?.role === Role.ADMIN && Boolean(impersonatedCustomerId)
  const profilePath = isImpersonatingCustomer ? '/customer/profile' : user?.role === Role.ADMIN ? '/admin/profile' : user?.role === Role.SELLER ? '/seller/profile' : '/customer/profile'

  const navLinks = isImpersonatingCustomer ? customerNavLinks : user?.role === Role.ADMIN ? adminNavLinks : user?.role === Role.SELLER ? sellerNavLinks : customerNavLinks

  const shouldShowCart = !isAuthenticated || user?.role === Role.CUSTOMER || isImpersonatingCustomer

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn('text-sm font-medium transition hover:text-emerald-400', isActive ? 'text-emerald-400 underline underline-offset-4' : 'text-white/85')

  return (
    <>
      <header className="sticky top-0 z-40 left-0 right-0 bg-secondary text-white shadow-md">
        <div className="flex h-16 w-full items-center justify-between gap-4 px-6 sm:px-8 lg:px-12">
          <div className="flex flex-1 items-center gap-4">
            <button type="button" onClick={toggleSidebar} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:bg-white/10 lg:hidden">
              <FiMenu size={20} />
            </button>
            <Link to="/" className="flex items-center gap-2.5 whitespace-nowrap">
              <FaBookOpen className="text-accent shrink-0" size={24} />
              <span className="font-display text-xl font-extrabold tracking-tight text-emerald-300 sm:text-2xl">Bseller</span>
            </Link>
          </div>

          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClass} end={link.to === '/'}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex flex-1 items-center justify-end gap-3">
            {shouldShowCart && (
              <Link to="/cart" className="relative inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10">
                <FiShoppingCart size={18} />
                <span className="absolute right-0 top-0 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold ring-2 ring-secondary">
                  {cartCount}
                </span>
              </Link>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link to={profilePath} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20">
                  <FiUser size={18} />
                </Link>
                <button onClick={() => setIsLogoutConfirmOpen(true)} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/5 transition hover:bg-red-500/20">
                  <FiLogOut size={18} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="rounded-full bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider transition hover:bg-primary-hover">
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
            <FiAlertTriangle className="mx-auto text-3xl text-amber-500" />
            <h2 className="mt-4 font-display text-2xl font-bold text-slate-900">Logout?</h2>
            <p className="mt-2 text-sm text-slate-500">Are you sure you want to exit?</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={() => setIsLogoutConfirmOpen(false)} className="rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600">Cancel</button>
              <button onClick={handleLogout} className="rounded-xl bg-primary py-3 text-sm font-semibold text-white">Logout</button>
            </div>
          </div>
        </div>
      )}
      <SidebarDrawer />
    </>
  )
}
