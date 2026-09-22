import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit2, 
  FileText,
  Users,
  FolderOpen,
  Archive,
  Activity,
  LayoutDashboard
} from "lucide-react";
import { toast } from "sonner";

interface Document {
  id: number;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
}

interface Member {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'secretary' | 'member';
}

interface OfflineUser {
  name: string;
  role: 'admin' | 'secretary' | 'member';
}

const CATEGORIES = [
  'Juridique',
  'Gouvernance',
  'Opérationnel',
  'Financier',
  'RH',
  'Communication',
  'Financement'
];

export default function OfflineApp() {
  const [currentUser, setCurrentUser] = useState<OfflineUser | null>(null);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'documents' | 'members' | 'categories' | 'archives'>('dashboard');
  
  // Documents
  const [documents, setDocuments] = useState<Document[]>([]);
  const [newDoc, setNewDoc] = useState({ title: '', description: '', category: CATEGORIES[0], priority: 'medium' });
  
  // Members
  const [members, setMembers] = useState<Member[]>([]);
  const [newMember, setNewMember] = useState({ firstName: '', lastName: '', email: '', role: 'member' as const });

  // Load data from localStorage
  useEffect(() => {
    const user = localStorage.getItem('offlineUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    
    const docs = localStorage.getItem('offlineDocs');
    if (docs) {
      setDocuments(JSON.parse(docs));
    }
    
    const mems = localStorage.getItem('offlineMembers');
    if (mems) {
      setMembers(JSON.parse(mems));
    }
  }, []);

  // Save documents to localStorage
  useEffect(() => {
    localStorage.setItem('offlineDocs', JSON.stringify(documents));
  }, [documents]);

  // Save members to localStorage
  useEffect(() => {
    localStorage.setItem('offlineMembers', JSON.stringify(members));
  }, [members]);

  const handleLogout = () => {
    localStorage.removeItem('offlineUser');
    localStorage.removeItem('offlineDocs');
    localStorage.removeItem('offlineMembers');
    window.location.reload();
  };

  const addDocument = () => {
    if (!newDoc.title) {
      toast.error('Veuillez entrer un titre');
      return;
    }
    
    const doc: Document = {
      id: Date.now(),
      title: newDoc.title,
      description: newDoc.description,
      category: newDoc.category,
      status: 'pending',
      priority: newDoc.priority as any,
      createdAt: new Date().toLocaleDateString('fr-FR'),
    };
    
    setDocuments([...documents, doc]);
    setNewDoc({ title: '', description: '', category: CATEGORIES[0], priority: 'medium' });
    toast.success('Document ajouté');
  };

  const deleteDocument = (id: number) => {
    setDocuments(documents.filter(d => d.id !== id));
    toast.success('Document supprimé');
  };

  const addMember = () => {
    if (!newMember.firstName || !newMember.lastName) {
      toast.error('Veuillez entrer le prénom et le nom');
      return;
    }
    
    const member: Member = {
      id: Date.now(),
      firstName: newMember.firstName,
      lastName: newMember.lastName,
      email: newMember.email,
      role: newMember.role,
    };
    
    setMembers([...members, member]);
    setNewMember({ firstName: '', lastName: '', email: '', role: 'member' });
    toast.success('Membre ajouté');
  };

  const deleteMember = (id: number) => {
    setMembers(members.filter(m => m.id !== id));
    toast.success('Membre supprimé');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Les Bâtisseurs Engagés</h1>
              <p className="text-xs text-muted-foreground">Mode Hors Ligne</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">{currentUser.name}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 flex gap-2 py-2">
          <Button
            variant={currentPage === 'dashboard' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentPage('dashboard')}
          >
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Tableau de bord
          </Button>
          <Button
            variant={currentPage === 'documents' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentPage('documents')}
          >
            <FileText className="w-4 h-4 mr-2" />
            Documents ({documents.length})
          </Button>
          <Button
            variant={currentPage === 'members' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentPage('members')}
          >
            <Users className="w-4 h-4 mr-2" />
            Membres ({members.length})
          </Button>
          <Button
            variant={currentPage === 'categories' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentPage('categories')}
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            Catégories
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {currentPage === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{documents.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Membres</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{members.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Urgents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {documents.filter(d => d.priority === 'urgent').length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Complétés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {documents.filter(d => d.status === 'completed').length}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Documents Récents</CardTitle>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <p className="text-muted-foreground">Aucun document. Créez-en un pour commencer.</p>
                ) : (
                  <div className="space-y-2">
                    {documents.slice(-5).map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium">{doc.title}</p>
                          <p className="text-sm text-muted-foreground">{doc.category}</p>
                        </div>
                        <Badge className={getPriorityColor(doc.priority)}>
                          {doc.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {currentPage === 'documents' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ajouter un Document</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Titre</Label>
                  <Input
                    value={newDoc.title}
                    onChange={(e) => setNewDoc({...newDoc, title: e.target.value})}
                    placeholder="Titre du document"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newDoc.description}
                    onChange={(e) => setNewDoc({...newDoc, description: e.target.value})}
                    placeholder="Description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Catégorie</Label>
                    <select
                      value={newDoc.category}
                      onChange={(e) => setNewDoc({...newDoc, category: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Priorité</Label>
                    <select
                      value={newDoc.priority}
                      onChange={(e) => setNewDoc({...newDoc, priority: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="low">Basse</option>
                      <option value="medium">Moyenne</option>
                      <option value="high">Haute</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                <Button onClick={addDocument} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter le Document
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Liste des Documents</CardTitle>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <p className="text-muted-foreground">Aucun document</p>
                ) : (
                  <div className="space-y-2">
                    {documents.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex-1">
                          <p className="font-medium">{doc.title}</p>
                          <p className="text-sm text-muted-foreground">{doc.description}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">{doc.category}</Badge>
                            <Badge className={getPriorityColor(doc.priority)}>
                              {doc.priority}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteDocument(doc.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {currentPage === 'members' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ajouter un Membre</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Prénom</Label>
                    <Input
                      value={newMember.firstName}
                      onChange={(e) => setNewMember({...newMember, firstName: e.target.value})}
                      placeholder="Prénom"
                    />
                  </div>
                  <div>
                    <Label>Nom</Label>
                    <Input
                      value={newMember.lastName}
                      onChange={(e) => setNewMember({...newMember, lastName: e.target.value})}
                      placeholder="Nom"
                    />
                  </div>
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    value={newMember.email}
                    onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                    placeholder="Email"
                    type="email"
                  />
                </div>
                <div>
                  <Label>Rôle</Label>
                  <select
                    value={newMember.role}
                    onChange={(e) => setNewMember({...newMember, role: e.target.value as any})}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="member">Membre</option>
                    <option value="secretary">Secrétaire</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <Button onClick={addMember} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter le Membre
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Liste des Membres</CardTitle>
              </CardHeader>
              <CardContent>
                {members.length === 0 ? (
                  <p className="text-muted-foreground">Aucun membre</p>
                ) : (
                  <div className="space-y-2">
                    {members.map(member => (
                      <div key={member.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex-1">
                          <p className="font-medium">{member.firstName} {member.lastName}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {member.role === 'admin' ? 'Admin' : member.role === 'secretary' ? 'Secrétaire' : 'Membre'}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMember(member.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {currentPage === 'categories' && (
          <Card>
            <CardHeader>
              <CardTitle>Catégories de Documents</CardTitle>
              <CardDescription>
                Les documents peuvent être organisés dans ces catégories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CATEGORIES.map(cat => (
                  <div key={cat} className="p-4 border rounded-lg">
                    <p className="font-medium">{cat}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {documents.filter(d => d.category === cat).length} document(s)
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
