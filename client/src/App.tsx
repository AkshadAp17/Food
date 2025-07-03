import { QueryClientProvider } from '@tanstack/react-query';
import { Switch, Route, Router } from 'wouter';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/toaster';
import { AuthPage } from '@/pages/AuthPage';
import { HomePage } from '@/pages/HomePage';
import { TestPage } from '@/pages/TestPage';
import { RestaurantPage } from '@/pages/RestaurantPage';
import { CartPageNew as CartPage } from '@/pages/CartPageNew';
import { OrdersPageNew as OrdersPage } from '@/pages/OrdersPageNew';
import { CheckoutPageNew as CheckoutPage } from '@/pages/CheckoutPageNew';
import { TrackOrderPageNew as TrackOrderPage } from '@/pages/TrackOrderPageNew';
import { AdminPage } from '@/pages/AdminPage';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { queryClient } from '@/lib/queryClient';

function AppRouter() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user || !user.isVerified) {
    return <AuthPage />;
  }

  return (
    <Router>
      <Switch>
        <Route path="/test" component={TestPage} />
        <Route path="/restaurant/:id" component={RestaurantPage} />
        <Route path="/cart" component={CartPage} />
        <Route path="/checkout" component={CheckoutPage} />
        <Route path="/orders" component={OrdersPage} />
        <Route path="/track/:orderId" component={TrackOrderPage} />
        <Route path="/admin" component={AdminPage} />
        <Route path="/" component={HomePage} />
        <Route>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-gray-600">Page not found</p>
            </div>
          </div>
        </Route>
      </Switch>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <AppRouter />
          <Toaster />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;