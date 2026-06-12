import { FiCheck, FiX } from 'react-icons/fi'
import { OrderStatus } from '@/enums/order-status.enum'
import { cn } from '@/utils/cn'

const TRACK_STEPS = [
  { status: OrderStatus.CREATED, label: 'Created' },
  { status: OrderStatus.ACCEPTED, label: 'Accepted' },
  { status: OrderStatus.SHIPPED, label: 'Shipped' },
  { status: OrderStatus.DELIVERED, label: 'Delivered' },
]

/** Visual progress tracker: Created → Accepted → Shipped → Delivered (or Cancelled). */
export const OrderStatusTracker = ({ status }: { status: OrderStatus }) => {
  if (status === OrderStatus.CANCELLED) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
        <FiX /> This order was cancelled.
      </div>
    )
  }

  const currentIndex = TRACK_STEPS.findIndex((step) => step.status === status)

  return (
    <ol className="flex items-center" aria-label="Order progress">
      {TRACK_STEPS.map((step, index) => {
        const isDone = index <= currentIndex
        const isLast = index === TRACK_STEPS.length - 1
        return (
          <li key={step.status} className={cn('flex items-center', !isLast && 'flex-1')}>
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  'inline-flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold transition',
                  isDone ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-stone-300 bg-white text-stone-400',
                )}
              >
                {isDone ? <FiCheck /> : index + 1}
              </span>
              <span className={cn('mt-1.5 text-[11px] font-medium', isDone ? 'text-emerald-700' : 'text-stone-400')}>
                {step.label}
              </span>
            </div>
            {!isLast ? (
              <span
                className={cn('mx-2 mb-5 h-0.5 flex-1 rounded', index < currentIndex ? 'bg-emerald-600' : 'bg-stone-200')}
                aria-hidden
              />
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
