import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Lock, ExternalLink, Shield, CheckCircle2 } from "lucide-react";
import { useRole } from "@/hooks/useRole";
import { useLocation } from "wouter";

/**
 * Page d'accès sécurisé à l'application Manus
 * Réservée aux administrateurs et membres autorisés
 */
export default function AdminPortal() {
  const { isAdmin, currentRole } = useRole();
  const [, setLocation] = useLocation();

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Portail d'Administration</h1>
          <p className="text-muted-foreground">
            Accès à l'application de gestion de l'association
          </p>
        </div>

        {/* Access Denied Message */}
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
          <CardContent className="flex gap-4 pt-6">
            <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                Accès Réservé aux Membres Autorisés
              </h3>
              <p className="text-sm text-amber-800 dark:text-amber-200 mb-4">
                Cette page est accessible uniquement aux administrateurs et aux membres du bureau exécutif 
                autorisés à gérer l'association. Si vous pensez avoir accès, veuillez contacter un administrateur.
              </p>
              <div className="text-xs text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 p-3 rounded">
                <p className="font-medium mb-1">Votre rôle actuel :</p>
                <p className="font-mono">{currentRole === "admin" ? "Administrateur" : "Membre"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Pourquoi cette restriction ?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              Le portail d'administration contient des outils sensibles pour gérer l'association :
            </p>
            <ul className="space-y-2 ml-4">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Gestion des documents confidentiels</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Gestion des finances et des transactions</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Gestion des membres et des adhésions</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Gestion des campagnes de collecte</span>
              </li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Pour des raisons de sécurité et de confidentialité, seuls les administrateurs peuvent y accéder.
            </p>
          </CardContent>
        </Card>

        {/* Contact Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Besoin d'accès ?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">
              Si vous êtes membre du bureau exécutif et n'avez pas accès à cette page, 
              veuillez contacter l'administrateur principal de l'association.
            </p>
            <p className="text-sm text-muted-foreground">
              Email : contact@lesbatisseursengages.com
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin Access - Show Portal
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Portail d'Administration</h1>
        <p className="text-muted-foreground">
          Accès à l'application de gestion de l'association
        </p>
      </div>

      {/* Welcome Banner */}
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 dark:border-green-900">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Shield className="h-8 w-8 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div>
              <h2 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                Bienvenue dans le Portail d'Administration
              </h2>
              <p className="text-sm text-green-800 dark:text-green-200 mb-4">
                Vous avez accès à l'application de gestion complète de l'association. 
                Cliquez sur le bouton ci-dessous pour accéder à tous les outils d'administration.
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                  Administrateur
                </Badge>
                <span className="text-xs text-green-700 dark:text-green-300">Accès complet</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Access Button */}
      <Card>
        <CardHeader>
          <CardTitle>Accéder à l'Application</CardTitle>
          <CardDescription>
            Plateforme complète de gestion documentaire, financière et administrative
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            Cliquez sur le bouton ci-dessous pour accéder à l'application de gestion de l'association.
            Vous y trouverez tous les outils nécessaires pour gérer les documents, les finances, 
            les membres, les campagnes de collecte et bien plus encore.
          </p>
          <Button
            size="lg"
            className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
            onClick={() => window.open("https://lesbatisseursengages.manus.space/", "_blank")}
          >
            <ExternalLink className="h-5 w-5" />
            Accéder à l'Application Manus
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            L'application s'ouvrira dans un nouvel onglet
          </p>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">📄 Gestion Documentaire</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Organisez et gérez tous les documents de l'association avec catégorisation et recherche avancée.
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">💰 Gestion Financière</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Suivi complet des finances : cotisations, dons, dépenses et rapports financiers.
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">👥 Gestion des Membres</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Gérez les informations des membres, les rôles, les adhésions et les permissions.
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">📊 Campagnes & Événements</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Créez et gérez les campagnes de collecte, les événements et les adhésions annuelles.
          </CardContent>
        </Card>
      </div>

      {/* Security Notice */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
        <CardContent className="flex gap-4 pt-6">
          <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              Sécurité et Confidentialité
            </p>
            <p className="text-blue-800 dark:text-blue-200">
              Vos données sont protégées et chiffrées. L'accès à cette application est réservé 
              aux administrateurs autorisés uniquement.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
