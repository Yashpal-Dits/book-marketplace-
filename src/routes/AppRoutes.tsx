import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import { CustomerLayout } from '@/layouts/CustomerLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { SellerRegisterPage } from '@/pages/auth/SellerRegisterPage'
import { UnauthorizedPage } from '@/pages/auth/UnauthorizedPage'
import { HomePage } from '@/pages/customer/HomePage'

export const AppRoutes = () => {
  return (
    <Routes>
    
      <Route element={<CustomerLayout />}>
        <Route index element={<HomePage />} />
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