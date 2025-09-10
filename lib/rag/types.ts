/**
 * RAG (Retrieval-Augmented Generation) types and interfaces
 * Prepared for future implementation
 */

export interface Document {
  id: string
  content: string
  metadata: {
    source?: string
    title?: string
    author?: string
    createdAt?: Date
    updatedAt?: Date
    tags?: string[]
    category?: string
  }
  embeddings?: number[]
}

export interface SearchResult {
  document: Document
  score: number
  highlights?: string[]
}

export interface RetrievalConfig {
  topK: number
  similarityThreshold: number
  includeMetadata: boolean
  rerankResults: boolean
}

export interface VectorStore {
  addDocuments(documents: Document[]): Promise<void>
  search(query: string, config?: Partial<RetrievalConfig>): Promise<SearchResult[]>
  deleteDocument(id: string): Promise<void>
  updateDocument(document: Document): Promise<void>
  getDocument(id: string): Promise<Document | null>
}

export interface EmbeddingProvider {
  generateEmbeddings(texts: string[]): Promise<number[][]>
  generateEmbedding(text: string): Promise<number[]>
  dimensions: number
}

export interface RAGPipeline {
  vectorStore: VectorStore
  embeddingProvider: EmbeddingProvider
  config: RetrievalConfig

  addDocuments(documents: Document[]): Promise<void>
  search(query: string): Promise<SearchResult[]>
  retrieveRelevantContext(query: string): Promise<string>
  updateConfig(config: Partial<RetrievalConfig>): void
}

// Default configurations
export const DEFAULT_RETRIEVAL_CONFIG: RetrievalConfig = {
  topK: 5,
  similarityThreshold: 0.7,
  includeMetadata: true,
  rerankResults: false
}

// Document processing utilities
export interface DocumentProcessor {
  processFile(file: File): Promise<Document[]>
  processText(text: string, metadata?: Partial<Document['metadata']>): Document
  processDirectory(directoryPath: string): Promise<Document[]>
}

// Chunking strategies
export interface ChunkingStrategy {
  splitDocument(document: Document): Document[]
  maxChunkSize: number
  overlapSize: number
}

export const DEFAULT_CHUNKING_CONFIG = {
  maxChunkSize: 1000,
  overlapSize: 200
}
