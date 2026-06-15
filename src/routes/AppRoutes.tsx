import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import { CustomerLayout } from '@/layouts/CustomerLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { Loader } from '@/components/common/Loader'
import { Role } from '@/enums/role.enum'
// HomePage stays eager — it is the landing/LCP route and should not wait
// for an extra lazy-chunk request.
import { HomePage } from '@/pages/customer/HomePage'

// All other routes are code-split so the landing page downloads less JS.
const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })))
const SellerRegisterPage = lazy(() =>
  import('@/pages/auth/SellerRegisterPage').then((m) => ({ default: m.SellerRegisterPage })),
)
const UnauthorizedPage = lazy(() =>
  import('@/pages/auth/UnauthorizedPage').then((m) => ({ default: m.UnauthorizedPage })),
)
const BooksPage = lazy(() => import('@/pages/customer/BooksPage').then((m) => ({ default: m.BooksPage })))
const BookDetailsPage = lazy(() =>
  import('@/pages/customer/BookDetailsPage').then((m) => ({ default: m.BookDetailsPage })),
)
const CartPage = lazy(() => import('@/pages/customer/CartPage').then((m) => ({ default: m.CartPage })))
const OrdersPage = lazy(() => import('@/pages/customer/OrdersPage').then((m) => ({ default: m.OrdersPage })))
const ProfilePage = lazy(() => import('@/pages/customer/ProfilePage').then((m) => ({ default: m.ProfilePage })))
const SellerDashboardPage = lazy(() =>
  import('@/pages/seller/SellerDashboardPage').then((m) => ({ default: m.SellerDashboardPage })),
)
const SellerListingsPage = lazy(() =>
  import('@/pages/seller/SellerListingsPage').then((m) => ({ default: m.SellerListingsPage })),
)
const SellerOrdersPage = lazy(() =>
  import('@/pages/seller/SellerOrdersPage').then((m) => ({ default: m.SellerOrdersPage })),
)
const SellerProfilePage = lazy(() =>
  import('@/pages/seller/SellerProfilePage').then((m) => ({ default: m.SellerProfilePage })),
)
const SellerPendingApprovalPage = lazy(() =>
  import('@/pages/seller/SellerPendingApprovalPage').then((m) => ({ default: m.SellerPendingApprovalPage })),
)
const AdminDashboardPage = lazy(() =>
  import('@/pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })),
)
const SellerApprovalPage = lazy(() =>
  import('@/pages/admin/SellerApprovalPage').then((m) => ({ default: m.SellerApprovalPage })),
)
const BookApprovalPage = lazy(() =>
  import('@/pages/admin/BookApprovalPage').then((m) => ({ default: m.BookApprovalPage })),
)
const AdminProfilePage = lazy(() =>
  import('@/pages/admin/AdminProfilePage').then((m) => ({ default: m.AdminProfilePage })),
)

export const AppRoutes = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route element={<CustomerLayout />}>
          <Route index element={<HomePage />} />
          <Route path="books" element={<BooksPage />} />
          <Route path="books/:id" element={<BookDetailsPage />} />
          <Route
            path="cart"
            element={
              <ProtectedRoute allowedRoles={[Role.CUSTOMER]}>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="orders"
            element={
              <ProtectedRoute allowedRoles={[Role.CUSTOMER]}>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route path="profile" element={<Navigate to="/customer/profile" replace />} />
          <Route
            path="customer/profile"
            element={
              <ProtectedRoute allowedRoles={[Role.CUSTOMER]}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="seller/profile"
            element={
              <ProtectedRoute allowedRoles={[Role.SELLER]}>
                <SellerProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/profile"
            element={
              <ProtectedRoute allowedRoles={[Role.ADMIN]}>
                <AdminProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="unauthorized" element={<UnauthorizedPage />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="seller-register" element={<SellerRegisterPage />} />
        </Route>

        <Route
          path="seller/pending-approval"
          element={
            <ProtectedRoute allowedRoles={[Role.SELLER]}>
              <SellerPendingApprovalPage />
            </ProtectedRoute>
          }
        />

        <Route
          element={
            <ProtectedRoute allowedRoles={[Role.SELLER, Role.ADMIN]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="seller">
            <Route index element={<Navigate to="/seller/dashboard" replace />} />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute allowedRoles={[Role.SELLER, Role.ADMIN]} requireApprovedSeller>
                  <SellerDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="listings"
              element={
                <ProtectedRoute allowedRoles={[Role.SELLER, Role.ADMIN]} requireApprovedSeller>
                  <SellerListingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="orders"
              element={
                <ProtectedRoute allowedRoles={[Role.SELLER, Role.ADMIN]} requireApprovedSeller>
                  <SellerOrdersPage />
                </ProtectedRoute>
              }
            />

          </Route>

          <Route path="admin">
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute allowedRoles={[Role.ADMIN]}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="sellers"
              element={
                <ProtectedRoute allowedRoles={[Role.ADMIN]}>
                  <SellerApprovalPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="books"
              element={
                <ProtectedRoute allowedRoles={[Role.ADMIN]}>
                  <BookApprovalPage />
                </ProtectedRoute>
              }
            />

          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
