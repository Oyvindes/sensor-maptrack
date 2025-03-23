import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import SensorHealthCheck from "./pages/SensorHealthCheck";
import { initializeAuthService, isUserAuthenticated, getCurrentUser } from "./services/authService";
import { ThemeProvider } from "@/components/ThemeProvider";
import { hasAdminAccess } from "./utils/authUtils";
import StatePreserver from "@/components/StatePreserver";
import Overview from "./pages/Overview";
import Projects from "./pages/Projects";
import Track from "./pages/Track";
import Support from "./pages/Support";
import Shop from "./pages/Shop";

// Authentication guard component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isUserAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Admin route guard component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isUserAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  if (!hasAdminAccess()) {
    return <Navigate to="/index" replace />;
  }
  
  return <>{children}</>;
};

const queryClient = new QueryClient();

const App = () => {
  // Initialize authentication service on app start
  useEffect(() => {
    try {
      initializeAuthService();
      console.log("Auth service initialized");
    } catch (error) {
      console.error("Error initializing auth service:", error);
    }
  }, []);

  // State to track if we're restoring from a refresh
  const [isRestoringState, setIsRestoringState] = useState(false);

  // Check if we need to restore state from a refresh
  useEffect(() => {
    const preserved = sessionStorage.getItem('appStatePreserved');
    if (preserved === 'true') {
      setIsRestoringState(true);
      // Clear the flag
      sessionStorage.removeItem('appStatePreserved');
    }
  }, []);

  return (
    <ThemeProvider defaultTheme="system">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            {/* Add our StatePreserver component */}
            <StatePreserver />
            <Toaster />
            <Sonner />
            <Routes>
              {/* Redirect root to dashboard if authenticated, otherwise to login */}
              <Route
                path="/"
                element={
                  isUserAuthenticated() ?
                  <Navigate to="/overview" replace /> :
                  <Navigate to="/login" replace />
                }
              />
              <Route path="/login" element={<Login />} />
              
              {/* Legacy route - redirect to overview */}
              <Route
                path="/index"
                element={<Navigate to="/overview" replace />}
              />
              
              {/* Dashboard tab routes */}
              <Route
                path="/overview"
                element={
                  <ProtectedRoute>
                    <Overview />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects"
                element={
                  <ProtectedRoute>
                    <Projects />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/track"
                element={
                  <ProtectedRoute>
                    <Track />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/support"
                element={
                  <ProtectedRoute>
                    <Support />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shop"
                element={
                  <ProtectedRoute>
                    <Shop />
                  </ProtectedRoute>
                }
              />
              
              {/* Admin route */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                }
              />
              
              {/* Sensor health check route */}
              <Route
                path="/sensor-health-check"
                element={
                  <ProtectedRoute>
                    <SensorHealthCheck />
                  </ProtectedRoute>
                }
              />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
