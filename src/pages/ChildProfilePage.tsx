import ChildProfileForm from '../components/children/ChildProfileForm'
import { useNavigate } from 'react-router-dom'

export default function ChildProfilePage() {
  const navigate = useNavigate()

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-xl font-bold text-gray-800 mt-2">
          Add a child profile
        </h1>
        <p className="text-sm text-gray-500">
          Stories will be personalized for them
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
        <ChildProfileForm />
      </div>
    </div>
  )
}
