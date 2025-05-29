# Migration Guide: From Hardcoded Prompts to Knowledge Base

## Overview

This guide helps you migrate from the current hardcoded prompt system in `groq.ts` to the new modular knowledge base system.

## What's Been Created

### Knowledge Base Structure
```
knowledge-base/
├── topics/tech-topics.json          # All topics with metadata
├── categories/categories.json       # Category definitions
├── models/groq-models.json         # Model configurations
├── prompts/base-tutorial-template.md # Prompt templates
├── output-formats/tutorial-schema.json # Output validation
└── migration/migration-plan.md     # Detailed migration plan
```

### New Services
```
src/lib/knowledgeBase/
├── index.ts           # Main knowledge base service
├── loader.ts          # Load data from JSON files
└── promptBuilder.ts   # Build prompts dynamically
```

### Migration Files
- `src/lib/groqWithKnowledgeBase.ts` - New Groq implementation
- `knowledge-base/migration/migrate.ts` - Migration helper script

## Quick Migration Steps

### 1. Test the Knowledge Base System
```bash
# Make sure all files are in place
ls knowledge-base/topics/tech-topics.json
ls knowledge-base/categories/categories.json
ls src/lib/knowledgeBase/index.ts
```

### 2. Update Your Auto Post Service
In `src/lib/autoPostService.ts`, change the import:

```typescript
// OLD
import { generateRandomPost } from './groq';

// NEW  
import { generateRandomPost } from './groqWithKnowledgeBase';
```

### 3. Test the New System
Try generating a post to make sure everything works:

```typescript
import { generateRandomPost } from './groqWithKnowledgeBase';

// This should work exactly like before
const post = await generateRandomPost();
console.log(post.title);
```

### 4. Backup Your Original groq.ts
```bash
cp src/lib/groq.ts src/lib/groq.ts.backup
```

## Benefits of the New System

### Before (Hardcoded)
- ❌ 25+ topics hardcoded in arrays
- ❌ Single massive prompt string
- ❌ Hard to add new content types
- ❌ No validation of generated content
- ❌ Model configuration scattered

### After (Knowledge Base)
- ✅ Topics stored in structured JSON
- ✅ Modular prompt templates
- ✅ Easy to add new categories/topics
- ✅ Schema validation for outputs
- ✅ Centralized model configuration
- ✅ Better maintainability and testing

## Using the New System

### Generate Random Post (Drop-in Replacement)
```typescript
import { generateRandomPost } from './groqWithKnowledgeBase';
const post = await generateRandomPost();
```

### Generate Specific Topic
```typescript
import { generatePostWithKnowledgeBase } from './groqWithKnowledgeBase';

const post = await generatePostWithKnowledgeBase({
  options: {
    topicId: 'kubernetes-helm',
    customInstructions: 'Focus on production deployment'
  }
});
```

### Browse Available Content
```typescript
import { KnowledgeBaseService } from './knowledgeBase';

const kb = KnowledgeBaseService.getInstance();
const topics = kb.getAvailableTopics();
const stats = kb.getKnowledgeBaseStats();
```

## Adding New Content

### Add a New Topic
Edit `knowledge-base/topics/tech-topics.json`:
```json
{
  "id": "my-new-topic",
  "topic": "Your New Topic Title",
  "category": "DevOps & CI/CD",
  "angle": "Specific implementation approach",
  "keywords": ["keyword1", "keyword2"],
  "difficulty": "intermediate",
  "timeToComplete": "30 minutes",
  "tools": ["tool1", "tool2"]
}
```

### Add a New Category
Edit `knowledge-base/categories/categories.json`:
```json
{
  "id": "new-category",
  "name": "New Category Name",
  "description": "What this category covers",
  "targetAudience": "Who should read this",
  "contentStyle": "How content should be written",
  "averageLength": "2000-3000 words",
  "requiredSections": ["Section 1", "Section 2"]
}
```

## Rollback Plan

If you need to rollback:

1. Restore the import in `autoPostService.ts`:
```typescript
import { generateRandomPost } from './groq';
```

2. Use your backup:
```bash
cp src/lib/groq.ts.backup src/lib/groq.ts
```

## Troubleshooting

### "Cannot find module" errors
- Make sure all files in `src/lib/knowledgeBase/` exist
- Check that JSON files in `knowledge-base/` are valid JSON

### "No topics found" errors
- Verify `knowledge-base/topics/tech-topics.json` exists and is valid
- Check file permissions

### Generation still fails
- The new system uses the same error handling as before
- Check your `GROQ_API_KEY` environment variable
- Review the console logs for specific model errors

## Next Steps

1. **Test thoroughly** - Generate several posts to ensure quality
2. **Add more topics** - Expand your topic database
3. **Create new content types** - Add review templates, news articles, etc.
4. **Monitor performance** - The new system should be as fast as before
5. **Remove old code** - After confirming everything works, delete `groq.ts.backup`
