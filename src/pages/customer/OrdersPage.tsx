import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiMapPin, FiShoppingBag, FiXCircle } from 'react-icons/fi'
import { FaStore } from 'react-icons/fa'
import { BookCover } from '@/components/common/BookCover'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { Loader } from '@/components/common/Loader'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { OrderStatusTracker } from '@/components/orders/OrderStatusTracker'
import { useCancelOrder, useOrders } from '@/hooks/useOrders'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'
import { isOrderCancellableByCustomer } from '@/utils/orderStatus'

export const OrdersPage = () => {
  const { data: orders = [], isLoading, isError } = useOrders()
  const cancelOrder = useCancelOrder()
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const handleCancel = (orderId: string) => {
    cancelOrder.mutate(orderId, { onSettled: () => setConfirmId(null) })
  }

  return (
    <section className="mx-auto max-w-8xl px-4 py-10 sm:px-6 lg:px-8">
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
                  <li key={item.id} className="flex flex-wrap items-center justify-between gap-4 py-3.5">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <BookCover src={item.coverImage} title={item.bookTitle} className="h-16 w-11 shrink-0 rounded shadow-sm object-cover" />
                      <div className="min-w-0">
                        <Link to={`/books/${item.bookId}`} className="line-clamp-1 text-sm font-bold text-[#16243d] hover:text-[#f0532d]">
                          {item.bookTitle}
                        </Link>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                          <FaStore className="text-[#f0532d]" /> {item.sellerName} · Qty {item.quantity} ×{' '}
                          {formatCurrency(item.priceAtPurchase)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-base font-extrabold text-[#16243d]">{formatCurrency(item.subtotal)}</span>
                    </div>
                  </li>
                ))}
              </ul>

              {/* shipping address + cancel action */}
              <footer className="flex flex-wrap items-start justify-between gap-3 border-t border-stone-100 bg-stone-50/70 px-5 py-3 text-xs text-stone-600">
                <div className="flex items-start gap-2 min-w-0">
                  <FiMapPin className="mt-0.5 shrink-0 text-[#f0532d]" />
                  <span>
                    <span className="font-semibold">{order.shippingAddress.fullName}</span> · {order.shippingAddress.addressLine},{' '}
                    {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode} ·{' '}
                    {order.shippingAddress.mobileNumber}
                  </span>
                </div>

                {isOrderCancellableByCustomer(order.status) && (
                  <div className="shrink-0">
                    {confirmId === order.id ? (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-stone-600">Cancel this order?</span>
                        <Button
                          variant="danger"
                          className="h-8 px-3 text-xs"
                          disabled={cancelOrder.isPending}
                          onClick={() => handleCancel(order.id)}
                        >
                          {cancelOrder.isPending ? 'Cancelling…' : 'Yes, cancel'}
                        </Button>
                        <Button
                          variant="secondary"
                          className="h-8 px-3 text-xs"
                          disabled={cancelOrder.isPending}
                          onClick={() => setConfirmId(null)}
                        >
                          Keep order
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        className="h-8 gap-1.5 px-3 text-xs text-red-600 hover:bg-red-50"
                        onClick={() => setConfirmId(order.id)}
                      >
                        <FiXCircle /> Cancel order
                      </Button>
                    )}
                  </div>
                )}
              </footer>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
