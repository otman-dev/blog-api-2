# Migration from Hardcoded Prompts to Knowledge Base

## Overview

This migration transforms the current hardcoded prompt system in `groq.ts` into a modular, scalable knowledge base system.

## Current State Analysis

### Identified Issues in Current Implementation
1. **Hardcoded topics**: 25+ topics embedded directly in code
2. **Static prompt structure**: Single massive prompt string
3. **Hardcoded model fallbacks**: Model list embedded in generation function
4. **No content type variation**: Only supports tutorial format
5. **Limited scalability**: Adding new topics requires code changes

### Current Assets to Preserve
- ✅ Robust JSON parsing and error handling
- ✅ Multi-model fallback system
- ✅ Englishlanguage focus for practical tutorials
- ✅ Strong technical focus on DevOps/Engineering topics
- ✅ Detailed troubleshooting and complete code examples

## Migration Steps

### Phase 1: Extract and Externalize Data ✅
- [x] Extract topics to `knowledge-base/topics/tech-topics.json`
- [x] Extract categories to `knowledge-base/categories/categories.json`
- [x] Extract models config to `knowledge-base/models/groq-models.json`
- [x] Create base prompt template structure

### Phase 2: Create Knowledge Base Service
Create new service layer to:
- Load topics and categories from JSON files
- Build prompts dynamically from templates
- Handle model selection based on content type
- Validate output against schemas

### Phase 3: Refactor `groq.ts`
Transform the monolithic generation function:
1. Replace hardcoded arrays with knowledge base loader
2. Replace static prompt with dynamic template system
3. Maintain existing error handling and JSON parsing
4. Add validation against output schemas

### Phase 4: Add New Content Types
Extend system with:
- Product review templates
- News article templates
- Opinion piece templates
- Technical deep-dive templates

## Files to Create

### Phase 2 Files
```
src/lib/knowledgeBase/
├── index.ts                    # Main knowledge base service
├── topicLoader.ts             # Load and filter topics
├── promptBuilder.ts           # Build prompts from templates
├── modelSelector.ts           # Smart model selection
└── outputValidator.ts         # Validate generated content
```

### Phase 3 Changes
- Update `src/lib/groq.ts` to use knowledge base service
- Maintain backward compatibility
- Add new features gradually

## Implementation Priority

1. **High Priority**: Phase 2 - Create knowledge base service
2. **Medium Priority**: Phase 3 - Refactor groq.ts
3. **Low Priority**: Phase 4 - Add new content types

## Benefits After Migration

- **Scalability**: Add new topics via JSON files
- **Maintainability**: Separate concerns and modular code
- **Testability**: Each component can be unit tested
- **Flexibility**: Easy to add new content types and formats
- **Quality Control**: Schema validation ensures consistent output

## Testing Strategy

1. **Unit Tests**: Test each knowledge base component
2. **Integration Tests**: Test complete generation pipeline
3. **Content Quality Tests**: Validate generated content meets standards
4. **Performance Tests**: Ensure migration doesn't slow down generation

## Rollback Plan

- Keep original `groq.ts` as `groq.legacy.ts`
- Feature flag to switch between old and new systems
- Gradual migration with A/B testing
