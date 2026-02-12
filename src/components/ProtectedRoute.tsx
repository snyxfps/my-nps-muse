import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireStaff?: boolean;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireStaff = true, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isStaff, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Require admin access
  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 bg-card rounded-lg shadow-lg max-w-md">
          <div className="text-destructive text-5xl mb-4">🔒</div>
          <h1 className="text-xl font-bold mb-2">Acesso Restrito</h1>
          <p className="text-muted-foreground mb-4">
            Esta página requer permissões de administrador.
          </p>
        </div>
      </div>
    );
  }

  // Require staff access
  if (requireStaff && !isStaff) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 bg-card rounded-lg shadow-lg max-w-md">
          <div className="text-warning text-5xl mb-4">⏳</div>
          <h1 className="text-xl font-bold mb-2">Aguardando Aprovação</h1>
          <p className="text-muted-foreground mb-4">
            Sua conta foi criada, mas ainda não tem permissões de acesso ao dashboard.
            Entre em contato com um administrador para liberar seu acesso.
          </p>
          <p className="text-sm text-muted-foreground">
            Email: {user.email}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
