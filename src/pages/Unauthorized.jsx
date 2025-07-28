import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-red-500">403</h1>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-4">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            You don't have permission to access this resource.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            to="/dashboard"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </Link>
          
          <div>
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Sign in with different account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
