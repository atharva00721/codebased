"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { Message, UserProfile } from "./types";
import { getCodeSegment } from "./utils";
import { getUserProfile } from "@/app/actions/user";
// Import server actions directly
import {
  checkRagInitializationStatus,
  initializeRepositoryRagAction,
  queryRepositoryRagAction,
} from "@/app/actions/rag";

import { EmptyChat } from "./_components/EmptyChat";
import { ChatMessage } from "./_components/ChatMessage";
import { MessageInput } from "./_components/MessageInput";
import useProject from "@/hooks/useProject";
import { InitializationScreen } from "./_components/InitializationScreen";

export default function ChatPage() {
  // Fix property name from isLoading to loading
  const { projectId, loading: isProjectLoading } = useProject();

  // Get current user from Clerk
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Store chat history for context
  const chatHistoryRef = useRef<Message[]>([]);

  // Fetch user profile from database
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isClerkLoaded || !clerkUser) return;

      setIsLoadingProfile(true);
      try {
        const userData = await getUserProfile();
        if (!userData) {
          throw new Error("No user data returned");
        }
        setUserProfile(userData);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        // If DB fetch fails, use Clerk data as fallback
        setUserProfile({
          id: clerkUser.id,
          firstName: clerkUser.firstName || "",
          lastName: clerkUser.lastName || "",
          emailAddress: clerkUser.emailAddresses[0]?.emailAddress || "",
          imageUrl: clerkUser.imageUrl,
          credits: 0,
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [clerkUser, isClerkLoaded]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // When messages change, update the chat history reference
  useEffect(() => {
    // Filter out messages with empty content and store the last 10 messages for context
    chatHistoryRef.current = messages
      .filter((msg) => msg.content.trim() !== "")
      .slice(-10);
  }, [messages]);

  // Check if RAG is initialized for this project
  useEffect(() => {
    const checkInitialization = async () => {
      if (!projectId) return; // Don't make API calls if no projectId

      try {
        // Use server action directly instead of API call
        const data = await checkRagInitializationStatus(projectId);
        setIsInitialized(data.initialized);
      } catch (error) {
        console.error("Failed to check initialization status:", error);
        toast("Error", {
          description: "Failed to check project initialization status.",
        });
      }
    };

    if (projectId && !isProjectLoading) {
      checkInitialization();
    }
  }, [projectId, isProjectLoading]);

  // Initialize RAG for the project
  const initializeRAG = async () => {
    if (isInitializing || !projectId) return;

    setIsInitializing(true);
    try {
      // Use server action directly instead of API call
      const result = await initializeRepositoryRagAction(projectId);

      if (result.success) {
        setIsInitialized(true);
        toast("Repository initialized", {
          description: `${result.newEmbeddings} new embeddings created.`,
        });
        setMessages([
          {
            role: "assistant",
            content:
              "I've analyzed your repository and I'm ready to answer questions about your code.",
            timestamp: new Date(),
          },
        ]);
      } else {
        toast("Failed to initialize", {
          description: result.message || "Unknown error occurred",
        });
      }
    } catch (error) {
      console.error("Error initializing RAG:", error);
      toast("Error", {
        description: "Failed to initialize repository for RAG.",
      });
    } finally {
      setIsInitializing(false);
    }
  };

  // Submit message and get AI response - optimized version
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading || !projectId) return;

    // Add user message
    const userMessage: Message = {
      role: "user",
      content: input.trim(), // Ensure content is trimmed
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Generate a unique ID for the streaming message
    const streamingMessageId = crypto.randomUUID?.() || `msg-${Date.now()}`;

    // Add initial empty assistant message for streaming
    const initialAiMessage: Message = {
      id: streamingMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, initialAiMessage]);

    try {
      // Format message history for API
      const messageHistory = chatHistoryRef.current.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // NOTE: Keep using the streaming API endpoint for streaming responses
      // Server actions don't support streaming responses out of the box yet
      const response = await fetch("/api/rag/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          query: input.trim(),
          messageHistory,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(
          !response.ok ? "API response error" : "Stream not supported"
        );
      }

      // Read the stream with optimized parsing
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";
      let sources = [];
      let lastUpdateTime = Date.now();
      const updateInterval = 100; // Update UI at most every 100ms

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        try {
          // Check if the chunk is a special message indicating sources
          if (chunk.includes("__SOURCES__:")) {
            const parts = chunk.split("__SOURCES__:");
            if (parts[0]) accumulatedContent += parts[0];

            if (parts[1]) {
              sources = JSON.parse(parts[1]);
            }
            continue;
          }

          // Otherwise treat it as regular content
          accumulatedContent += chunk;

          // Throttle UI updates for better performance
          const now = Date.now();
          if (now - lastUpdateTime >= updateInterval) {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === streamingMessageId
                  ? { ...msg, content: accumulatedContent }
                  : msg
              )
            );
            lastUpdateTime = now;
          }
        } catch (e) {
          console.error("Error parsing chunk:", e);
        }
      }

      // Final update with complete message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === streamingMessageId
            ? {
                ...msg,
                content: accumulatedContent,
                sources,
                isStreaming: false,
              }
            : msg
        )
      );
    } catch (error) {
      console.error("Error querying RAG:", error);
      toast("Error", {
        description: "Failed to get a response. Please try again.",
      });

      // Remove the streaming message on error
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== streamingMessageId)
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Add a function to clear chat history
  const clearChat = async () => {
    if (isLoading || !projectId) return;

    setMessages([]);

    // Note: You'll need to implement a clearChatHistory server action
    try {
      // This would be replaced with a direct server action call
      // await clearChatHistoryAction(projectId);

      // Keep using the API for now since we haven't created the server action yet
      await fetch("/api/rag/clear-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      // Add welcome message
      setMessages([
        {
          role: "assistant",
          content: "Chat history cleared. How can I help you with your code?",
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Error clearing chat history:", error);
      toast("Error", {
        description: "Failed to clear chat history.",
      });
    }
  };

  // Helper to get code segments
  const getCodeSegmentHelper = (
    messageIndex: number,
    sourceIndex: number,
    segmentIndex = 0
  ) => {
    const result = getCodeSegment(
      messages,
      messageIndex,
      sourceIndex,
      segmentIndex
    );
    return result === undefined ? "" : result;
  };

  // Show loading state while project is loading
  if (isProjectLoading) {
    return (
      <div className="w-full h-[calc(100vh-8rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading project...</span>
      </div>
    );
  }

  // Show error if no project is found
  if (!projectId && !isProjectLoading) {
    return (
      <div className="w-full h-[calc(100vh-8rem)] flex items-center justify-center flex-col">
        <div className="text-xl font-medium mb-2">Project Not Found</div>
        <p className="text-muted-foreground">
          Could not find the requested project. Please check the URL and try
          again.
        </p>
      </div>
    );
  }

  // Main rendering logic
  if (!isInitialized) {
    return (
      <InitializationScreen
        initializeRAG={initializeRAG}
        isInitializing={isInitializing}
      />
    );
  }

  return (
    <div className="w-full h-[calc(100vh-8rem)]">
      <div className="flex flex-col h-full mx-auto">
        <div className="flex-1 w-full overflow-y-auto px-4 sm:px-6 md:px-8 py-2">
          <div className="space-y-8 h-full pb-4">
            {messages.length === 0 ? (
              <EmptyChat setInput={setInput} handleSubmit={handleSubmit} />
            ) : (
              messages.map((message, index) => (
                <ChatMessage
                  key={`${message.id || index}-${index}`}
                  message={message}
                  index={index}
                  userProfile={userProfile}
                  clerkUser={clerkUser || null}
                  getCodeSegment={getCodeSegmentHelper}
                />
              ))
            )}
            {isLoading && !messages.some((msg) => msg.isStreaming) && (
              <div className="flex justify-center my-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <MessageInput
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          clearChat={clearChat}
          showClearChat={messages.length > 1}
          userProfile={userProfile}
          isLoadingProfile={isLoadingProfile}
        />
      </div>
    </div>
  );
}
