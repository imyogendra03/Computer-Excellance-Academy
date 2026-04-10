import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Custom hook to reload page on route change
 * Usage: Pass specific routes array to reload only on those routes
 * Example: usePageReload(['/admin', '/UserDash'])
 */
export const usePageReload = (specificRoutes = null) => {
  const location = useLocation();

  useEffect(() => {
    // If specific routes are defined, only reload on those routes
    if (specificRoutes && Array.isArray(specificRoutes)) {
      const shouldReload = specificRoutes.some((route) =>
        location.pathname.includes(route)
      );
      if (shouldReload) {
        // Uncomment the line below to enable auto-reload on specific routes
        // window.location.reload();
      }
    }
    // For general use without specificRoutes, just scroll to top (via RouteEffects)
  }, [location.pathname, specificRoutes]);
};

export default usePageReload;
