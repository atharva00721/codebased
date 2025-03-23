import { Message } from "./types";

// Extract file extension for syntax highlighting
export const getLanguage = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase();

  const languageMap: Record<string, string> = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    py: "python",
    rb: "ruby",
    java: "java",
    cs: "csharp",
    php: "php",
    go: "go",
  };

  return extension ? languageMap[extension] || "text" : "text";
};

// Safely get code segment with error handling
export const getCodeSegment = (
  messages: Message[],
  messageIndex: number,
  sourceIndex: number,
  segmentIndex = 0
) => {
  try {
    const message = messages[messageIndex];
    if (!message?.sources || !message.sources[sourceIndex]) {
      console.error("Source not found");
      return "No source available";
    }

    const source = message.sources[sourceIndex];

    // For debugging
    console.log("Source content:", source);

    // If no segments, return the entire source code if available
    if (!source.relevantSegments || source.relevantSegments.length === 0) {
      // Some implementations store the entire file content in sourceCode property
      if (source.sourceCode) {
        return source.sourceCode;
      }
      return "No code segments available in this source";
    }

    // Get the requested segment or fall back to first segment
    const segment =
      source.relevantSegments[segmentIndex] || source.relevantSegments[0];

    if (!segment) {
      return "No code segments available";
    }

    if (!segment.segment) {
      // Try alternative property names that might contain the code
      if ("code" in segment) return segment.code;
      if ("content" in segment) return segment.content;
      if ("text" in segment) return segment.text;

      return "Code segment exists but content is empty";
    }

    return segment.segment;
  } catch (error) {
    console.error("Error accessing code segment:", error);
    return "Error loading code. Check console for details.";
  }
};
