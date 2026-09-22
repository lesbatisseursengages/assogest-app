import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

export type ModuleSubnavItem = {
  id: string;
  label: string;
  icon?: LucideIcon;
  active?: boolean;
  onClick: () => void;
};

export function ModuleSubnav({ title, items }: { title: string; items: ModuleSubnavItem[] }) {
  return (
    <nav aria-label={`Sous-navigation ${title}`} className="rounded-xl border border-border/70 bg-card/80 p-2 shadow-sm">
      <div className="flex flex-wrap items-center gap-1">
        <span className="mr-2 px-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{title}</span>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              type="button"
              size="sm"
              variant={item.active ? "secondary" : "ghost"}
              aria-current={item.active ? "page" : undefined}
              onClick={item.onClick}
              className={cn("gap-2", item.active && "bg-primary/10 text-primary hover:bg-primary/15")}
            >
              {Icon ? <Icon className="h-4 w-4" /> : null}
              {item.label}
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
