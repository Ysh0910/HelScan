import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth, clearAuth } from "@/lib/auth";
import { apiGet } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ShieldPlus, LogOut } from "lucide-react";
import { useEffect, useState } from "react";

export function Nav() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [riderId, setRiderId] = useState(null);

  useEffect(() => {
    if (!token) {
      setRiderId(null);
      return;
    }
    apiGet("/auth/me", true)
      .then((me) => setRiderId(me.riderId ?? null))
      .catch(() => setRiderId(null));
  }, [token]);

  // Hide nav on public rider view (first-responder scanner UX)
  if (pathname.startsWith("/rider/")) return null;

  const handleLogout = () => {
    clearAuth();
    setRiderId(null);
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 no-print">
      <div className="glass border-b border-border/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-elegant transition-transform group-hover:scale-105">
              <ShieldPlus
                className="h-5 w-5 text-primary-foreground"
                strokeWidth={2.5}
              />
            </span>
            <span className="text-lg font-semibold tracking-tight">
              Hel<span className="text-primary">Scan</span>
            </span>
          </Link>

          <nav className="flex items-center gap-2">
            {user ? (
              <>
                {riderId ? (
                  <>
                    <Link to="/result/$id" params={{ id: riderId }}>
                      <Button variant="ghost" size="sm">
                        My profile
                      </Button>
                    </Link>
                    <Link to="/edit/$id" params={{ id: riderId }}>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Link to="/inputform">
                    <Button variant="ghost" size="sm">
                      Create profile
                    </Button>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-1.5"
                >
                  <LogOut className="h-4 w-4" /> Log out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="shadow-elegant">
                    Get started
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
