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

const StatCard = ({ label, value, icon: Icon, tone = 'amber' }: { label: string; value: string | number; icon: typeof FiUsers; tone?: 'amber' | 'green' | 'blue' | 'red' }) => {
  const colors = {
    amber: 'bg-amber-100 text-amber-800',
    green: 'bg-emerald-100 text-emerald-800',
    blue: 'bg-blue-100 text-blue-800',
    red: 'bg-red-100 text-red-700',
  }

  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className={`grid h-11 w-11 place-items-center rounded-2xl ${colors[tone]}`}>
        <Icon />
      </div>
      <p className="mt-5 text-sm text-stone-500">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-heading">{value}</p>
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
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] bg-secondary p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Admin Portal</p>
            <h1 className="font-display mt-2 text-3xl font-extrabold uppercase sm:text-4xl">
              Marketplace <span className="text-accent">Dashboard</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
              Review sellers, approve catalog books, and monitor marketplace operations from one simple dashboard.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/admin/sellers" className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-hover">
              Review sellers
            </Link>
            <Link to="/admin/books" className="inline-flex h-11 items-center rounded-full bg-white/10 px-5 text-sm font-semibold text-white transition hover:bg-white/15">
              Review books
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total sellers" value={data.totalSellers} icon={FiPackage} />
        <StatCard label="Pending sellers" value={data.pendingSellers} icon={FiClock} tone="red" />
        <StatCard label="Total customers" value={data.totalCustomers} icon={FiUsers} tone="blue" />
        <StatCard label="Total books" value={data.totalBooks} icon={FiBookOpen} />
        <StatCard label="Pending books" value={data.pendingBooks} icon={FiPackage} tone="red" />
        <StatCard label="Total orders" value={data.totalOrders} icon={FiShoppingBag} tone="blue" />
        <StatCard label="Marketplace revenue" value={formatCurrency(data.marketplaceRevenue)} icon={FiCheckCircle} tone="green" />
        <StatCard label="Out of stock listings" value={data.outOfStockListings} icon={FiXCircle} tone="red" />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-extrabold uppercase text-heading">Recent Sellers</h2>
            <Link to="/admin/sellers" className="text-sm font-semibold text-primary hover:text-primary-hover">View all</Link>
          </div>
          <div className="mt-4 space-y-3">
            {data.recentSellers.map((seller) => (
              <div key={seller.id} className="rounded-2xl border border-stone-100 bg-stone-50/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-sm font-bold text-heading">{seller.businessName}</p>
                    <p className="mt-1 text-xs text-stone-500">{seller.email} · {formatDate(seller.createdAt)}</p>
                  </div>
                  <Badge className={sellerStatusClass[seller.status]}>{seller.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-extrabold uppercase text-heading">Recent Books</h2>
            <Link to="/admin/books" className="text-sm font-semibold text-primary hover:text-primary-hover">View all</Link>
          </div>
          <div className="mt-4 space-y-3">
            {data.recentBooks.map((book) => (
              <div key={book.id} className="rounded-2xl border border-stone-100 bg-stone-50/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-sm font-bold text-heading">{book.title}</p>
                    <p className="mt-1 text-xs text-stone-500">{book.author} · {book.seller?.businessName ?? 'Marketplace'}</p>
                  </div>
                  <Badge className={bookStatusClass[book.status]}>{book.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-xl font-extrabold uppercase text-heading">Recent Orders</h2>
          <div className="mt-4 space-y-3">
            {data.recentOrders.length ? (
              data.recentOrders.map((order) => (
                <div key={order.id} className="rounded-2xl border border-stone-100 bg-stone-50/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-sm font-bold text-heading">#{order.id.slice(-10)}</p>
                      <p className="mt-1 text-xs text-stone-500">{formatDate(order.createdAt)} · {formatCurrency(order.totalAmount)}</p>
                    </div>
                    <OrderStatusBadge status={order.status} />
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
