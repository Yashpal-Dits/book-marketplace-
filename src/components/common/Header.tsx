import { Link, NavLink, useNavigate } from 'react-router-dom'
import { FiBookOpen, FiLogOut, FiMenu, FiUser } from 'react-icons/fi'
import { Role } from '@/enums/role.enum'
import { Button } from './Button'
import { useAuthStore } from '@/store/auth.store'

export const Header = () => {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const dashboardPath = user?.role === Role.ADMIN ? '/admin/dashboard' : user?.role === Role.SELLER ? '/seller/dashboard' : '/orders'

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-[#faf7ef]/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 font-serif text-xl font-semibold text-amber-900">
          <FiBookOpen /> Paper Haven
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-stone-600 md:flex">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'text-amber-900' : 'hover:text-amber-900')}>Home</NavLink>
          <NavLink to="/books" className={({ isActive }) => (isActive ? 'text-amber-900' : 'hover:text-amber-900')}>Books</NavLink>
          {isAuthenticated ? <NavLink to={dashboardPath} className="hover:text-amber-900">Dashboard</NavLink> : null}
        </nav>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="hidden items-center gap-2 rounded-full bg-white px-3 py-1 text-xs text-stone-600 shadow-sm sm:flex"><FiUser /> {user?.firstName || user?.email}</span>
              <Button variant="ghost" onClick={handleLogout} className="px-3"><FiLogOut /></Button>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden text-sm text-stone-600 hover:text-amber-900 sm:inline">Login</Link>
              <Link to="/register"><Button>Register</Button></Link>
            </>
          )}
          <button className="md:hidden"><FiMenu /></button>
        </div>
      </div>
    </header>
  )
}
