import { Link, useLocation } from 'react-router-dom'

interface NavLinkProps {
  to: string
  children: React.ReactNode
  className?: string
  activeClassName?: string
}

const NavLink = ({
  to,
  children,
  className = '',
  activeClassName = 'bg-blue-500 text-white',
}: NavLinkProps) => {
  const location = useLocation()
  const isActive = location.pathname === to

  const baseClass = 'rounded-md px-3 py-2 transition-colors'
  const defaultClass = 'text-gray-700 hover:bg-gray-100'

  return (
    <Link
      to={to}
      className={`${baseClass} ${
        isActive ? activeClassName : defaultClass
      } ${className}`}
    >
      {children}
    </Link>
  )
}

export default NavLink
