import { NavLink, Outlet } from 'react-router-dom'
import { Header } from '@/components/common/Header'
import { Footer } from '@/components/common/Footer'
import { cn } from '@/utils/cn'

const dashboardLinks = [
  { to: '/seller/dashboard', label: 'Seller Dashboard' },
  { to: '/seller/listings', label: 'Listings' },
  { to: '/seller/orders', label: 'Seller Orders' },
  { to: '/admin/dashboard', label: 'Admin Dashboard' },
  { to: '/admin/sellers', label: 'Seller Approval' },
  { to: '/admin/books', label: 'Book Approval' },
]

export const DashboardLayout = () => (
  <div className="min-h-screen bg-[#faf7ef]">
    <Header />
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[250px_1fr] lg:px-8">
      <aside className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
        <h2 className="px-3 font-serif text-xl text-stone-900">Workspace</h2>
        <nav className="mt-4 space-y-1 text-sm">
          {dashboardLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => cn('block rounded-2xl px-3 py-2 text-stone-600 hover:bg-amber-50 hover:text-amber-900', isActive && 'bg-amber-100 text-amber-950')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <section className="min-h-[60vh]"><Outlet /></section>
    </div>
    <Footer />
  </div>
)
