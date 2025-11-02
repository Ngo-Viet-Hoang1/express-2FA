import ErrorFallback from '@/components/common/ErrorFallback'
import AdminLayout from '@/components/layouts/AdminLayout'
import AuthLayout from '@/components/layouts/AuthLayout'
import RootLayout from '@/components/layouts/RootLayout'
import { ADMIN_ROUTES, ROUTES } from '@/constants'
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
    path: ROUTES.HOME,
    Component: RootLayout,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: withErrorBoundary(Home),
      },
      {
        path: ROUTES.ABOUT,
        element: <About />,
      },
      {
        element: <ProtectedRoute isAllowed redirectPath="/" />,
        children: [
          {
            path: ROUTES.DASHBOARD,
            element: <Dashboard />,
          },
        ],
      },
    ],
  },
  {
    path: ROUTES.AUTH.ROOT,
    Component: AuthLayout,
    errorElement: <ErrorPage />,
    children: [
      {
        path: ROUTES.AUTH.LOGIN,
        element: <Login />,
      },
      {
        path: ROUTES.AUTH.REGISTER,
        element: <Register />,
      },
    ],
  },
  {
    path: ADMIN_ROUTES.ROOT,
    Component: AdminLayout,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Navigate to={ADMIN_ROUTES.DASHBOARD} />,
      },
      {
        element: <ProtectedRoute isAllowed redirectPath={ADMIN_ROUTES.LOGIN} />,
        children: [
          {
            path: ADMIN_ROUTES.DASHBOARD,
            element: <Dashboard />,
          },
        ],
      },
    ],
  },
  {
    path: ADMIN_ROUTES.AUTH.ROOT,
    Component: AuthLayout,
    errorElement: <ErrorPage />,
    children: [
      {
        path: ADMIN_ROUTES.AUTH.LOGIN,
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
