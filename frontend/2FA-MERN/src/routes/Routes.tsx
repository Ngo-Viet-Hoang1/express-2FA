import RootLayout from '@/components/layouts/RootLayout'
import ErrorPage from '@/pages/common/ErrorPage'
import NotFound from '@/pages/common/NotFound'
import { lazy } from 'react'
import { createBrowserRouter } from 'react-router'
import ProtectedRoute from './ProtectedRoute'

const Home = lazy(() => import('@/pages/common/Home'))
const About = lazy(() => import('@/pages/user/About'))
const Dashboard = lazy(() => import('@/pages/user/Dashboard'))

const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Home />,
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
