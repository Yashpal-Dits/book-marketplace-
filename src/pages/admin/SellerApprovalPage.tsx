import { useNavigate } from 'react-router-dom'
import { FiCheck, FiEye, FiSearch, FiX } from 'react-icons/fi'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { Loader } from '@/components/common/Loader'
import { Pagination } from '@/components/common/Pagination'
import { AdminSellerSort } from '@/enums/admin-sort.enum'
import { SellerStatus } from '@/enums/seller-status.enum'
import { useAdminSellers, useUpdateSellerStatus } from '@/hooks/useAdmin'
import { useDebounce } from '@/hooks/useDebounce'
import { useAdminSellerFilterStore } from '@/store/adminFilter.store'
import { useAuthStore } from '@/store/auth.store'
import { formatDate } from '@/utils/formatDate'

const PAGE_SIZE = 8

const statusClass: Record<SellerStatus, string> = {
  [SellerStatus.PENDING]: 'bg-amber-100 text-amber-800 ring-1 ring-amber-200',
  [SellerStatus.APPROVED]: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200',
  [SellerStatus.REJECTED]: 'bg-red-100 text-red-700 ring-1 ring-red-200',
}

const statusLabel: Record<SellerStatus, string> = {
  [SellerStatus.PENDING]: 'Pending',
  [SellerStatus.APPROVED]: 'Approved',
  [SellerStatus.REJECTED]: 'Rejected',
}

export const SellerApprovalPage = () => {
  const navigate = useNavigate()
  const startSellerImpersonation = useAuthStore((state) => state.startSellerImpersonation)
  const { search, sort, status, page, setSearch, setSort, setStatus, setPage } = useAdminSellerFilterStore()
  const debouncedSearch = useDebounce(search, 350)
  const { data, isLoading, isError } = useAdminSellers({ page, limit: PAGE_SIZE, search: debouncedSearch, sort, status })
  const updateStatus = useUpdateSellerStatus()
  const totalPages = Math.ceil((data?.total ?? 0) / PAGE_SIZE)

  const handleAccessDashboard = (seller: { id: string; businessName: string }) => {
    startSellerImpersonation(seller)
    navigate('/seller/dashboard')
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] bg-secondary p-6 text-white shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Seller Management</p>
        <h1 className="font-display mt-2 text-3xl font-extrabold uppercase">
          Seller <span className="text-accent">Approval</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
          Admin reviews seller registration requests. Only approved sellers can access seller dashboard and create listings.
        </p>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-stone-100 pb-4 xl:flex-row xl:items-center xl:justify-between">
          <label className="relative block xl:w-96">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search business, contact, email or mobile..."
              className="h-11 w-full rounded-full border border-stone-200 bg-stone-50 pl-11 pr-4 text-sm outline-none focus:border-[#f0532d] focus:ring-4 focus:ring-orange-500/10"
            />
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as SellerStatus | '')}
              className="h-11 rounded-full border border-stone-200 bg-white px-4 text-sm outline-none focus:border-[#f0532d]"
            >
              <option value="">All statuses</option>
              <option value={SellerStatus.PENDING}>Pending</option>
              <option value={SellerStatus.APPROVED}>Approved</option>
              <option value={SellerStatus.REJECTED}>Rejected</option>
            </select>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as AdminSellerSort)}
              className="h-11 rounded-full border border-stone-200 bg-white px-4 text-sm outline-none focus:border-[#f0532d]"
            >
              <option value={AdminSellerSort.NEWEST}>Newest</option>
              <option value={AdminSellerSort.BUSINESS_ASC}>Business A-Z</option>
              <option value={AdminSellerSort.BUSINESS_DESC}>Business Z-A</option>
              <option value={AdminSellerSort.STATUS_ASC}>Status</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          {isLoading ? (
            <Loader />
          ) : isError ? (
            <EmptyState title="Could not load sellers" description="Make sure JSON Server is running." />
          ) : !data?.data.length ? (
            <EmptyState title="No sellers found" description="Try changing the search or filter." />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-stone-200">
              <div className="hidden grid-cols-[1.2fr_1fr_0.8fr_120px_300px] gap-4 bg-stone-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-stone-500 lg:grid">
                <span>Business</span>
                <span>Contact</span>
                <span>Created</span>
                <span>Status</span>
                <span className="text-right">Actions</span>
              </div>
              <div className="divide-y divide-stone-100">
                {data.data.map((seller) => (
                  <article key={seller.id} className="grid gap-4 px-4 py-5 lg:grid-cols-[1.2fr_1fr_0.8fr_120px_300px] lg:items-center lg:py-4">
                    <div className="min-w-0">
                      <p className="line-clamp-1 text-sm font-bold text-[#16243d]">{seller.businessName}</p>
                      <p className="mt-1 text-xs text-stone-500">{seller.email}</p>
                    </div>
                    <div className="text-sm text-stone-700">
                      <p className="font-medium">{seller.contactPerson}</p>
                      <p className="mt-1 text-xs text-stone-500">{seller.mobileNumber}</p>
                    </div>
                    <p className="text-sm text-stone-500">{formatDate(seller.createdAt)}</p>
                    
                    {/* Fixed: Improved status wrapper for mobile spacing */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-50 pt-3 lg:border-none lg:pt-0 lg:block">
                      <span className="text-xs font-semibold uppercase tracking-wide text-stone-400 lg:hidden">Status</span>
                      <Badge className={`${statusClass[seller.status]} whitespace-nowrap px-2.5 py-1 text-[11px] sm:px-3 sm:text-xs`}>
                        {statusLabel[seller.status]}
                      </Badge>
                    </div>

                    {/* Fixed: Actions container with better wrapping and grid for mobile */}
                    <div className="grid grid-cols-1 gap-2 xs:grid-cols-2 lg:flex lg:flex-wrap lg:justify-end">
                      {seller.status === SellerStatus.APPROVED ? (
                        <>
                          <Button
                            type="button"
                            variant="secondary"
                            className="h-9 gap-2 px-3 text-xs justify-center"
                            title="Impersonate this seller and open seller dashboard"
                            onClick={() => handleAccessDashboard(seller)}
                          >
                            <FiEye className="shrink-0" /> <span className="truncate">Impersonate</span>
                          </Button>
                          <Button
                            type="button"
                            variant="danger"
                            className="h-9 gap-2 px-3 text-xs justify-center"
                            disabled={updateStatus.isPending}
                            onClick={() => updateStatus.mutate({ sellerId: seller.id, status: SellerStatus.REJECTED })}
                          >
                            <FiX className="shrink-0" /> Reject
                          </Button>
                        </>
                      ) : null}

                      {seller.status === SellerStatus.PENDING ? (
                        <>
                          <Button
                            type="button"
                            className="h-9 gap-2 bg-emerald-700 px-3 text-xs hover:bg-emerald-800 justify-center"
                            disabled={updateStatus.isPending}
                            onClick={() => updateStatus.mutate({ sellerId: seller.id, status: SellerStatus.APPROVED })}
                          >
                            <FiCheck className="shrink-0" /> Approve
                          </Button>
                          <Button
                            type="button"
                            variant="danger"
                            className="h-9 gap-2 px-3 text-xs justify-center"
                            disabled={updateStatus.isPending}
                            onClick={() => updateStatus.mutate({ sellerId: seller.id, status: SellerStatus.REJECTED })}
                          >
                            <FiX className="shrink-0" /> Reject
                          </Button>
                        </>
                      ) : null}

                      {seller.status === SellerStatus.REJECTED ? (
                        <Button
                          type="button"
                          className="h-9 gap-2 bg-emerald-700 px-3 text-xs hover:bg-emerald-800 justify-center xs:col-span-2 lg:col-span-1"
                          disabled={updateStatus.isPending}
                          onClick={() => updateStatus.mutate({ sellerId: seller.id, status: SellerStatus.APPROVED })}
                        >
                          <FiCheck className="shrink-0" /> Approve Again
                        </Button>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} className="mt-6" />
      </section>
    </div>
  )
}
