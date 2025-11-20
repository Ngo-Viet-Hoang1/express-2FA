import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import router from './routes/Routes'
import useAuthStore from './store/zustand/useAuthStore'

function App() {
  const isInitialzed = useAuthStore((state) => state.isInitialized)
  const initFromStorage = useAuthStore((state) => state.initFromStorage)

  useEffect(() => {
    initFromStorage()
  }, [initFromStorage])

  if (!isInitialzed) {
    return <div>Initializing...</div>
  }

  return <RouterProvider router={router}></RouterProvider>
}

export default App
