
import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Category', path: '/categories' },
  { label: 'Dish', path: '/dishes' },
  { label: 'Order', path: '/orders' },
]

export default function Navbar() {
  const location = useLocation()

  return (
    <nav className="bg-gray-800 text-white px-6 py-3 flex justify-between items-center">
      <h1 className="text-lg font-bold">🍕 Order Eat Admin</h1>
      <ul className="flex space-x-6">
        {navItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={`hover:underline ${
                location.pathname === item.path ? 'font-semibold underline' : ''
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
