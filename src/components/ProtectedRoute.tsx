import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Shield } from 'lucide-react';

/**
 * ProtectedRoute — wraps content that requires authentication.
 * Redirects to /login if not authenticated.
 * Shows a loading spinner during initial auth check.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  // Show loading screen while verifying token
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="relative">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary animate-pulse" />
            </div>
          </div>
          <div className="space-y-1 text-center">
            <p className="text-sm font-medium text-foreground">Authenticating...</p>
            <p className="text-xs text-muted-foreground">Verifying your session</p>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
