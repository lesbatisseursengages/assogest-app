import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useLocation } from "wouter";

/**
 * Composant bouton d'accès au portail d'administration
 * Peut être utilisé sur le site public pour accéder à l'application Manus
 */
export function AccessButton() {
  const [, setLocation] = useLocation();

  return (
    <Button
      onClick={() => setLocation("/admin-portal")}
      className="gap-2"
      variant="default"
    >
      <ExternalLink className="h-4 w-4" />
      Accès Portail
    </Button>
  );
}

/**
 * Composant lien direct vers le portail d'administration
 */
export function AccessLink() {
  return (
    <a
      href="/admin-portal"
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
    >
      <ExternalLink className="h-4 w-4" />
      Accès Portail
    </a>
  );
}

/**
 * Code HTML à intégrer sur le site public
 * À copier-coller dans votre site www.lesbatisseursengages.com
 */
export const HTML_EMBED_CODE = `
<!-- Bouton d'accès au portail d'administration -->
<!-- À intégrer dans votre site public -->
<div style="margin: 20px 0;">
  <a href="https://lesbatisseursengages.manus.space/admin-portal" 
     style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; 
            background-color: #2563eb; color: white; border-radius: 8px; 
            text-decoration: none; font-weight: 500; transition: background-color 0.3s;">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
      <polyline points="15 3 21 3 21 9"></polyline>
      <line x1="10" y1="14" x2="21" y2="3"></line>
    </svg>
    Accès Portail
  </a>
  <p style="font-size: 12px; color: #666; margin-top: 10px;">
    ⚠️ Accès réservé aux membres autorisés de l'association
  </p>
</div>
`;
