import { useParams } from 'wouter';

export function TrackOrderPage() {
  const { orderId } = useParams<{ orderId: string }>();
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Track Your Order</h1>
        <p className="text-gray-600">Order ID: {orderId}</p>
        <p className="text-gray-500 mt-4">Order tracking coming soon...</p>
      </div>
    </div>
  );
}