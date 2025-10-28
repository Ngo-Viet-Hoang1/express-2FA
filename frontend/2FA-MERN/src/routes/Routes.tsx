import ErrorFallback from '@/components/common/ErrorFallback'
import RootLayout from '@/components/layouts/RootLayout'
import ErrorPage from '@/pages/common/ErrorPage'
import NotFound from '@/pages/common/NotFound'
import { lazy, type JSX } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { createBrowserRouter } from 'react-router'
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
    path: '*',
    element: <NotFound />,
  },
])

export default router
