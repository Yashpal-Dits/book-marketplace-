import { Link } from 'react-router-dom'
import { FiBookOpen, FiCheckCircle, FiClock, FiPackage, FiShoppingBag, FiUsers, FiXCircle } from 'react-icons/fi'
import { Badge } from '@/components/common/Badge'
import { EmptyState } from '@/components/common/EmptyState'
import { Loader } from '@/components/common/Loader'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { BookStatus } from '@/enums/book-status.enum'
import { SellerStatus } from '@/enums/seller-status.enum'
import { useAdminDashboard } from '@/hooks/useAdmin'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'
import { cn } from '@/utils/cn'

const StatCard = ({ label, value, icon: Icon, tone = 'amber' }: { label: string; value: string | number; icon: typeof FiUsers; tone?: 'amber' | 'green' | 'blue' | 'red' }) => {
  const colors = {
    amber: 'bg-amber-100 text-amber-800',
    green: 'bg-emerald-100 text-emerald-800',
    blue: 'bg-blue-100 text-blue-800',
    red: 'bg-red-100 text-red-700',
  }

  return (
    <div className="min-w-0 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
      <div className={`grid h-10 w-10 place-items-center rounded-xl sm:h-11 sm:w-11 sm:rounded-2xl ${colors[tone]}`}>
        <Icon size={18} />
      </div>
      <p className="mt-4 text-xs text-stone-500 sm:text-sm">{label}</p>
      <p className="mt-1 text-xl font-extrabold text-heading sm:text-2xl">{value}</p>
    </div>
  )
}

const sellerStatusClass: Record<SellerStatus, string> = {
  [SellerStatus.PENDING]: 'bg-amber-100 text-amber-800',
  [SellerStatus.APPROVED]: 'bg-emerald-100 text-emerald-800',
  [SellerStatus.REJECTED]: 'bg-red-100 text-red-700',
}

const bookStatusClass: Record<BookStatus, string> = {
  [BookStatus.PENDING]: 'bg-amber-100 text-amber-800',
  [BookStatus.APPROVED]: 'bg-emerald-100 text-emerald-800',
  [BookStatus.REJECTED]: 'bg-red-100 text-red-700',
}

export const AdminDashboardPage = () => {
  const { data, isLoading, isError } = useAdminDashboard()

  if (isLoading) return <Loader />
  if (isError || !data) return <EmptyState title="Could not load admin dashboard" description="Make sure JSON Server is running on port 4000." />

  return (
    <div className="w-full min-w-0 space-y-6">
      <section className="overflow-hidden rounded-2xl bg-secondary p-5 text-white shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">Admin Portal</p>
            <h1 className="font-display mt-1 text-2xl font-extrabold uppercase leading-tight sm:text-4xl">
              Marketplace <span className="text-accent">Dashboard</span>
            </h1>
            <p className="mt-2 max-w-2xl text-xs leading-5 text-white/70 sm:text-sm">
              Review sellers, approve catalog books, and monitor marketplace operations.
            </p>
          </div>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <Link to="/admin/sellers" className="flex-1 text-center inline-flex h-10 items-center justify-center rounded-full bg-primary px-4 text-xs font-semibold text-white shadow-lg shadow-orange-600/20 sm:flex-none sm:h-11 sm:px-5">
              Review sellers
            </Link>
            <Link to="/admin/books" className="flex-1 text-center inline-flex h-10 items-center justify-center rounded-full bg-white/10 px-4 text-xs font-semibold text-white sm:flex-none sm:h-11 sm:px-5">
              Review books
            </Link>
          </div>
        </div>
      </section>

      <section className="grid w-full grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
        <StatCard label="Total sellers" value={data.totalSellers} icon={FiPackage} />
        <StatCard label="Pending" value={data.pendingSellers} icon={FiClock} tone="red" />
        <StatCard label="Customers" value={data.totalCustomers} icon={FiUsers} tone="blue" />
        <StatCard label="Total books" value={data.totalBooks} icon={FiBookOpen} />
      </section>

      <section className="grid w-full gap-6 xl:grid-cols-3">
        <div className="min-w-0 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-base font-bold uppercase text-heading sm:text-xl">Recent Sellers</h2>
            <Link to="/admin/sellers" className="shrink-0 text-xs font-semibold text-primary hover:text-primary-hover">View all</Link>
          </div>
          <div className="mt-4 space-y-3">
            {data.recentSellers.map((seller) => (
              <div key={seller.id} className="rounded-xl border border-stone-100 bg-stone-50/70 p-3 sm:p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-heading">{seller.businessName}</p>
                    <p className="mt-0.5 truncate text-[10px] text-stone-500">{seller.email}</p>
                    <p className="mt-0.5 text-[10px] text-stone-400">{formatDate(seller.createdAt)}</p>
                  </div>
                  <Badge className={cn(sellerStatusClass[seller.status], 'shrink-0 px-2 py-0.5 text-[9px] font-bold')}>{seller.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-base font-bold uppercase text-heading sm:text-xl">Recent Books</h2>
            <Link to="/admin/books" className="shrink-0 text-xs font-semibold text-primary hover:text-primary-hover">View all</Link>
          </div>
          <div className="mt-4 space-y-3">
            {data.recentBooks.map((book) => (
              <div key={book.id} className="rounded-xl border border-stone-100 bg-stone-50/70 p-3 sm:p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-heading">{book.title}</p>
                    <p className="mt-0.5 truncate text-[10px] text-stone-500">{book.author}</p>
                    <p className="mt-0.5 truncate text-[10px] text-stone-400">{book.seller?.businessName ?? 'Marketplace'}</p>
                  </div>
                  <Badge className={cn(bookStatusClass[book.status], 'shrink-0 px-2 py-0.5 text-[9px] font-bold')}>{book.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="font-display text-base font-bold uppercase text-heading sm:text-xl">Recent Orders</h2>
          <div className="mt-4 space-y-3">
            {data.recentOrders.length ? (
              data.recentOrders.map((order) => (
                <div key={order.id} className="rounded-xl border border-stone-100 bg-stone-50/70 p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-xs font-bold text-heading">#{order.id.slice(-8)}</p>
                      <p className="mt-0.5 text-[10px] text-stone-500">{formatCurrency(order.totalAmount)}</p>
                      <p className="mt-0.5 text-[10px] text-stone-400">{formatDate(order.createdAt)}</p>
                    </div>
                    <OrderStatusBadge status={order.status} className="shrink-0 px-2 py-0.5 text-[9px] font-bold" />
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="No orders yet" description="Customer orders will appear here." />
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
