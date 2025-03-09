
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { initializeAuthService, isUserAuthenticated } from "./services/authService";
import { ThemeProvider } from "@/components/ThemeProvider";

// Authentication guard component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isUserAuthenticated()) {
    return <Navigate to="/login" replace />;
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

  return (
    <ThemeProvider defaultTheme="system">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Redirect root to dashboard if authenticated, otherwise to login */}
              <Route 
                path="/" 
                element={
                  isUserAuthenticated() ? 
                  <Navigate to="/index" replace /> : 
                  <Navigate to="/login" replace />
                } 
              />
              <Route path="/login" element={<Login />} />
              <Route 
                path="/index" 
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <Admin />
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
