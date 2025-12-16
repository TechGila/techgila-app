import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Auth from "./pages/Auth";
import AuthComplete from "./pages/AuthComplete";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import Overview from "./pages/dashboard/Overview";
import BuildQueue from "./pages/dashboard/BuildQueue";
import TestResults from "./pages/dashboard/TestResults";
import AIInsights from "./pages/dashboard/AIInsights";
import Settings from "./pages/dashboard/Settings";
import Billing from "./pages/dashboard/Billing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/auth" replace />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/complete" element={<AuthComplete />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Overview />} />
              <Route path="build-queue" element={<BuildQueue />} />
              <Route path="test-results" element={<TestResults />} />
              <Route path="ai-insights" element={<AIInsights />} />
              <Route path="settings" element={<Settings />} />
              <Route path="billing" element={<Billing />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
