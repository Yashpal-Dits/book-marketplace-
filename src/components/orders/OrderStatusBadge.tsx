import { OrderStatus } from '@/enums/order-status.enum'
import { Badge } from '@/components/common/Badge'

const statusStyles: Record<OrderStatus, string> = {
  [OrderStatus.CREATED]: 'bg-blue-100 text-blue-800',
  [OrderStatus.ACCEPTED]: 'bg-amber-100 text-amber-800',
  [OrderStatus.SHIPPED]: 'bg-purple-100 text-purple-800',
  [OrderStatus.DELIVERED]: 'bg-emerald-100 text-emerald-800',
  [OrderStatus.CANCELLED]: 'bg-red-100 text-red-700',
}

const statusLabels: Record<OrderStatus, string> = {
  [OrderStatus.CREATED]: 'Created',
  [OrderStatus.ACCEPTED]: 'Accepted',
  [OrderStatus.SHIPPED]: 'Shipped',
  [OrderStatus.DELIVERED]: 'Delivered',
  [OrderStatus.CANCELLED]: 'Cancelled',
}

export const OrderStatusBadge = ({ status }: { status: OrderStatus }) => (
  <Badge className={statusStyles[status]}>{statusLabels[status]}</Badge>
)
