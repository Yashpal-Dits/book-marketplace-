import { useState } from 'react'
import { useAdminCustomers, useUpdateCustomerStatus } from '@/hooks/useAdmin'
import { useAdminCustomerFilterStore } from '@/store/adminFilter.store'
import { useDebounce } from '@/hooks/useDebounce'
import { CustomerStatus } from '@/enums/customer-status.enum'
import { formatDate } from '@/utils/formatDate'
import { cn } from '@/utils/cn'
import { Loader } from '@/components/common/Loader'
import { EmptyState } from '@/components/common/EmptyState'
import { Pagination } from '@/components/common/Pagination'
import type { AdminCustomerDetailed } from '@/interfaces'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import toast from 'react-hot-toast'
import {
    FiSearch,
    FiChevronDown,
    FiCheck,
    FiXCircle,
    FiUser,
    FiMoreVertical,
    FiUserCheck
} from 'react-icons/fi'


const PAGE_SIZE = 10

const statusClass: Record<CustomerStatus, string> = {
    [CustomerStatus.ACTIVE]: 'bg-emerald-100 text-emerald-800',
    [CustomerStatus.INACTIVE]: 'bg-stone-200 text-stone-700',
    [CustomerStatus.BLOCKED]: 'bg-red-100 text-red-700',
}

const statusLabel: Record<CustomerStatus, string> = {
    [CustomerStatus.ACTIVE]: 'Active',
    [CustomerStatus.INACTIVE]: 'Inactive',
    [CustomerStatus.BLOCKED]: 'Blocked',
}

const getInitials = (firstName: string, lastName?: string) => {
    const name = `${firstName || ''} ${lastName || ''}`.trim()
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
}

type ActionButtonProps = {
    currentStatus: CustomerStatus
    targetStatus: CustomerStatus
    icon: typeof FiCheck
    label: string
    className: string
    onClick: () => void
    disabled: boolean
}

const ActionButton = ({
    currentStatus,
    targetStatus,
    icon: Icon,
    label,
    className,
    onClick,
    disabled,
}: ActionButtonProps) => {
    const isCurrent = currentStatus === targetStatus

    return (
        <button
            type="button"
            disabled={isCurrent || disabled}
            onClick={onClick}
            className={cn(
                'inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50',
                className,
            )}
        >
            <Icon /> {label}
        </button>
    )
}

const MobileCustomerCard = ({
    customer,
    disabled,
    onStatusChange,
    onImpersonate,
}: {
    customer: AdminCustomerDetailed
    disabled: boolean
    onStatusChange: (customerId: string, status: CustomerStatus) => void
    onImpersonate: (customer: AdminCustomerDetailed) => void
}) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-amber-100 text-sm font-bold text-amber-800">
                    {customer.profileImage ? (
                        <img src={customer.profileImage} alt="" className="h-full w-full object-cover" />
                    ) : (
                        getInitials(customer.firstName, customer.lastName) || <FiUser />
                    )}
                </span>
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <p className="line-clamp-1 text-sm font-bold text-[#16243d]">
                                {customer.firstName} {customer.lastName}
                            </p>
                            <p className="text-xs text-stone-500">{customer.email}</p>
                        </div>
                        <span
                            className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium', statusClass[customer.status])}
                        >
                            {statusLabel[customer.status]}
                        </span>
                    </div>
                    <p className="mt-2 text-xs text-stone-500">Mobile: {customer.mobileNumber || '—'}</p>
                    <p className="text-xs text-stone-500">Orders: {customer.ordersCount}</p>
                    <p className="text-xs text-stone-500">Joined: {formatDate(customer.createdAt)}</p>

                    <div className="relative mt-3">
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={() => setIsOpen((v) => !v)}
                            className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-full bg-stone-100 text-xs font-semibold text-stone-700 transition hover:bg-stone-200 disabled:opacity-50"
                        >
                            <FiMoreVertical /> Actions
                        </button>
                        {isOpen ? (
                            <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-xl border border-stone-200 bg-white py-1 shadow-lg">
                                {[
                                    { status: CustomerStatus.ACTIVE, label: 'Activate', className: 'text-emerald-700' },
                                    { status: CustomerStatus.BLOCKED, label: 'Block', className: 'text-red-700' },
                                    { status: CustomerStatus.INACTIVE, label: 'Inactive', className: 'text-stone-700' },
                                ].map((option) => (
                                    <button
                                        key={option.status}
                                        type="button"
                                        disabled={customer.status === option.status || disabled}
                                        onClick={() => {
                                            onStatusChange(customer.id, option.status)
                                            setIsOpen(false)
                                        }}
                                        className={cn(
                                            'block w-full px-3 py-2 text-left text-xs font-medium transition hover:bg-stone-50 disabled:opacity-50',
                                            option.className,
                                        )}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                                <div className="my-1 border-t border-stone-100" />
                                <button
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => {
                                        onImpersonate(customer)
                                        setIsOpen(false)
                                    }}
                                    className="block w-full px-3 py-2 text-left text-xs font-medium text-amber-700 transition hover:bg-stone-50 disabled:opacity-50"
                                >
                                    Impersonate User
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    )
}

export const CustomerManagementPage = () => {
    const { search, status, page, setSearch, setStatus, setPage } = useAdminCustomerFilterStore()
    const debouncedSearch = useDebounce(search, 350)
    const { data, isLoading, isError } = useAdminCustomers({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch,
        status: status || undefined,
    })
    const updateStatus = useUpdateCustomerStatus()
    const { startCustomerImpersonation } = useAuthStore()
    const navigate = useNavigate()
    const totalPages = Math.ceil((data?.total ?? 0) / PAGE_SIZE)

    const startEntry = data?.total ? (page - 1) * PAGE_SIZE + 1 : 0
    const endEntry = data ? Math.min(page * PAGE_SIZE, data.total) : 0

    const handleStatusChange = (customerId: string, status: CustomerStatus) => {
        updateStatus.mutate({ customerId, status })
    }

    const handleImpersonate = (customer: AdminCustomerDetailed) => {
        startCustomerImpersonation({
            id: customer.id,
            name: `${customer.firstName} ${customer.lastName}`,
        })
        toast.success(`Now impersonating ${customer.firstName} ${customer.lastName}`)
        navigate('/')
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <section className="rounded-[2rem] bg-white p-5 shadow-sm sm:p-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f0532d]">User Management</p>
                <h1 className="font-display mt-1 text-2xl font-extrabold uppercase text-[#16243d] sm:text-3xl">
                    Manage Customers
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-stone-500">
                    View registered customers, track their orders, and manage their account status.
                </p>
            </section>

            {/* Toolbar */}
            <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:max-w-md">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by name, email or mobile..."
                        className="h-11 w-full rounded-full border border-stone-200 bg-white pl-11 pr-4 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-[#f0532d] focus:ring-4 focus:ring-orange-500/10"
                    />
                </div>

                <div className="relative w-full sm:w-44 md:w-auto">
                    <select
                        value={status}
                        onChange={(event) => setStatus(event.target.value as CustomerStatus | '')}
                        className="h-11 w-full cursor-pointer appearance-none rounded-full border border-stone-200 bg-white pl-4 pr-9 text-sm font-medium text-stone-700 outline-none transition focus:border-[#f0532d]"
                    >
                        <option value="">All Status</option>
                        <option value={CustomerStatus.ACTIVE}>Active</option>
                        <option value={CustomerStatus.INACTIVE}>Inactive</option>
                        <option value={CustomerStatus.BLOCKED}>Blocked</option>
                    </select>
                    <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-500" />
                </div>
            </section>

            {/* Loading / Error */}
            {isLoading ? (
                <div className="rounded-3xl border border-stone-200 bg-white p-10 shadow-sm">
                    <Loader />
                </div>
            ) : isError ? (
                <div className="rounded-3xl border border-stone-200 bg-white p-10 shadow-sm">
                    <EmptyState title="Could not load customers" description="Make sure JSON Server is running." />
                </div>
            ) : !data?.data.length ? (
                <div className="rounded-3xl border border-stone-200 bg-white p-10 shadow-sm">
                    <EmptyState title="No customers found" description="Try changing the search or filter." />
                </div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <section className="hidden overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm sm:block">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-stone-100 bg-stone-50/80 text-xs font-bold uppercase tracking-wide text-stone-500">
                                        <th className="px-5 py-4">Customer</th>
                                        <th className="px-5 py-4">Contact</th>
                                        <th className="px-5 py-4">Orders</th>
                                        <th className="px-5 py-4">Joined</th>
                                        <th className="px-5 py-4">Status</th>
                                        <th className="px-5 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.data.map((customer) => (
                                        <tr
                                            key={customer.id}
                                            className={cn(
                                                'border-b border-stone-100 transition last:border-b-0 hover:bg-stone-50/60',
                                                customer.status === CustomerStatus.BLOCKED && 'bg-red-50/40',
                                            )}
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-amber-100 text-sm font-bold text-amber-800">
                                                        {customer.profileImage ? (
                                                            <img src={customer.profileImage} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            getInitials(customer.firstName, customer.lastName) || <FiUser />
                                                        )}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="line-clamp-1 text-sm font-bold text-[#16243d]">
                                                            {customer.firstName} {customer.lastName}
                                                        </p>
                                                        <p className="text-xs text-stone-500">{customer.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-xs text-stone-600">{customer.mobileNumber || '—'}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-sm font-semibold text-[#16243d]">{customer.ordersCount}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-xs text-stone-500">{formatDate(customer.createdAt)}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={cn('rounded-full px-3 py-1 text-xs font-medium', statusClass[customer.status])}>
                                                    {statusLabel[customer.status]}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <ActionButton
                                                        currentStatus={customer.status}
                                                        targetStatus={CustomerStatus.ACTIVE}
                                                        icon={FiCheck}
                                                        label="Activate"
                                                        className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                                        onClick={() => handleStatusChange(customer.id, CustomerStatus.ACTIVE)}
                                                        disabled={updateStatus.isPending}
                                                    />
                                                    <ActionButton
                                                        currentStatus={customer.status}
                                                        targetStatus={CustomerStatus.BLOCKED}
                                                        icon={FiXCircle}
                                                        label="Block"
                                                        className="bg-red-100 text-red-700 hover:bg-red-200"
                                                        onClick={() => handleStatusChange(customer.id, CustomerStatus.BLOCKED)}
                                                        disabled={updateStatus.isPending}
                                                    />
                                                    <ActionButton
                                                        currentStatus={customer.status}
                                                        targetStatus={CustomerStatus.INACTIVE}
                                                        icon={FiXCircle}
                                                        label="Inactive"
                                                        className="bg-stone-100 text-stone-700 hover:bg-stone-200"
                                                        onClick={() => handleStatusChange(customer.id, CustomerStatus.INACTIVE)}
                                                        disabled={updateStatus.isPending}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleImpersonate(customer)}
                                                        className="inline-flex h-8 items-center gap-1.5 rounded-full bg-amber-100 px-3 text-xs font-semibold text-amber-800 transition hover:bg-amber-200"
                                                    >
                                                        <FiUserCheck /> Impersonate
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Mobile Cards */}
                    <section className="space-y-3 sm:hidden">
                        {data.data.map((customer) => (
                            <MobileCustomerCard
                                key={customer.id}
                                customer={customer}
                                disabled={updateStatus.isPending}
                                onStatusChange={handleStatusChange}
                                onImpersonate={handleImpersonate}
                            />
                        ))}
                    </section>
                </>
            )}

            {/* Footer pagination */}
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <p className="text-center text-sm text-stone-500 sm:text-left">
                    Showing <span className="font-semibold text-stone-700">{startEntry}</span>–
                    <span className="font-semibold text-stone-700">{endEntry}</span> of{' '}
                    <span className="font-semibold text-stone-700">{data?.total ?? 0}</span> customers
                </p>
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
        </div>
    )
}
