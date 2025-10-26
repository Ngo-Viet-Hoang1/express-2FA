import { Link, useRouteError } from 'react-router-dom'

const ErrorPage = () => {
  const error = useRouteError() as { statusText?: string; message?: string }

  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-4">
      <h1 className="text-5xl font-bold">Oops!</h1>
      <p className="text-2xl font-semibold">Something went wrong</p>
      <p className="text-red-500">
        <i>{error.statusText ?? error.message}</i>
      </p>
      <Link to="/">Go back home</Link>
    </div>
  )
}

export default ErrorPage
