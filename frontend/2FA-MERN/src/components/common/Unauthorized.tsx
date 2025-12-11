import { Link, useNavigate } from 'react-router-dom'

export default function Unauthorized() {
  const navigate = useNavigate()

  return (
    <div className="text-center">
      <h1>403 - Unauthorized</h1>
      <p>Sorry, you are not authorized to access this page.</p>
      <div className="mt-5">
        <button onClick={() => navigate(-1)} className="mr-2">
          Go Back
        </button>
        <Link to="/">Back to home</Link>
      </div>
    </div>
  )
}
