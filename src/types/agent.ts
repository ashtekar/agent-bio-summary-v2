export interface AgentContext {
  // Database context
  searchSettings: SearchSettings;
  systemSettings: SystemSettings;
  recipients: EmailRecipient[];
  
  // Runtime context
  sessionId: string;
  startTime: Date;
  currentStep: string;
  
  // Processing context
  foundArticles: Article[];
  filteredArticles: Article[];
  storedArticles: Article[];
  summaries: ArticleSummary[];
  finalSummary: string;
  
  // Error context
  errors: Error[];
  retryCount: number;
  lastSuccessfulStep: string;
}

export interface SearchSettings {
  query: string;
  maxResults: number;
  dateRange: string;
  sources: string[];
}

export interface SystemSettings {
  summaryLength: number;
  targetAudience: string;
  includeCitations: boolean;
  emailTemplate: string;
  llmModel: string;
  llmTemperature: number;
  llmMaxTokens: number;
  relevancyThreshold?: number; // Optional threshold for article relevancy scoring (default: 0.2)
}

export interface EmailRecipient {
  email: string;
  name: string;
  preferences: {
    frequency: string;
    format: string;
  };
}

export interface Article {
  id: string;
  title: string;
  url: string;
  content: string;
  publishedDate: Date;
  source: string;
  relevancyScore: number;
  summary?: string;
}

export interface ArticleSummary {
  articleId: string;
  summary: string;
  keyPoints: string[];
  qualityScore: number;
  evaluationResults: EvaluationResult;
}

export interface EvaluationResult {
  coherence: number;
  accuracy: number;
  completeness: number;
  readability: number;
  overallScore: number;
  feedback: string;
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    executionTime: number;
    cost: number;
    tokens: number;
    [key: string]: any; // Allow additional metadata fields for tool-specific data
  };
}
