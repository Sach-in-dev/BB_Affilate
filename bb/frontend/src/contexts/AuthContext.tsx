import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "@/lib/axios";

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: "admin" | "creator";
  role_name: string | null;
  permissions: string[];
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  hasPermission: (key: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
  hasPermission: () => false,
});

// Routes that never require authentication.
const PUBLIC_ROUTES = ["/", "/login", "/signup"];
// Prefixes that are public — /r/:code is customer traffic from social.
const PUBLIC_PREFIXES = ["/r/"];

const isPublicPath = (path: string) =>
  PUBLIC_ROUTES.includes(path) || PUBLIC_PREFIXES.some((p) => path.startsWith(p));

export function homeFor(user: User): string {
  return user.user_type === "admin" ? "/admin" : "/dashboard";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => setUser(res.data.data))
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) return;
    const path = location.pathname;
    const isPublic = isPublicPath(path);

    if (!user && !isPublic) {
      navigate("/login", { replace: true });
      return;
    }
    // Logged-in users landing on auth pages get sent to their home.
    if (user && (path === "/login" || path === "/signup")) {
      navigate(homeFor(user), { replace: true });
      return;
    }
    // Creators cannot access the admin portal.
    if (user && user.user_type !== "admin" && path.startsWith("/admin")) {
      navigate("/dashboard", { replace: true });
    }
    // Admins visiting the creator dashboard get their portal instead.
    if (user && user.user_type === "admin" && path.startsWith("/dashboard")) {
      navigate("/admin", { replace: true });
    }
  }, [user, loading, location.pathname, navigate]);

  const logout = () => {
    api.post("/auth/logout").catch(() => {});
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login", { replace: true });
  };

  const hasPermission = (key: string) =>
    user?.user_type === "admin" && (user.permissions?.includes(key) ?? false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
