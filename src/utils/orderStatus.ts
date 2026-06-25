import { OrderStatus } from '@/enums/order-status.enum'

/**
 * A customer may cancel their order only before it has been shipped — that is,
 * while it is still in the CREATED or ACCEPTED stage. Once SHIPPED, DELIVERED
 * or already CANCELLED, cancellation is no longer allowed.
 */
export const CUSTOMER_CANCELLABLE_STATUSES: readonly OrderStatus[] = [
  OrderStatus.CREATED,
  OrderStatus.ACCEPTED,
]

export const isOrderCancellableByCustomer = (status: OrderStatus): boolean =>
  CUSTOMER_CANCELLABLE_STATUSES.includes(status)
