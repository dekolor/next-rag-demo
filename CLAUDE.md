# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

Essential commands for development:

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run test         # Run Playwright tests

# Database & Data
npm run ingest       # Ingest Next.js documentation into vector database
npx prisma generate  # Generate Prisma client (runs automatically on postinstall)
npx prisma migrate dev  # Apply database migrations
npx prisma studio    # Open Prisma Studio for database management
```

## Architecture Overview

This is a Next.js 15 RAG (Retrieval-Augmented Generation) application that lets users ask questions about Next.js documentation. It demonstrates:

### Core Components

1. **Vector Database Setup (PostgreSQL + pgvector)**
   - Uses Prisma with PostgreSQL and pgvector extension
   - Stores document chunks as embeddings for semantic search
   - Generated Prisma client at `src/generated/prisma/`

2. **RAG Pipeline**
   - `src/lib/rag.ts`: Core retrieval and prompt building logic
   - `src/lib/embeddings.ts`: OpenAI embeddings integration
   - `src/scripts/ingest.ts`: Document ingestion from markdown files

3. **Chat Interface**
   - `src/app/page.tsx`: Main chat interface using AI SDK React
   - `src/app/api/chat/route.ts`: Streaming chat API endpoint
   - `src/app/api/chat/history/route.ts`: Chat history management
   - `src/components/message.tsx`: Message display component

4. **Session Management**
   - `src/middleware/session.ts`: JWT-based session handling
   - Chat history persisted to database per session

### Key Dependencies

- **AI SDK**: `@ai-sdk/react` and `@ai-sdk/openai` for chat interface and LLM integration
- **Database**: Prisma with PostgreSQL and pgvector for vector storage
- **UI**: Radix UI components, Tailwind CSS for styling
- **Testing**: Playwright for end-to-end testing

### Data Flow

1. User submits question via chat interface
2. Question is embedded using OpenAI embeddings
3. Vector similarity search retrieves relevant documentation chunks
4. LLM generates response with citations using retrieved context
5. Response is streamed back to user and saved to database

## Environment Variables

Required environment variables (see `.env.example`):

- `OPENAI_API_KEY`: OpenAI API key for embeddings
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_EMBEDDING_MODEL`: Embedding model (default: text-embedding-3-small)
- `OPENROUTER_BASE_URL`: OpenRouter API base URL
- `OPENROUTER_API_KEY`: OpenRouter API key
- `OPENROUTER_MODEL`: LLM model for chat responses

## Database Schema

Key models:
- `Chunk`: Document chunks with embeddings for vector search
- `ChatSession`: User chat sessions with UUID
- `Message`: Individual messages linked to sessions

## Testing

- Playwright tests in `tests/` directory
- Tests verify chat functionality and citation generation
- Run with `npm run test`

## File Structure Notes

- `public/docs/`: Contains Next.js documentation markdown files for ingestion
- `src/generated/prisma/`: Auto-generated Prisma client (don't edit)
- TypeScript path alias `@/*` maps to `src/*`
- ESLint configured to ignore generated files and documentation