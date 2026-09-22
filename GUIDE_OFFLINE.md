# Guide d'Installation et d'Utilisation - Mode Hors Ligne

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Installation](#installation)
3. [Lancement de l'application](#lancement-de-lapplication)
4. [Utilisation](#utilisation)
5. [Sauvegarde des données](#sauvegarde-des-données)
6. [Dépannage](#dépannage)

---

## 🔧 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

### 1. **Node.js** (Gratuit)
- **Téléchargez** : https://nodejs.org/
- **Version recommandée** : LTS (Long Term Support)
- **Installation** : Suivez les instructions du programme d'installation

**Vérification** : Ouvrez le terminal/PowerShell et tapez :
```bash
node --version
npm --version
```

Vous devriez voir des numéros de version.

### 2. **Git** (Gratuit, optionnel mais recommandé)
- **Téléchargez** : https://git-scm.com/
- **Installation** : Suivez les instructions du programme d'installation

---

## 📥 Installation

### Étape 1 : Téléchargez le code

**Option A : Avec Git (Recommandé)**

Ouvrez le terminal/PowerShell et exécutez :
```bash
git clone https://github.com/manus-team/batisseurs-engages-app.git
cd batisseurs-engages-app
```

**Option B : Sans Git**

1. Allez sur https://github.com/manus-team/batisseurs-engages-app
2. Cliquez sur le bouton vert **"Code"**
3. Cliquez sur **"Download ZIP"**
4. Extrayez le fichier ZIP sur votre ordinateur
5. Ouvrez le terminal/PowerShell et naviguez vers le dossier

### Étape 2 : Installez les dépendances

Dans le terminal, exécutez :
```bash
npm install
```

Cela téléchargera tous les fichiers nécessaires. Cela peut prendre 2-5 minutes selon votre connexion Internet.

---

## 🚀 Lancement de l'Application

### Démarrage du serveur

Dans le terminal, exécutez :
```bash
npm run dev
```

Vous verrez un message comme :
```
Server running on http://localhost:3000
```

### Accès à l'application

1. Ouvrez votre navigateur (Chrome, Firefox, Edge, Safari)
2. Allez à l'adresse : **http://localhost:3000**
3. Vous verrez la page de connexion

### Arrêt de l'application

Dans le terminal, appuyez sur **Ctrl + C** pour arrêter le serveur.

---

## 💻 Utilisation

### Connexion

1. **Entrez votre nom** : Tapez votre prénom et nom
2. **Choisissez votre rôle** :
   - **Membre** : Accès en lecture seule
   - **Secrétaire** : Peut créer et modifier les documents
   - **Admin** : Accès complet à toutes les fonctionnalités
3. **Cliquez sur "Se connecter"**

### Navigation

Une fois connecté, vous avez accès à :

#### **Tableau de bord**
- Vue d'ensemble de vos documents et membres
- Statistiques en temps réel
- Documents récents

#### **Documents**
- **Ajouter un document** :
  - Titre (obligatoire)
  - Description
  - Catégorie (Juridique, Gouvernance, Opérationnel, Financier, RH, Communication, Financement)
  - Priorité (Basse, Moyenne, Haute, Urgent)
- **Voir la liste** des documents
- **Supprimer** un document (bouton poubelle)

#### **Membres**
- **Ajouter un membre** :
  - Prénom (obligatoire)
  - Nom (obligatoire)
  - Email
  - Rôle (Membre, Secrétaire, Admin)
- **Voir la liste** des membres
- **Supprimer** un membre

#### **Catégories**
- Voir toutes les catégories disponibles
- Voir le nombre de documents par catégorie

### Déconnexion

Cliquez sur le bouton **"Déconnexion"** en haut à droite.

---

## 💾 Sauvegarde des Données

### Où sont stockées les données ?

Vos données sont stockées **localement sur votre ordinateur** dans le navigateur (localStorage). Aucune donnée n'est envoyée sur Internet.

### Sauvegarde manuelle

Pour sauvegarder vos données :

1. **Exportez les données** (à faire manuellement si nécessaire) :
   - Ouvrez le navigateur (F12 ou Ctrl+Shift+I)
   - Allez dans l'onglet "Application" ou "Storage"
   - Cherchez "Local Storage"
   - Vous verrez vos données

2. **Sauvegardez votre navigateur** :
   - Les données sont automatiquement sauvegardées
   - Elles persistent même après la fermeture du navigateur

### Réinitialisation des données

**⚠️ Attention** : Si vous videz le cache/les cookies du navigateur, vous perdrez vos données.

Pour éviter cela :
- Ne videz pas le cache de votre navigateur
- Ou exportez vos données régulièrement

---

## 🔧 Dépannage

### Problème : "npm: command not found"

**Solution** : Node.js n'est pas installé ou pas dans le PATH.
- Réinstallez Node.js depuis https://nodejs.org/
- Redémarrez votre terminal après l'installation

### Problème : "Port 3000 already in use"

**Solution** : Un autre programme utilise le port 3000.

**Windows** :
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Mac/Linux** :
```bash
lsof -i :3000
kill -9 <PID>
```

### Problème : Les données ne se sauvegardent pas

**Solution** :
- Vérifiez que le navigateur autorise le stockage local
- Essayez un autre navigateur
- Vérifiez que vous avez assez d'espace disque

### Problème : L'application est lente

**Solution** :
- Fermez les autres onglets/applications
- Redémarrez le serveur (`Ctrl + C` puis `npm run dev`)
- Videz le cache du navigateur (mais attention aux données !)

### Problème : Je ne peux pas accéder à http://localhost:3000

**Solution** :
- Vérifiez que le serveur est bien lancé (vous devriez voir "Server running on...")
- Essayez http://127.0.0.1:3000
- Vérifiez votre pare-feu

---

## 📞 Support

Si vous avez des problèmes :

1. Vérifiez que Node.js est correctement installé
2. Vérifiez que vous êtes dans le bon dossier
3. Essayez de réinstaller les dépendances : `npm install`
4. Redémarrez votre ordinateur

---

## ✨ Fonctionnalités

L'application offre :

- ✅ Gestion complète des documents
- ✅ Gestion des membres
- ✅ Tableau de bord avec statistiques
- ✅ Stockage local (pas d'Internet requis)
- ✅ Données persistantes
- ✅ Interface intuitive et responsive
- ✅ Rôles et permissions

---

## 🎯 Prochaines Étapes

Une fois l'application lancée, vous pouvez :

1. **Ajouter des membres** de votre association
2. **Créer des documents** et les organiser par catégories
3. **Assigner des rôles** pour contrôler les permissions
4. **Consulter le tableau de bord** pour voir les statistiques

---

**Bon travail avec votre application "Les Bâtisseurs Engagés" ! 🎉**
