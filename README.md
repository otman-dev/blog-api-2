# IT/Software Engineering Blog Generator

Un système automatisé de génération d'articles de blog techniques utilisant l'API Groq et MongoDB.

## Fonctionnalités

- ✅ Génération automatique d'articles toutes les 10 minutes
- ✅ Intégration avec l'API Groq pour l'IA générative  
- ✅ Stockage dans MongoDB (collection: posts)
- ✅ Sujets spécialisés en IT, développement logiciel et ingénierie
- ✅ Interface de contrôle pour démarrer/arrêter la génération
- ✅ API REST complète pour la gestion des posts
- ✅ Gestion des slugs uniques avec timestamps
- ✅ Retry logic pour les erreurs de base de données
- ✅ Authentification JWT pour le tableau de bord
- ✅ Authentification par clé API pour les tâches cron

## Déploiement sur Vercel

### 1. Variables d'environnement

Dans votre dashboard Vercel, ajoutez ces variables d'environnement :

```
MONGODB_URI=mongodb://username:password@host:port/database?authSource=admin
MONGODB_ADMIN_URI=mongodb://username:password@host:port/blog-api?authSource=admin
GROQ_API_KEY=your_groq_api_key_here
JWT_SECRET=your_random_secret_here
CRON_API_KEY=your_generated_api_key_for_cron_jobs
```

### 2. Configuration

Copiez `.env.example` vers `.env.local` pour le développement local :

```bash
MONGODB_URI=mongodb://username:password@host:port/database
MONGODB_ADMIN_URI=mongodb://username:password@host:port/database
GROQ_API_KEY=votre_clé_api_groq_ici
JWT_SECRET=votre_secret_jwt_ici
CRON_API_KEY=votre_clé_api_pour_cron_ici
```

### 3. Génération d'une clé API pour les tâches cron

Exécutez le script pour générer une clé API sécurisée pour les tâches cron :

```bash
node scripts/generate-api-key.js
```

Ajoutez cette clé à vos variables d'environnement (localement et sur Vercel).

### 4. Configuration du cron job

Pour configurer un cron job externe (comme cron.org) :

- URL: `https://votre-app.vercel.app/api/cron-secure?key=VOTRE_CLE_API`
- OU ajoutez l'en-tête: `x-api-key: VOTRE_CLE_API`

### 5. Installation

```bash
npm install
```

### 6. Démarrage

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
