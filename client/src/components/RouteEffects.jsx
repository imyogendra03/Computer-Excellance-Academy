import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const REVEAL_SELECTORS = [
  "section",
  "footer",
  ".row",
  ".col",
  ".container .card",
  ".container img",
  ".legacy-card",
  ".about-chip",
  ".home-panel",
  ".stat-card",
  ".course-card",
  ".review-card",
  ".feature-card",
  ".note-card",
  ".why-card",
  ".event-card",
  ".teacher-card",
  ".support-side-card",
  ".support-form-card",
  ".support-info-block",
  ".app-panel",
  ".app-stat-card",
  ".ca-chat",
  ".up-mobile-receipt",
  ".ap-stat",
  ".ap-panel",
  ".adminx-content > *",
  ".userdash-content > *",
].join(", ");

const getRouteGroup = (pathname) => {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/UserDash")) return "user";
  if (pathname === "/login" || pathname === "/register" || pathname === "/adlogin") {
    return "auth";
  }
  return "public";
};

const RouteEffects = () => {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top when route changes
    window.scrollTo(0, 0);

    document.body.setAttribute("data-route-group", getRouteGroup(location.pathname));

    const nodes = Array.from(document.querySelectorAll(REVEAL_SELECTORS));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    nodes.forEach((node, index) => {
      if (node.classList.contains("reveal-skip")) return;
      node.classList.add("reveal-in");
      node.style.setProperty("--reveal-delay", `${Math.min((index % 10) * 36, 280)}ms`);
      observer.observe(node);
    });

    return () => observer.disconnect();
  }, [location.pathname]);

  return null;
};

export default RouteEffects;
