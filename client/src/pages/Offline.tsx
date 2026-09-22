import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Lock, User } from "lucide-react";
import { toast } from "sonner";
import OfflineApp from "./OfflineApp";

interface OfflineUser {
  name: string;
  role: 'admin' | 'secretary' | 'member';
}

export default function Offline() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState<'admin' | 'secretary' | 'member'>('member');
  const [currentUser, setCurrentUser] = useState<OfflineUser | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const saved = localStorage.getItem('offlineUser');
    if (saved) {
      const user = JSON.parse(saved);
      setCurrentUser(user);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = () => {
    if (!userName.trim()) {
      toast.error("Veuillez entrer votre nom");
      return;
    }

    const user: OfflineUser = {
      name: userName,
      role: userRole,
    };

    localStorage.setItem('offlineUser', JSON.stringify(user));
    setCurrentUser(user);
    setIsLoggedIn(true);
    toast.success(`Bienvenue ${userName} !`);
  };

  const handleLogout = () => {
    localStorage.removeItem('offlineUser');
    setCurrentUser(null);
    setIsLoggedIn(false);
    setUserName("");
    setUserRole('member');
    toast.success("Déconnexion réussie");
  };

  if (isLoggedIn && currentUser) {
    return <OfflineApp />;
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/10 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-2">
            <div className="flex justify-center mb-4">
              <img src="/logo.png" alt="Les Batisseurs Engages" className="w-16 h-16 object-contain" />
            </div>
            <CardTitle className="text-2xl text-center">Les Bâtisseurs Engagés</CardTitle>
            <CardDescription className="text-center">
              Plateforme de gestion documentaire (Mode Hors Ligne)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Votre nom</Label>
              <Input
                id="name"
                placeholder="Entrez votre nom"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Votre rôle</Label>
              <select
                id="role"
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as 'admin' | 'secretary' | 'member')}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="member">Membre (Lecture seule)</option>
                <option value="secretary">Secrétaire (Création/Modification)</option>
                <option value="admin">Admin (Accès complet)</option>
              </select>
            </div>

            <Button
              onClick={handleLogin}
              className="w-full bg-primary hover:bg-primary/90"
              size="lg"
            >
              <Lock className="mr-2 h-4 w-4" />
              Se connecter
            </Button>

            <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>ℹ️ Mode Hors Ligne :</strong> Vos données sont stockées localement sur votre ordinateur. Aucune connexion Internet requise.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Les Bâtisseurs Engagés</h1>
              <p className="text-sm text-muted-foreground">Mode Hors Ligne</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">{currentUser?.name}</span>
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                {currentUser?.role === 'admin' ? 'Admin' : currentUser?.role === 'secretary' ? 'Secrétaire' : 'Membre'}
              </span>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Déconnexion
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bienvenue !</CardTitle>
            <CardDescription>
              Vous êtes maintenant connecté en mode hors ligne. Utilisez le menu de navigation pour accéder aux différentes sections.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">📄 Documents</h3>
                <p className="text-sm text-muted-foreground">
                  Gérez vos documents, ajoutez des fichiers et organisez-les par catégories.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">👥 Membres</h3>
                <p className="text-sm text-muted-foreground">
                  Gérez les membres de votre association et leurs permissions.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">📁 Catégories</h3>
                <p className="text-sm text-muted-foreground">
                  Organisez vos documents en catégories (Juridique, Financier, etc.).
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">📦 Archives</h3>
                <p className="text-sm text-muted-foreground">
                  Archivez les documents anciens et restaurez-les si nécessaire.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
