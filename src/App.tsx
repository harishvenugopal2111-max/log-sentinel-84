import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Logs from "@/pages/Logs";
import Anomalies from "@/pages/Anomalies";
import Alerts from "@/pages/Alerts";
import AutoHeal from "@/pages/AutoHeal";
import Tasks from "@/pages/Tasks";
import SystemMonitor from "@/pages/SystemMonitor";
import Profile from "@/pages/Profile";
import SettingsPage from "@/pages/SettingsPage";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes — no auth required */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes — auth required */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/system-monitor" element={<SystemMonitor />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="/anomalies" element={<Anomalies />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/auto-heal" element={<AutoHeal />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
