import { useAuth } from '@/hooks/useAuth';

export function TestPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Authentication Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Current User State</h2>
          
          {user ? (
            <div>
              <p className="text-green-600 font-medium mb-4">User is authenticated ✓</p>
              <div className="bg-gray-100 p-4 rounded">
                <pre>{JSON.stringify(user, null, 2)}</pre>
              </div>
              
              <div className="mt-4">
                <p><strong>User ID:</strong> {user.id || 'MISSING'}</p>
                <p><strong>Email:</strong> {user.email || 'MISSING'}</p>
                <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                <p><strong>Verified:</strong> {user.isVerified ? 'Yes' : 'No'}</p>
              </div>
            </div>
          ) : (
            <p className="text-red-600 font-medium">User is not authenticated ✗</p>
          )}
        </div>
        
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">LocalStorage Data</h2>
          <div className="bg-gray-100 p-4 rounded">
            <pre>{localStorage.getItem('foodie_user') || 'No data in localStorage'}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}