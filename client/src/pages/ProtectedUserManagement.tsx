import { useRole } from "@/hooks/useRole";
import UserManagement from "./UserManagement";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

/**
 * Wrapper pour protéger la page UserManagement
 * Seuls les administrateurs peuvent y accéder
 */
export default function ProtectedUserManagement() {
  const { isAdmin } = useRole();

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground">
            Accès réservé aux administrateurs
          </p>
        </div>

        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="flex gap-4 pt-6">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                Accès non autorisé
              </h3>
              <p className="text-sm text-red-800 dark:text-red-200">
                Vous n'avez pas les permissions nécessaires pour accéder à la gestion des utilisateurs.
                Seuls les administrateurs peuvent gérer les identifiants et les mots de passe.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <UserManagement />;
}
