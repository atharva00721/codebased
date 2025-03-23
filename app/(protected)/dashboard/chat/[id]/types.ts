export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  imageUrl?: string | null;
  credits: number;
}

export interface ClerkUser {
  id?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  emailAddresses?: Array<{
    emailAddress: string;
  }>;
}

export interface Source {
  fileName: string;
  similarity: number;
  relevantSegments?: {
    lineStart: number;
    lineEnd: number;
    segment: string;
    code?: string;
    content?: string;
    text?: string;
  }[];
  sourceCode?: string;
}

export interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: Source[];
  isStreaming?: boolean;
}
