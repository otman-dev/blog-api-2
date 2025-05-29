# Groq AI Blog Generator

Un système automatisé de génération d'articles de blog utilisant l'API Groq et MongoDB.

## Fonctionnalités

- ✅ Génération automatique d'articles toutes les 3 minutes
- ✅ Intégration avec l'API Groq pour l'IA générative
- ✅ Stockage dans MongoDB (collection: posts)
- ✅ Sujets spécialisés en construction durable et éco-bâtiment
- ✅ Interface de contrôle pour démarrer/arrêter la génération
- ✅ API REST complète pour la gestion des posts

## Configuration

### 1. Variables d'environnement

Modifiez le fichier `.env.local` :

```bash
MONGODB_URI=mongodb://rasmus:wordpiss@adro.ddns.net:27017/otman-blog
GROQ_API_KEY=votre_clé_api_groq_ici
```

### 2. Installation

```bash
npm install
```

### 3. Démarrage

```bash
npm run dev
```

L'application sera disponible sur http://localhost:3000

## Structure de la base de données

Les posts sont stockés dans la collection `posts` avec la structure suivante :

```javascript
{
  _id: ObjectId,
  title: String,
  slug: String,
  excerpt: String,
  content: String,
  author: "Mouhib Otman",
  categories: Array,
  tags: Array,
  status: "published",
  publishedAt: Date,
  id: String,
  published: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Posts
- `GET /api/blogs` - Récupérer tous les posts
- `POST /api/blogs` - Créer un nouveau post
- `GET /api/blogs/[id]` - Récupérer un post spécifique
- `PUT /api/blogs/[id]` - Mettre à jour un post
- `DELETE /api/blogs/[id]` - Supprimer un post

### Auto-génération
- `GET /api/auto-generate` - Vérifier le statut de l'auto-génération
- `POST /api/auto-generate` - Contrôler l'auto-génération

Actions disponibles :
```javascript
// Démarrer l'auto-génération
{ "action": "start", "intervalMinutes": 3 }

// Arrêter l'auto-génération
{ "action": "stop" }

// Générer un post immédiatement
{ "action": "generate-now" }
```

## Sujets de génération

Le système génère automatiquement des articles sur des sujets liés à :
- Construction durable et matériaux écologiques
- Isolation thermique et économie d'énergie
- Bâtiments à énergie positive
- Certification environnementale
- Technologies vertes dans la construction
- Rénovation énergétique
- Et bien plus...

## Interface de contrôle

L'interface web permet de :
- Visualiser le statut de l'auto-génération
- Démarrer/arrêter la génération automatique
- Générer un post manuellement
- Voir les posts récents
- Contrôler l'intervalle de génération

## Démarrage automatique

Le système démarre automatiquement l'auto-génération 5 secondes après le lancement du serveur.

## Dépendances principales

- Next.js 14
- Mongoose (MongoDB)
- Groq SDK
- Tailwind CSS
- TypeScript
