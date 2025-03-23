import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Message, UserProfile } from "../types";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileCode, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { CodeBlock, atomOneDark } from "react-code-blocks";
import { CodeSource } from "./CodeSource";
import { useState, useMemo } from "react";

interface ChatMessageProps {
  message: Message;
  index: number;
  userProfile: UserProfile | null;
  clerkUser: any;
  getCodeSegment: (
    messageIndex: number,
    sourceIndex: number,
    segmentIndex?: number
  ) => string;
}

// Fix: Export as a regular function component instead of using memo directly
export function ChatMessage({
  message,
  index,
  userProfile,
  clerkUser,
  getCodeSegment,
}: ChatMessageProps) {
  const [activeSource, setActiveSource] = useState<number | null>(null);
  const [expandedSources, setExpandedSources] = useState<{
    [key: string]: boolean;
  }>({});

  const toggleSourceExpansion = (messageIndex: number) => {
    setExpandedSources((prev) => ({
      ...prev,
      [messageIndex]: !prev[messageIndex],
    }));
  };

  // Memoize expensive operations
  const sourcesSection = useMemo(() => {
    if (!message.sources || message.sources.length === 0) return null;

    return (
      <div className="mt-4 pt-3 border-t border-border/40">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium mb-1 flex items-center">
            <FileCode className="h-4 w-4 mr-2" />
            <span>Source files ({message.sources.length})</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => toggleSourceExpansion(index)}
          >
            {expandedSources[index] ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </Button>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-2">
          {message.sources.map((source, idx) => (
            <Badge
              key={idx}
              variant={
                activeSource === idx && expandedSources[index]
                  ? "default"
                  : "outline"
              }
              className="cursor-pointer text-sm py-1"
              onClick={() => {
                setActiveSource(
                  activeSource === idx && expandedSources[index] ? null : idx
                );
                if (!expandedSources[index]) {
                  toggleSourceExpansion(index);
                }
              }}
            >
              <FileCode className="h-3.5 w-3.5 mr-1.5" />
              {source.fileName.split("/").pop() || "Unknown file"}{" "}
              <span className="ml-1.5 opacity-70">
                {(source.similarity * 100).toFixed(0)}%
              </span>
            </Badge>
          ))}
        </div>

        {expandedSources[index] &&
          activeSource !== null &&
          activeSource >= 0 &&
          message.sources[activeSource] && (
            <CodeSource
              source={message.sources[activeSource]}
              getCodeSegment={getCodeSegment}
              messageIndex={index}
              sourceIndex={activeSource}
            />
          )}
      </div>
    );
  }, [message.sources, expandedSources, activeSource, index, getCodeSegment]);

  // Use React.memo for better performance
  const MessageContent = useMemo(() => {
    if (message.role === "user") {
      return (
        <div className="whitespace-pre-wrap text-lg font-medium">
          {message.content}
        </div>
      );
    }

    return (
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <ReactMarkdown
          components={{
            code: ({ node, className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || "");
              return match ? (
                <CodeBlock
                  text={String(children).replace(/\n$/, "")}
                  language={match[1]}
                  theme={atomOneDark}
                  showLineNumbers={true}
                  customStyle={{
                    borderRadius: "0.5rem",
                    fontSize: "1rem",
                  }}
                />
              ) : (
                <code
                  className="bg-secondary px-1.5 py-0.5 rounded text-base"
                  {...props}
                >
                  {children}
                </code>
              );
            },
            p: ({ children }) => (
              <p className="text-base mb-4 leading-relaxed">{children}</p>
            ),
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold my-4">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-bold my-3">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-bold my-2">{children}</h3>
            ),
            ul: ({ children }) => (
              <ul className="list-disc pl-6 my-4 space-y-2 text-base">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-6 my-4 space-y-2 text-base">
                {children}
              </ol>
            ),
            li: ({ children }) => <li className="text-base">{children}</li>,
          }}
        >
          {message.content}
        </ReactMarkdown>
        {message.isStreaming && (
          <div className="typing-indicator mt-1">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        )}
      </div>
    );
  }, [message.content, message.isStreaming, message.role]);

  // Optimize initial animation
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      layout="position"
      className="flex items-start w-full"
    >
      <Avatar
        className={cn(
          "mt-1",
          message.role === "user" ? "order-1 ml-3" : "mr-3"
        )}
      >
        {message.role === "assistant" ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M12 8V4H8" />
            <rect width="16" height="12" x="4" y="8" rx="2" />
            <path d="M2 14h2" />
            <path d="M20 14h2" />
            <path d="M15 13v2" />
            <path d="M9 13v2" />
          </svg>
        ) : userProfile?.imageUrl || clerkUser?.imageUrl ? (
          <Image
            src={userProfile?.imageUrl || clerkUser?.imageUrl || ""}
            alt="User"
            width={24}
            height={24}
            className="h-full w-full object-cover"
          />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        )}
      </Avatar>
      <div
        className={cn(
          "p-4 rounded-lg shadow-sm",
          message.role === "user"
            ? "bg-primary text-primary-foreground ml-auto order-0 inline-block max-w-[85%]"
            : "bg-muted text-foreground w-full max-w-[85%]"
        )}
      >
        {MessageContent}
        {sourcesSection}
      </div>
    </motion.div>
  );
}

// You can still memoize the component after defining it
// export const MemoizedChatMessage = memo(ChatMessage);
