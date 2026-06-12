import { Link } from 'react-router-dom'
import { FiMapPin, FiShoppingBag } from 'react-icons/fi'
import { FaStore } from 'react-icons/fa'
import { EmptyState } from '@/components/common/EmptyState'
import { Loader } from '@/components/common/Loader'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { OrderStatusTracker } from '@/components/orders/OrderStatusTracker'
import { useOrders } from '@/hooks/useOrders'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'

export const OrdersPage = () => {
  const { data: orders = [], isLoading, isError } = useOrders()

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-extrabold uppercase text-[#16243d] sm:text-4xl">
        My <span className="text-[#f0532d]">Orders</span>
      </h1>
      <p className="mt-1 text-sm text-stone-500">Track every order and its current status.</p>

      <div className="mt-8 space-y-6">
        {isLoading ? (
          <Loader />
        ) : isError ? (
          <EmptyState title="Could not load orders" description="Make sure the JSON server is running on port 4000." />
        ) : orders.length === 0 ? (
          <>
            <EmptyState title="No orders yet" description="Your placed orders and their tracking status will appear here." />
            <div className="text-center">
              <Link
                to="/books"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[#f0532d] px-6 text-sm font-semibold text-white transition hover:bg-[#d8431f]"
              >
                <FiShoppingBag /> Start Shopping
              </Link>
            </div>
          </>
        ) : (
          orders.map((order) => (
            <article key={order.id} className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
              {/* header */}
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 bg-stone-50/70 px-5 py-3.5">
                <div>
                  <p className="text-xs text-stone-500">
                    Order <span className="font-mono font-semibold text-stone-700">#{order.id.slice(-10)}</span> · Placed on{' '}
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[#16243d]">{formatCurrency(order.totalAmount)}</span>
                  <OrderStatusBadge status={order.status} />
                </div>
              </header>

              {/* tracker */}
              <div className="px-5 pt-5">
                <OrderStatusTracker status={order.status} />
              </div>

              {/* items */}
              <ul className="divide-y divide-stone-100 px-5 py-3">
                {order.items.map((item) => (
                  <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <div className="min-w-0">
                      <Link to={`/books/${item.bookId}`} className="line-clamp-1 text-sm font-semibold text-[#16243d] hover:text-[#f0532d]">
                        {item.bookTitle}
                      </Link>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-stone-500">
                        <FaStore className="text-[#f0532d]" /> {item.sellerName} · Qty {item.quantity} ×{' '}
                        {formatCurrency(item.priceAtPurchase)}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-[#16243d]">{formatCurrency(item.subtotal)}</span>
                  </li>
                ))}
              </ul>

              {/* shipping address */}
              <footer className="flex items-start gap-2 border-t border-stone-100 bg-stone-50/70 px-5 py-3 text-xs text-stone-600">
                <FiMapPin className="mt-0.5 shrink-0 text-[#f0532d]" />
                <span>
                  <span className="font-semibold">{order.shippingAddress.fullName}</span> · {order.shippingAddress.addressLine},{' '}
                  {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode} ·{' '}
                  {order.shippingAddress.mobileNumber}
                </span>
              </footer>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
