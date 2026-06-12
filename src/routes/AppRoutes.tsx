import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import { CustomerLayout } from '@/layouts/CustomerLayout'
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
          <Route path="unauthorized" element={<UnauthorizedPage />} />
        </Route>

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="seller-register" element={<SellerRegisterPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
