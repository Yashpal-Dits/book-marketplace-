import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import { CustomerLayout } from '@/layouts/CustomerLayout'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { Role } from '@/enums/role.enum'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { SellerRegisterPage } from '@/pages/auth/SellerRegisterPage'
import { UnauthorizedPage } from '@/pages/auth/UnauthorizedPage'
import { HomePage } from '@/pages/customer/HomePage'
import { BooksPage } from '@/pages/customer/BooksPage'
import { BookDetailsPage } from '@/pages/customer/BookDetailsPage'
import { CartPage } from '@/pages/customer/CartPage'
import { OrdersPage } from '@/pages/customer/OrdersPage'

export const AppRoutes = () => {
  return (
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
  )
}
