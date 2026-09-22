import { ReactNode } from "react";
import { usePermission } from "@/hooks/useRole";
import { RolePermissions } from "@/lib/permissions";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProtectedFeatureProps {
  feature: keyof RolePermissions;
  action?: "create" | "read" | "update" | "delete";
  children: ReactNode;
  fallback?: ReactNode;
  showAlert?: boolean;
}

/**
 * Composant pour afficher/masquer les fonctionnalités en fonction des permissions
 */
export function ProtectedFeature({
  feature,
  action = "read",
  children,
  fallback,
  showAlert = true,
}: ProtectedFeatureProps) {
  const { canPerformAction } = usePermission();

  if (!canPerformAction(feature, action)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showAlert) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Vous n'avez pas la permission d'accéder à cette fonctionnalité.
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  }

  return <>{children}</>;
}

interface ProtectedButtonProps {
  feature: keyof RolePermissions;
  action?: "create" | "read" | "update" | "delete";
  children: (props: { disabled: boolean; isDisabled: boolean }) => ReactNode;
  disabled?: boolean;
  title?: string;
}

/**
 * Composant pour afficher/désactiver les boutons en fonction des permissions
 */
export function ProtectedButton({
  feature,
  action = "create",
  children,
  disabled = false,
  title,
}: ProtectedButtonProps) {
  const { canPerformAction } = usePermission();
  const hasAccess = canPerformAction(feature, action);

  return (
    <div title={!hasAccess ? "Vous n'avez pas la permission d'effectuer cette action" : title}>
      {children({
        disabled: disabled || !hasAccess,
        isDisabled: !hasAccess,
      })}
    </div>
  );
}

interface ProtectedSectionProps {
  feature: keyof RolePermissions;
  action?: "create" | "read" | "update" | "delete";
  children: ReactNode;
  showMessage?: boolean;
}

/**
 * Composant pour masquer/afficher une section entière en fonction des permissions
 */
export function ProtectedSection({
  feature,
  action = "read",
  children,
  showMessage = false,
}: ProtectedSectionProps) {
  const { canPerformAction } = usePermission();

  if (!canPerformAction(feature, action)) {
    if (showMessage) {
      return (
        <div className="flex items-center justify-center py-12 text-center">
          <div className="space-y-2">
            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">
              Vous n'avez pas accès à cette section.
            </p>
          </div>
        </div>
      );
    }
    return null;
  }

  return <>{children}</>;
}
