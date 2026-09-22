import { Grid2X2, List } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ViewMode = "list" | "grid";

export function ViewModeToggle({ value, onChange }: { value: ViewMode; onChange: (value: ViewMode) => void }) {
  return (
    <div className="inline-flex rounded-lg border bg-background p-1" role="group" aria-label="Mode d’affichage">
      <Button type="button" size="sm" variant={value === "list" ? "secondary" : "ghost"} onClick={() => onChange("list")} aria-pressed={value === "list"} title="Afficher en liste">
        <List className="h-4 w-4" />
        <span className="sr-only">Liste</span>
      </Button>
      <Button type="button" size="sm" variant={value === "grid" ? "secondary" : "ghost"} onClick={() => onChange("grid")} aria-pressed={value === "grid"} title="Afficher en damier">
        <Grid2X2 className="h-4 w-4" />
        <span className="sr-only">Damier</span>
      </Button>
    </div>
  );
}
