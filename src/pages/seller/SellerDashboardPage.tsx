import { Link } from 'react-router-dom'
import { FiAlertTriangle, FiBookOpen, FiBox, FiClock, FiPlus, FiShoppingBag, FiTrendingUp } from 'react-icons/fi'
import { EmptyState } from '@/components/common/EmptyState'
import { Loader } from '@/components/common/Loader'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { useSellerDashboard } from '@/hooks/useSeller'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'

const StatCard = ({ label, value, icon: Icon, tone = 'amber' }: { label: string; value: string | number; icon: typeof FiBookOpen; tone?: 'amber' | 'green' | 'blue' | 'red' }) => {
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
      <p className="mt-1 text-2xl font-extrabold text-[#16243d]">{value}</p>
    </div>
  )
}

export const SellerDashboardPage = () => {
  const { data, isLoading, isError } = useSellerDashboard()

  if (isLoading) return <Loader />
  if (isError || !data) return <EmptyState title="Could not load seller dashboard" description="Make sure the JSON server is running." />

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] bg-[#0d2b1f] p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Seller Portal</p>
            <h1 className="font-display mt-2 text-3xl font-extrabold uppercase sm:text-4xl">
              Dashboard <span className="text-[#f5862e]">Overview</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
              Manage seller-specific listings, inventory, and order processing as required by the marketplace flow.
            </p>
          </div>
          <Link
            to="/seller/listings"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[#f0532d] px-5 text-sm font-semibold text-white transition hover:bg-[#d8431f]"
          >
            <FiPlus /> Add listing
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total listings" value={data.totalListings} icon={FiBookOpen} />
        <StatCard label="Active listings" value={data.activeListings} icon={FiBox} tone="green" />
        <StatCard label="Total stock" value={data.totalStock} icon={FiTrendingUp} tone="blue" />
        <StatCard label="Low stock alerts" value={data.lowStockCount} icon={FiAlertTriangle} tone="red" />
        <StatCard label="Order lines" value={data.totalOrders} icon={FiShoppingBag} />
        <StatCard label="New orders" value={data.createdOrders} icon={FiClock} tone="blue" />
        <StatCard label="Pending book approvals" value={data.pendingBooks} icon={FiBookOpen} tone="amber" />
        <StatCard label="Delivered revenue" value={formatCurrency(data.revenue)} icon={FiTrendingUp} tone="green" />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-extrabold uppercase text-[#16243d]">Recent Orders</h2>
            <Link to="/seller/orders" className="text-sm font-semibold text-[#f0532d] hover:text-[#d8431f]">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {data.recentOrders.length ? (
              data.recentOrders.map((item) => (
                <div key={item.id} className="rounded-2xl border border-stone-100 bg-stone-50/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="line-clamp-1 text-sm font-bold text-[#16243d]">{item.bookTitle}</p>
                      <p className="mt-1 text-xs text-stone-500">
                        #{item.orderId.slice(-8)} · Qty {item.quantity} · {formatDate(item.createdAt)}
                      </p>
                    </div>
                    <OrderStatusBadge status={item.status} />
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="No seller orders yet" description="Orders for your listings will appear here." />
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-extrabold uppercase text-[#16243d]">Inventory Alerts</h2>
            <Link to="/seller/listings" className="text-sm font-semibold text-[#f0532d] hover:text-[#d8431f]">
              Manage stock
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {data.lowStockListings.length ? (
              data.lowStockListings.map((listing) => (
                <div key={listing.id} className="flex items-center justify-between gap-4 rounded-2xl border border-stone-100 bg-stone-50/70 p-4">
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-sm font-bold text-[#16243d]">{listing.book.title}</p>
                    <p className="mt-1 text-xs text-stone-500">{listing.stock === 0 ? 'Out of stock' : `Only ${listing.stock} left`}</p>
                  </div>
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">Stock {listing.stock}</span>
                </div>
              ))
            ) : (
              <EmptyState title="Inventory looks healthy" description="No low-stock listing found." />
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
