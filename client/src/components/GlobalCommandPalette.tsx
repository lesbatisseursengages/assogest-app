import { Command as CommandIcon, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useAuth as useAuthHook } from "@/_core/hooks/useAuth";
import type { MenuItem } from "@/components/DashboardLayout";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";

type NavigationEntry = { label: string; path: string; group: string; icon?: MenuItem["icon"] };

export function GlobalCommandPalette({ items }: { items: MenuItem[] }) {
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { user } = useAuthHook() as { user?: { role?: string } | null };
  const navigationItems = useMemo<NavigationEntry[]>(() => {
    const flattenVisible = (items: MenuItem[], parent?: string): NavigationEntry[] => items.flatMap((item) => {
      if (item.adminOnly && user?.role !== "admin") return [];
      if (item.isGroup && item.items) return flattenVisible(item.items, item.label);
      return item.path ? [{ label: item.label, path: item.path, group: parent ?? "Navigation", icon: item.icon }] : [];
    });
    return flattenVisible(items);
  }, [items, user?.role]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const goTo = (path: string) => {
    setOpen(false);
    setLocation(path);
  };

  const groupedItems = navigationItems.reduce<Record<string, NavigationEntry[]>>((groups: Record<string, NavigationEntry[]>, item: NavigationEntry) => {
    (groups[item.group] ??= []).push(item);
    return groups;
  }, {});

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="h-10 min-w-0 flex-1 justify-start gap-2 rounded-xl border-border/70 bg-background/75 px-3 text-muted-foreground shadow-none hover:border-primary/30 hover:bg-primary/5 hover:text-foreground sm:max-w-[300px]"
        aria-label="Rechercher une fonctionnalité"
      >
        <Search className="h-4 w-4 shrink-0 text-primary" />
        <span className="truncate text-sm">Rechercher une fonctionnalité…</span>
        <CommandShortcut className="ml-auto hidden rounded-md border bg-muted/60 px-1.5 py-0.5 text-[10px] font-semibold sm:inline-flex">⌘K</CommandShortcut>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen} title="Recherche globale" description="Naviguez rapidement entre les modules et fonctionnalités de l’association.">
        <CommandInput placeholder="Rechercher un module, une page…" autoFocus />
        <CommandList className="max-h-[min(60vh,480px)]">
          <CommandEmpty>Aucune fonctionnalité trouvée.</CommandEmpty>
          {(Object.entries(groupedItems) as Array<[string, NavigationEntry[]]>).map(([group, items]) => (
            <CommandGroup key={group} heading={group}>
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem key={item.path} value={`${item.label} ${item.group} ${item.path}`} onSelect={() => goTo(item.path)} className="gap-3 py-3">
                    {Icon ? <Icon className="h-4 w-4 text-primary" /> : <CommandIcon className="h-4 w-4 text-primary" />}
                    <span>{item.label}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{item.path}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
