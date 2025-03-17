import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
        <ThemeToggle />
      </div>
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-4 text-foreground">404</h1>
        <p className="text-lg sm:text-xl text-muted-foreground mb-3 sm:mb-4">Oops! Page not found</p>
        <a href="/" className="text-primary hover:text-primary/80 underline text-base sm:text-lg">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
