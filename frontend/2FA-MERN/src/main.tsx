import ErrorFallback from '@/components/common/ErrorFallback.tsx'
import { StrictMode, type ErrorInfo } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(_error: Error, _info: ErrorInfo) => {}}
      onReset={() => {}}
    >
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
