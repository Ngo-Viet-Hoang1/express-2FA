import ErrorFallback from '@/components/common/ErrorFallback'
import AdminLayout from '@/components/layouts/AdminLayout'
import AuthLayout from '@/components/layouts/AuthLayout'
import RootLayout from '@/components/layouts/RootLayout'
import AdminLogin from '@/pages/admin/AdminLogin'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import ErrorPage from '@/pages/common/ErrorPage'
import NotFound from '@/pages/common/NotFound'
import { lazy, type JSX } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { createBrowserRouter, Navigate } from 'react-router'
import ProtectedRoute from './ProtectedRoute'

const Home = lazy(() => import('@/pages/common/Home'))
const About = lazy(() => import('@/pages/user/About'))
const Dashboard = lazy(() => import('@/pages/user/Dashboard'))

const withErrorBoundary = (
  Component: React.LazyExoticComponent<() => JSX.Element>,
  customFallback?: React.ComponentType<any>,
) => (
  <ErrorBoundary
    FallbackComponent={customFallback || ErrorFallback}
    onError={(_error, _errorInfo) => {}}
    onReset={() => {
      window.location.reload()
    }}
  >
    <Component />
  </ErrorBoundary>
)

const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: withErrorBoundary(Home),
      },
      {
        path: 'about',
        element: <About />,
      },
      {
        element: <ProtectedRoute isAllowed redirectPath="/" />,
        children: [
          {
            path: 'dashboard',
            element: <Dashboard />,
          },
        ],
      },
    ],
  },
  {
    path: '/auth',
    Component: AuthLayout,
    errorElement: <ErrorPage />,
    children: [
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
    ],
  },
  {
    path: '/admin',
    Component: AdminLayout,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Navigate to="/admin/auth/dashboard" />,
      },
      {
        element: <ProtectedRoute isAllowed redirectPath="/admin" />,
        children: [
          {
            path: 'dashboard',
            element: <Dashboard />,
          },
        ],
      },
    ],
  },
  {
    path: '/admin/auth',
    Component: AuthLayout,
    errorElement: <ErrorPage />,
    children: [
      {
        path: 'login',
        element: <AdminLogin />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
])

export default router
