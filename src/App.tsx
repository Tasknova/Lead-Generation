import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import AuthGuard from './components/auth/AuthGuard';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/Profile';
import NotFound from './pages/NotFound';
import HomePage from './pages/HomePage';
import LeadGenerationPage from './pages/LeadGenerationPage';
import OrdersPage from './pages/OrdersPage';
import LeadDataPage from './pages/LeadDataPage';
import PaymentTestPage from './pages/PaymentTestPage';

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Router>
        <Routes>
          <Route
            path="/auth"
            element={
              <AuthGuard>
                <AuthPage />
              </AuthGuard>
            }
          />
          
          <Route 
            path="/profile"
            element={
              <AuthGuard>
                <ProfilePage />
              </AuthGuard>
            }
          />

          <Route 
            path="/lead-generation"
            element={
              <AuthGuard>
                <LeadGenerationPage />
              </AuthGuard>
            }
          />

          <Route 
            path="/orders"
            element={
              <AuthGuard>
                <OrdersPage />
              </AuthGuard>
            }
          />

          <Route 
            path="/lead-data/:id"
            element={
              <AuthGuard>
                <LeadDataPage />
              </AuthGuard>
            }
          />

          <Route 
            path="/payment-test"
            element={
              <AuthGuard>
                <PaymentTestPage />
              </AuthGuard>
            }
          />

          <Route 
            path="/"
            element={<HomePage />}
          />

          <Route 
            path="/dashboard"
            element={
              <AuthGuard>
                <Navigate to="/lead-generation" replace />
              </AuthGuard>
            }
          />

          <Route 
            path="/home"
            element={
              <AuthGuard>
                <Navigate to="/lead-generation" replace />
              </AuthGuard>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </TooltipProvider>
  );
}

export default App;
