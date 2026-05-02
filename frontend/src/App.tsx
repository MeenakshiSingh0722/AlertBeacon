import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import SimpleDashboard from "./pages/SimpleDashboard";
import DisasterDashboard from "./pages/DisasterDashboard";
import WorkingDashboard from "./pages/WorkingDashboard";
import DisasterAlertModal from "./components/DisasterAlertModal";
import Incidents from "./pages/Incidents";
import IncidentDetail from "./pages/IncidentDetail";
import Alerts from "./pages/Alerts";
import Analytics from "./pages/Analytics";
import Analyze from "./pages/Analyze";
import Settings from "./pages/Settings";
import IntelligenceEngine from "./components/IntelligenceEngine";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <DisasterAlertModal />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<WorkingDashboard />} />
          <Route path="/disaster-dashboard" element={<DisasterDashboard />} />
          <Route path="/working-dashboard" element={<WorkingDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/intelligence-engine" element={<IntelligenceEngine />} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<SimpleDashboard />} />
            <Route path="/incidents" element={<Incidents />} />
            <Route path="/incidents/:id" element={<IncidentDetail />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/analyze" element={<Analyze />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
