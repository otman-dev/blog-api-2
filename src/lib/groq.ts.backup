import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface PostGenerationRequest {
  topic?: string;
  category?: string;
}

export interface GeneratedPost {
  title: string;
  content: string;
  excerpt: string;
  categories: string[];
  tags: string[];
}

// Practical engineering topics focused on tutorials, setups, and problem-solving
const TECH_TOPICS = [
  "Setup complet d'un pipeline CI/CD avec GitHub Actions et Docker",
  "Configuration de Kubernetes avec Helm : guide étape par étape",
  "Debugging des applications React avec Chrome DevTools avancés",
  "Optimisation des performances PostgreSQL en production",
  "Setup d'un monitoring complet avec Prometheus et Grafana",
  "Migration d'une API REST vers GraphQL : étapes pratiques",
  "Configuration SSL/TLS et sécurisation d'une API Node.js",
  "Setup d'un environnement de développement avec Docker Compose",
  "Implémentation du caching Redis pour améliorer les performances",
  "Configuration d'un cluster Elasticsearch pour la recherche",
  "Setup d'authentication OAuth2 avec JWT dans Express.js",
  "Déploiement automatisé sur AWS avec Terraform",
  "Configuration de tests automatisés avec Jest et Cypress",
  "Setup d'un projet TypeScript avec ESLint et Prettier",
  "Debugging des memory leaks en Node.js avec clinic.js",
  "Configuration de Web Workers pour les calculs intensifs",
  "Setup d'un serveur WebSocket avec Socket.io en production",
  "Optimisation du bundle Webpack pour réduire la taille",
  "Configuration de hot reloading avec Vite et React",
  "Setup d'une base de données MongoDB avec replica sets",
  "Debugging des problèmes de performance avec Lighthouse",
  "Configuration d'un reverse proxy Nginx pour microservices",
  "Setup d'un environnement de test avec Testcontainers",
  "Migration vers TypeScript dans un projet JavaScript existant",
  "Configuration d'un CDN CloudFlare pour optimiser les assets"
];

const CATEGORIES = [
  "Tutorials & Setup",
  "DevOps & CI/CD", 
  "Performance & Debugging",
  "Security & Authentication",
  "Database & Backend",
  "Frontend & Tools",
  "Cloud & Infrastructure"
];

function getSpecificAngle(topic: string): string {
  const angles: { [key: string]: string } = {
    "Setup complet d'un pipeline CI/CD": "Guide step-by-step avec GitHub Actions, tests automatisés, déploiement Docker, rollback strategies",
    "Configuration de Kubernetes avec Helm": "Installation kubectl, configuration cluster, création charts, debugging pods, scaling horizontal",
    "Debugging des applications React": "Chrome DevTools, React Developer Tools, memory profiling, performance tab, network analysis",
    "Optimisation des performances PostgreSQL": "Index optimization, query analysis avec EXPLAIN, connection pooling, vacuum strategies",
    "Setup d'un monitoring complet": "Installation Prometheus, configuration metrics, création dashboards Grafana, alerting rules",
    "Migration d'une API REST vers GraphQL": "Schema design, resolvers implementation, DataLoader pattern, error handling, testing",
    "Configuration SSL/TLS et sécurisation": "Certificats Let's Encrypt, HTTPS setup, rate limiting, helmet.js, CORS configuration",
    "Setup d'un environnement de développement": "Docker Compose multi-services, hot reloading, debugging containers, volumes mounting",
    "Implémentation du caching Redis": "Installation Redis, connection pooling, cache strategies, TTL management, cluster setup",
    "Configuration d'un cluster Elasticsearch": "Installation cluster, mapping configuration, search queries, aggregations, monitoring",
    "Setup d'authentication OAuth2": "JWT implementation, refresh tokens, middleware protection, password hashing, session management",
    "Déploiement automatisé sur AWS": "Terraform scripts, EC2 provisioning, load balancer setup, RDS configuration, monitoring",
    "Configuration de tests automatisés": "Jest unit tests, Cypress E2E, test coverage, mocking strategies, CI integration",
    "Setup d'un projet TypeScript": "tsconfig.json configuration, ESLint rules, Prettier setup, build optimization, debugging",
    "Debugging des memory leaks": "clinic.js tools, heap snapshots analysis, event loop monitoring, memory profiling techniques",
    "Configuration de Web Workers": "Worker scripts creation, message passing, shared memory, performance comparisons, debugging",
    "Setup d'un serveur WebSocket": "Socket.io configuration, real-time events, room management, scaling strategies, monitoring",
    "Optimisation du bundle Webpack": "Code splitting, tree shaking, lazy loading, bundle analysis, performance optimization",
    "Configuration de hot reloading": "Vite setup, HMR configuration, proxy settings, environment variables, debugging tools",
    "Setup d'une base de données MongoDB": "Replica set configuration, sharding strategies, indexing optimization, backup strategies",
    "Debugging des problèmes de performance": "Lighthouse audits, Core Web Vitals, performance profiling, optimization techniques",
    "Configuration d'un reverse proxy Nginx": "Load balancing, SSL termination, caching rules, security headers, monitoring",
    "Setup d'un environnement de test": "Testcontainers configuration, database testing, integration tests, mock services",
    "Migration vers TypeScript": "Incremental migration strategy, type definitions, refactoring patterns, tooling setup",
    "Configuration d'un CDN CloudFlare": "DNS setup, caching rules, security settings, performance optimization, monitoring"
  };
  
  // Find matching angle by checking if topic contains key words
  for (const [key, angle] of Object.entries(angles)) {
    if (topic.toLowerCase().includes(key.toLowerCase().split(' ')[0]) || 
        topic.toLowerCase().includes(key.toLowerCase().split(' ')[1])) {
      return angle;
    }
  }
  
  return `Guide pratique step-by-step pour ${topic} avec exemples de code, configuration complète et troubleshooting`;
}

export async function generateRandomPost(): Promise<GeneratedPost> {
  // Select random topic and category
  const randomTopic = TECH_TOPICS[Math.floor(Math.random() * TECH_TOPICS.length)];
  const randomCategory = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];  const prompt = `Créez un TUTORIAL PRATIQUE complet sur "${randomTopic}" pour des ingénieurs logiciels.

OBJECTIF: L'ingénieur doit pouvoir suivre le guide et avoir un système fonctionnel à la fin.

CONTRAINTES TECHNIQUES STRICTES:
- Retournez UNIQUEMENT du JSON valide
- Utilisez \\n pour les retours à la ligne dans les strings
- Échappez tous les guillemets avec \\"
- N'utilisez JAMAIS de vraies nouvelles lignes dans les valeurs JSON
- Testez mentalement que votre JSON peut être parsé

FORMAT OBLIGATOIRE:
{
  "title": "${randomTopic}: Tutorial Complet",
  "content": "# ${randomTopic}\\n\\n## TL;DR\\nTutorial step-by-step pour ${randomTopic}. Suivez ce guide et obtenez un système fonctionnel en 30 minutes.\\n\\n## Prérequis\\n- Liste exacte des outils et versions nécessaires\\n- Commandes de vérification d'installation\\n\\n## Étape 1: Installation et Setup Initial\\n\`\`\`bash\\n# Commandes d'installation exactes\\n\`\`\`\\n\\n## Étape 2: Configuration de Base\\n\`\`\`yaml\\n# Fichiers de configuration complets\\n\`\`\`\\n\\n## Étape 3: Implémentation Core\\n\`\`\`javascript\\n// Code source fonctionnel et testé\\n\`\`\`\\n\\n## Étape 4: Tests et Validation\\n\`\`\`bash\\n# Commandes pour tester que tout fonctionne\\n\`\`\`\\n\\n## Étape 5: Optimisation et Production\\n- Bonnes pratiques de sécurité\\n- Configuration de monitoring\\n- Gestion des erreurs\\n\\n## Troubleshooting\\n- Erreurs communes et solutions\\n- Commandes de debugging\\n- Métriques à surveiller\\n\\n## Next Steps\\n- Fonctionnalités avancées à ajouter\\n- Ressources pour aller plus loin",
  "excerpt": "Tutorial step-by-step pour ${randomTopic}. Suivez ce guide et obtenez un système fonctionnel en 30 minutes.",
  "categories": ["${randomCategory}"],
  "tags": ["tutorial", "setup", "guide", "step-by-step", "practical"]
}

CONTRAINTES TECHNIQUES:
- Code source COMPLET et FONCTIONNEL (pas de "..." ou placeholder)
- Commandes CLI exactes et testées
- Fichiers de configuration complets
- Versions spécifiques des outils
- Troubleshooting avec solutions concrètes
- Métriques mesurables (temps d'exécution, memory usage, etc.)

FOCUS: ${getSpecificAngle(randomTopic)}

IMPORTANT: Retournez UNIQUEMENT le JSON valide, sans markdown, sans texte supplémentaire.`;
  
  // Try multiple models in case one fails
  const models = [
    "meta-llama/llama-4-scout-17b-16e-instruct",    // Latest Llama 4 - 30k tokens/min (No daily limit)
    "meta-llama/llama-4-maverick-17b-128e-instruct", // Latest Llama 4 - 6k tokens/min (No daily limit)
    "llama-3.3-70b-versatile",                       // Llama 3.3 70B - 12k tokens/min, 100k/day
    "deepseek-r1-distill-llama-70b",                 // DeepSeek R1 - 6k tokens/min (No daily limit)
    "compound-beta",                                  // Compound Beta - 70k tokens/min (No daily limit)
    "llama3-70b-8192",                               // Llama 3 70B - 6k tokens/min, 500k/day
    "gemma2-9b-it",                                  // Gemma 2 - 15k tokens/min, 500k/day
    "llama-3.1-8b-instant",                         // Fast Llama 3.1 - 6k tokens/min, 500k/day
    "llama3-8b-8192"                                 // Llama 3 8B - 6k tokens/min, 500k/day
  ];

  for (const model of models) {
    try {
      console.log(`🔄 Trying model: ${model}`);
      
      const completion = await groq.chat.completions.create({        messages: [
          {
            role: "system",
            content: "You are a Senior DevOps Engineer who writes practical tutorials. Your tutorials are so good that engineers bookmark them immediately. You provide COMPLETE working code, exact commands, and step-by-step instructions. Engineers can follow your guides and have working systems in 30 minutes. CRITICAL: You ONLY return valid JSON without any markdown formatting or extra text. Use \\n for newlines in JSON strings, escape all quotes with \\\" and never use literal newlines inside JSON string values."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: model,
        temperature: 0.7,
        max_tokens: 8000,  // Increased for longer content
      });

      const response = completion.choices[0]?.message?.content;
        if (!response) {
        throw new Error(`No response from Groq API with model ${model}`);
      }      console.log(`📝 Raw response from ${model}:`, response.substring(0, 200) + '...');      // Extract JSON from response and clean it properly
      console.log(`🧹 Starting JSON cleanup for ${model}...`);
      
      // Remove markdown code blocks if present
      let jsonString = response;
      if (jsonString.includes('```json')) {
        jsonString = jsonString.replace(/```json\s*/g, '').replace(/\s*```/g, '');
      }
      if (jsonString.includes('```')) {
        jsonString = jsonString.replace(/```\s*/g, '').replace(/\s*```/g, '');
      }
      
      // Find the first { and last } to extract just the JSON object
      const firstBrace = jsonString.indexOf('{');
      const lastBrace = jsonString.lastIndexOf('}');
      
      if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
        console.error(`❌ No valid JSON structure found in response from ${model}`);
        continue;
      }
      
      jsonString = jsonString.substring(firstBrace, lastBrace + 1);
      
      // Clean control characters and normalize line endings
      jsonString = jsonString
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Remove control characters
      
      // Fix common JSON syntax issues
      jsonString = jsonString
        .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
        .replace(/([{,]\s*)(\w+)(\s*):/g, '$1"$2"$3:') // Quote unquoted keys
        .trim();
        
      console.log(`🧹 Cleaned JSON for ${model}:`, jsonString.substring(0, 200) + '...');
      
      let blogData: GeneratedPost;
      try {
        blogData = JSON.parse(jsonString) as GeneratedPost;
        console.log(`✅ Successfully parsed JSON for ${model}`);
      } catch (parseError) {
        console.error(`JSON parse error for ${model}:`, parseError);
        
        // Advanced JSON repair attempt
        try {
          const repairedJson = repairBrokenJSON(jsonString);
          blogData = JSON.parse(repairedJson) as GeneratedPost;
          console.log(`✅ Repaired and parsed JSON for ${model}`);
        } catch (repairError) {
          console.error(`JSON repair failed for ${model}:`, repairError);
          console.error(`Raw response causing parse error:`, response.substring(0, 1000) + '...');
          continue; // Try next model
        }
      }
      
      // Validate the response structure
      if (!blogData.title || !blogData.content || !blogData.excerpt) {
        throw new Error(`Invalid response structure from model ${model}`);
      }

      // Ensure categories and tags are arrays
      if (!Array.isArray(blogData.categories)) {
        blogData.categories = [randomCategory];
      }
      if (!Array.isArray(blogData.tags)) {
        blogData.tags = ["Développement", "Tech", "Innovation"];
      }

      console.log(`✅ Successfully generated post with model: ${model}`);
      return blogData;

    } catch (error) {
      console.error(`❌ Error with model ${model}:`, error);
      // Continue to next model
    }
  }

  // If all models fail, throw error
  throw new Error('Failed to generate blog content with any available model');
}

/**
 * Helper function to fix multiline strings within JSON
 * Properly escapes newlines that appear inside string values
 */
function fixMultilineStringsInJSON(jsonString: string): string {
  // This regex finds string values that contain unescaped newlines
  // and properly escapes them while preserving the JSON structure
  let fixed = jsonString;
  
  // Split by lines and process each line to handle multiline strings
  const lines = fixed.split('\n');
  let insideString = false;
  let stringDelimiter = '';
  let result: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let processedLine = '';
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      const prevChar = j > 0 ? line[j - 1] : '';
      
      if (!insideString) {
        if (char === '"' && prevChar !== '\\') {
          insideString = true;
          stringDelimiter = char;
        }
        processedLine += char;
      } else {
        if (char === stringDelimiter && prevChar !== '\\') {
          insideString = false;
          stringDelimiter = '';
        }
        processedLine += char;
      }
    }
    
    // If we're inside a string and this line ends, we need to escape the newline
    if (insideString && i < lines.length - 1) {
      processedLine += '\\n';
    } else {
      result.push(processedLine);
    }
    
    if (!insideString) {
      result.push(processedLine);
    }
  }
  
  return result.join('\n');
}

/**
 * Advanced JSON repair function for common syntax issues
 */
function repairBrokenJSON(jsonString: string): string {
  let repaired = jsonString;
  
  try {
    // Step 1: Fix unescaped newlines in string values
    repaired = repaired.replace(/"([^"]*)\n([^"]*)"(?=\s*[,\]}])/g, (match, before, after) => {
      return `"${before}\\n${after}"`;
    });
    
    // Step 2: Fix unescaped quotes within string values
    repaired = repaired.replace(/"([^"]*)"([^"]*)"([^"]*)"(?=\s*[,\]}])/g, '"$1\\"$2\\"$3"');
    
    // Step 3: Fix unescaped tabs and other whitespace
    repaired = repaired.replace(/\t/g, '\\t');
    
    // Step 4: Fix multiline string values that span multiple lines
    repaired = repaired.replace(/"([^"]*(?:\n[^"]*)*)"(?=\s*[,\]}])/g, (match, content) => {
      const escapedContent = content
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"');
      return `"${escapedContent}"`;
    });
    
    // Step 5: Remove any remaining control characters
    repaired = repaired.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
    // Step 6: Fix trailing commas
    repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
    
    // Step 7: Ensure proper JSON structure
    if (!repaired.trim().startsWith('{')) {
      repaired = '{' + repaired;
    }
    if (!repaired.trim().endsWith('}')) {
      repaired = repaired + '}';
    }
    
    return repaired;
  } catch (error) {
    console.error('Error in repairBrokenJSON:', error);
    return jsonString; // Return original if repair fails
  }
}
