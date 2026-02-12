import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireStaff?: boolean;
  requireAdmin?: boolean;
}

/**
 * DEV MODE:
 * - Qualquer usuário autenticado pode acessar rotas "staff".
 * - Rotas "admin" continuam restritas a usuários com role admin.
 */
export function ProtectedRoute({
  children,
  requireStaff = true,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="texts text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Require admin access (mantém restrição)
  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 bg-card rounded-lg shadow-lg max-w-md">
          <div className="text-destructive text-5xl mb-4">🔒</div>
          <h1 className="text-xl font-bold mb-2">Acesso Restrito</h1>
          <p className="text-muted-foreground mb-4">
            Esta página requer permissões de administrador.
          </p>
          <p className="text-sm text-muted-foreground">
            Email: {user.email}
          </p>
        </div>
      </div>
    );
  }

  // Require staff access
  // DEV: não bloqueia por role. Em produção, volte a exigir isStaff.
  if (requireStaff) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
