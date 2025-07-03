import { useParams } from 'wouter';

export function RestaurantPage() {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Restaurant Details</h1>
        <p className="text-gray-600">Restaurant ID: {id}</p>
        <p className="text-gray-500 mt-4">Restaurant page coming soon...</p>
      </div>
    </div>
  );
}