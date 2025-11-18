import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './providers/AuthProvider'
import router from './routes/Routes'

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router}></RouterProvider>
    </AuthProvider>
  )
}

export default App
