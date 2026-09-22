import { Check, CreditCard, ExternalLink, Loader2, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";

const plans = [
  {
    id: "solidarite",
    name: "Solidarité",
    price: 25,
    description: "Pour soutenir une action concrète de l’association.",
    icon: Sparkles,
    popular: false,
    features: ["Contribution ponctuelle", "Reçu de paiement Stripe", "Affectation aux actions générales"],
  },
  {
    id: "engagement",
    name: "Engagement",
    price: 50,
    description: "Une contribution renforcée pour accompagner les projets terrain.",
    icon: UsersRound,
    popular: true,
    features: ["Soutien aux projets prioritaires", "Suivi financier centralisé", "Reçu de paiement Stripe"],
  },
  {
    id: "impact",
    name: "Impact",
    price: 100,
    description: "Pour les partenaires qui souhaitent accélérer l’impact local.",
    icon: ShieldCheck,
    popular: false,
    features: ["Contribution partenaire", "Traçabilité du paiement", "Soutien aux initiatives au Tchad"],
  },
] as const;

export default function Pricing() {
  const [currency, setCurrency] = useState<"EUR" | "XOF">("EUR");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const createCheckout = trpc.stripe.createCheckoutSession.useMutation({
    onSuccess: ({ checkoutUrl }) => {
      toast.success("Checkout Stripe de test prêt", { description: "La page de paiement va s’ouvrir dans un nouvel onglet." });
      window.open(checkoutUrl, "_blank", "noopener,noreferrer");
      setSelectedPlan(null);
    },
    onError: (error) => {
      toast.error("Impossible de préparer le paiement", { description: error.message });
      setSelectedPlan(null);
    },
  });

  const startTestPayment = (plan: (typeof plans)[number]) => {
    setSelectedPlan(plan.id);
    const amountMinor = currency === "EUR" ? plan.price * 100 : plan.price * 1000;
    createCheckout.mutate({
      paymentType: "don",
      amountMinor,
      currency,
      description: `Contribution ${plan.name} — Les Bâtisseurs Engagés`,
      idempotencyKey: crypto.randomUUID(),
    });
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 pb-10">
      <section className="relative overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/[0.12] via-background to-amber-50/70 p-6 shadow-sm sm:p-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="gap-1.5 border-primary/20 bg-primary/10 text-primary hover:bg-primary/10"><CreditCard className="h-3.5 w-3.5" /> Paiement sécurisé</Badge>
            <Badge variant="outline" className="border-amber-300/60 bg-amber-50 text-amber-800">Mode test Stripe</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">Soutenez les actions des Bâtisseurs Engagés</h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">Choisissez une contribution simple et transparente. Vous serez redirigé vers Stripe Checkout pour tester le parcours de paiement sans débit réel.</p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex items-center gap-2 rounded-xl border bg-background/80 px-3 py-2">
              <Label htmlFor="pricing-currency" className="text-sm text-muted-foreground">Devise</Label>
              <Select value={currency} onValueChange={(value: "EUR" | "XOF") => setCurrency(value)}>
                <SelectTrigger id="pricing-currency" className="h-8 w-[128px] border-0 bg-transparent px-2 shadow-none"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="EUR">EUR (€)</SelectItem><SelectItem value="XOF">XOF (FCFA)</SelectItem></SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">Aucun paiement réel ne sera effectué en mode test.</p>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const amount = currency === "EUR" ? `${plan.price} €` : `${(plan.price * 1000).toLocaleString("fr-FR")} FCFA`;
          const isLoading = selectedPlan === plan.id && createCheckout.isPending;
          return (
            <Card key={plan.id} className={`relative flex flex-col overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${plan.popular ? "border-primary shadow-md ring-1 ring-primary/20" : "border-border/70"}`}>
              {plan.popular && <div className="absolute right-4 top-4"><Badge className="bg-primary text-primary-foreground">Recommandé</Badge></div>}
              <CardHeader className="space-y-4 pb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
                <div><CardTitle className="text-xl">{plan.name}</CardTitle><CardDescription className="mt-2 min-h-12 leading-6">{plan.description}</CardDescription></div>
                <div className="pt-1"><span className="text-4xl font-bold tracking-tight">{amount}</span><span className="ml-2 text-sm text-muted-foreground">contribution</span></div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-6">
                <ul className="flex-1 space-y-3 text-sm text-muted-foreground">
                  {plan.features.map((feature) => <li key={feature} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{feature}</li>)}
                </ul>
                <Button className="w-full gap-2" variant={plan.popular ? "default" : "outline"} onClick={() => startTestPayment(plan)} disabled={createCheckout.isPending}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                  {isLoading ? "Préparation…" : "Tester avec Stripe Checkout"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/70 p-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><p><strong className="text-foreground">Parcours sécurisé.</strong> La carte bancaire est saisie uniquement sur Stripe. L’application ne stocke jamais les données de carte.</p></div>
        <span className="whitespace-nowrap rounded-full bg-muted px-3 py-1 text-xs font-medium">Stripe Test Mode</span>
      </div>
    </div>
  );
}
