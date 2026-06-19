import { FiMapPin, FiSearch, FiTruck } from 'react-icons/fi'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { Loader } from '@/components/common/Loader'
import { Pagination } from '@/components/common/Pagination'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { OrderStatus } from '@/enums/order-status.enum'
import { SellerOrderSort } from '@/enums/seller-sort.enum'
import { useDebounce } from '@/hooks/useDebounce'
import { useSellerOrders, useUpdateSellerOrderStatus } from '@/hooks/useSeller'
import { useSellerOrderFilterStore } from '@/store/sellerFilter.store'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'

const PAGE_SIZE = 8

const nextStatus = (status: OrderStatus): OrderStatus | null => {
  if (status === OrderStatus.CREATED) return OrderStatus.ACCEPTED
  if (status === OrderStatus.ACCEPTED) return OrderStatus.SHIPPED
  if (status === OrderStatus.SHIPPED) return OrderStatus.DELIVERED
  return null
}

const nextLabel = (status: OrderStatus) => {
  if (status === OrderStatus.CREATED) return 'Accept'
  if (status === OrderStatus.ACCEPTED) return 'Mark shipped'
  if (status === OrderStatus.SHIPPED) return 'Mark delivered'
  return ''
}

export const SellerOrdersPage = () => {
  const { search, sort, status, page, setSearch, setSort, setStatus, setPage } = useSellerOrderFilterStore()
  const debouncedSearch = useDebounce(search, 350)
  const { data, isLoading, isError } = useSellerOrders({ page, limit: PAGE_SIZE, search: debouncedSearch, sort, status })
  const updateStatus = useUpdateSellerOrderStatus()
  const totalPages = Math.ceil((data?.total ?? 0) / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] bg-secondary p-6 text-white shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Seller Orders</p>
        <h1 className="font-display mt-1 text-3xl font-extrabold uppercase sm:text-4xl">
          Process <span className="text-accent">Orders</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
          Each row is an order item for your listing. Move orders through Created → Accepted → Shipped → Delivered, or cancel before shipment.
        </p>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-stone-100 pb-4 xl:flex-row xl:items-center xl:justify-between">
          <label className="relative block xl:w-96">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by book, customer or order id..."
              className="h-11 w-full rounded-full border border-stone-200 bg-stone-50 pl-11 pr-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-orange-500/10"
            />
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as OrderStatus | '')}
              className="h-11 rounded-full border border-stone-200 bg-white px-4 text-sm outline-none focus:border-primary"
            >
              <option value="">All statuses</option>
              <option value={OrderStatus.CREATED}>Created</option>
              <option value={OrderStatus.ACCEPTED}>Accepted</option>
              <option value={OrderStatus.SHIPPED}>Shipped</option>
              <option value={OrderStatus.DELIVERED}>Delivered</option>
              <option value={OrderStatus.CANCELLED}>Cancelled</option>
            </select>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SellerOrderSort)}
              className="h-11 rounded-full border border-stone-200 bg-white px-4 text-sm outline-none focus:border-primary"
            >
              <option value={SellerOrderSort.NEWEST}>Newest</option>
              <option value={SellerOrderSort.OLDEST}>Oldest</option>
              <option value={SellerOrderSort.AMOUNT_HIGH_TO_LOW}>Amount high to low</option>
              <option value={SellerOrderSort.AMOUNT_LOW_TO_HIGH}>Amount low to high</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          {isLoading ? (
            <Loader />
          ) : isError ? (
            <EmptyState title="Could not load seller orders" description="Make sure the JSON server is running." />
          ) : !data?.data.length ? (
            <EmptyState title="No orders found" description="Orders for your seller listings will appear here." />
          ) : (
            <div className="space-y-4">
              {data.data.map((item) => {
                const next = nextStatus(item.status)
                const canCancel = item.status === OrderStatus.CREATED || item.status === OrderStatus.ACCEPTED
                const customerName = item.customer ? `${item.customer.firstName} ${item.customer.lastName}` : item.order.shippingAddress.fullName

                return (
                  <article key={item.id} className="overflow-hidden rounded-2xl border border-stone-200">
                    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 bg-stone-50/70 px-5 py-3">
                      <div>
                        <p className="text-xs text-stone-500">Order item</p>
                        <p className="font-mono text-sm font-bold text-heading">#{item.id.slice(-10)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-heading">{formatCurrency(item.subtotal)}</span>
                        <OrderStatusBadge status={item.status} />
                      </div>
                    </header>

                    <div className="grid gap-4 p-5 lg:grid-cols-[1fr_260px]">
                      <div className="min-w-0">
                        <h3 className="line-clamp-1 text-base font-bold text-heading">{item.bookTitle}</h3>
                        <p className="mt-1 text-sm text-stone-500">
                          Qty {item.quantity} × {formatCurrency(item.priceAtPurchase)} · Ordered {formatDate(item.createdAt)}
                        </p>
                        <p className="mt-2 text-sm font-medium text-stone-700">Customer: {customerName}</p>
                        <p className="mt-2 flex items-start gap-2 text-xs leading-5 text-stone-500">
                          <FiMapPin className="mt-0.5 shrink-0 text-primary" />
                          <span>
                            {item.order.shippingAddress.addressLine}, {item.order.shippingAddress.city}, {item.order.shippingAddress.state} — {item.order.shippingAddress.pincode} · {item.order.shippingAddress.mobileNumber}
                          </span>
                        </p>
                      </div>

                      <div className="flex flex-col justify-center gap-2">
                        {next ? (
                          <Button
                            type="button"
                            onClick={() => updateStatus.mutate({ orderItemId: item.id, status: next })}
                            disabled={updateStatus.isPending}
                            className="gap-2"
                          >
                            <FiTruck /> {nextLabel(item.status)}
                          </Button>
                        ) : null}
                        {canCancel ? (
                          <Button
                            type="button"
                            variant="danger"
                            onClick={() => updateStatus.mutate({ orderItemId: item.id, status: OrderStatus.CANCELLED })}
                            disabled={updateStatus.isPending}
                          >
                            Cancel order
                          </Button>
                        ) : null}
                        {!next && !canCancel ? <p className="text-center text-xs text-stone-500">No further action available</p> : null}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} className="mt-6" />
      </section>
    </div>
  )
}
