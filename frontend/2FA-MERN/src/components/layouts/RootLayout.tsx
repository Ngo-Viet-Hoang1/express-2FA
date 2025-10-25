import { Suspense } from 'react'
import { Link, Outlet, useNavigation } from 'react-router-dom'
import LoadingBar from '../common/LoadingBar'
import NavLink from '../common/NavLink'

export default function RootLayout() {
  const navigation = useNavigation()
  const isLoading = navigation.state === 'loading'

  return (
    <div className="flex min-h-dvh w-full flex-col">
      {isLoading && <LoadingBar />}

      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur-sm">
        <nav className="container mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/" className="text-xl font-bold">
            Twiliver
          </Link>

          <div className="flex gap-2">
            <NavLink to="/about">About</NavLink>
            <NavLink to="/dashboard">Dashboard</NavLink>
          </div>
        </nav>
      </header>

      <main className="container mx-auto flex flex-1 flex-col px-4 py-6">
        <Suspense
          fallback={
            <div className="flex flex-1 items-center justify-center">
              <div className="text-gray-500">Loading...</div>
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>

      <footer className="border-t text-center text-sm text-gray-600">
        © {new Date().getFullYear()} Twiliver. All rights reserved.
      </footer>
    </div>
  )
}
