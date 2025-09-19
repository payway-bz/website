import { useNavigate } from 'react-router-dom'
import Orders from './orders/Orders'
import { useAuth, type Business } from '../auth/useAuth'
import { logOut } from '../auth/firebase'

function Home() {
  const { userData, businesses } = useAuth({ requireAuth: true })
  const navigate = useNavigate()

  // Select business from profile
  const bizList = businesses ?? []
  let selectedBusiness: Business | null = null
  if (bizList.length === 0) {
    // TODO: add user to a business (invite or create flow)
  } else if (bizList.length === 1) {
    selectedBusiness = bizList[0]
  } else {
    // TODO: redirect to a page to select a business
  }

  const onLogout = async () => {
    await logOut()
    navigate('/login', { replace: true })
  }

  const fullName = [userData?.name, userData?.lastName].join(' ')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
            {fullName ? `Welcome, ${fullName}` : 'Welcome'}
          </h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Orders businessId={selectedBusiness?.id ?? ''} />
      </main>
    </div>
  )
}

export default Home