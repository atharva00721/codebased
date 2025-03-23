/**
 * Code analyzer for improved RAG performance
 * Extracts important metadata from code files
 */

/**
 * Analyze code file to extract metadata like functions, classes, dependencies
 */
export function analyzeCodeFile(content: string, filePath: string) {
  const extension = filePath.substring(filePath.lastIndexOf(".")).toLowerCase();
  const metadata = {
    functions: [] as string[],
    classes: [] as string[],
    imports: [] as string[],
    exports: [] as string[],
    patterns: [] as string[],
    complexity: "low" as "low" | "medium" | "high",
  };

  // Skip analysis for very large files (focus on content summary instead)
  if (content.length > 100000) {
    metadata.complexity = "high";
    return metadata;
  }

  try {
    // JavaScript/TypeScript analysis
    if ([".ts", ".tsx", ".js", ".jsx"].includes(extension)) {
      // Extract functions
      const functionRegex = /(?:function|const|let|var)\s+(\w+)\s*\([^)]*\)/g;
      let match;
      while ((match = functionRegex.exec(content)) !== null) {
        if (match[1] && !match[1].startsWith("_")) {
          metadata.functions.push(match[1]);
        }
      }

      // Extract arrow functions
      const arrowFunctionRegex =
        /(?:const|let|var)\s+(\w+)\s*=\s*(?:\([^)]*\)|[^=]*)\s*=>/g;
      while ((match = arrowFunctionRegex.exec(content)) !== null) {
        if (match[1] && !match[1].startsWith("_")) {
          metadata.functions.push(match[1]);
        }
      }

      // Extract classes
      const classRegex = /class\s+(\w+)/g;
      while ((match = classRegex.exec(content)) !== null) {
        metadata.classes.push(match[1]);
      }

      // Extract imports
      const importRegex = /import\s+.*from\s+['"]([^'"]+)['"]/g;
      while ((match = importRegex.exec(content)) !== null) {
        metadata.imports.push(match[1]);
      }

      // Extract exports
      const exportRegex =
        /export\s+(const|let|var|function|class|default)\s+(\w+)?/g;
      while ((match = exportRegex.exec(content)) !== null) {
        if (match[2]) {
          metadata.exports.push(match[2]);
        } else if (match[1] === "default") {
          metadata.exports.push("default");
        }
      }

      // Detect common patterns
      if (content.includes("useState") || content.includes("useEffect")) {
        metadata.patterns.push("React Hooks");
      }
      if (content.includes("createContext")) {
        metadata.patterns.push("Context API");
      }
      if (content.includes(".reduce(")) {
        metadata.patterns.push("Functional Programming");
      }
      if (content.includes("async") && content.includes("await")) {
        metadata.patterns.push("Async/Await");
      }

      // Estimate complexity
      const complexityScore =
        content.length / 1000 + // Size factor
        metadata.functions.length +
        metadata.classes.length * 2 +
        (content.match(/if|else|for|while|switch|case/g) || []).length / 2;

      if (complexityScore > 50) metadata.complexity = "high";
      else if (complexityScore > 15) metadata.complexity = "medium";
    }

    // Python analysis
    if ([".py"].includes(extension)) {
      // Python-specific analysis
      // ...
    }

    return metadata;
  } catch (error) {
    console.error("Error analyzing code:", error);
    return metadata;
  }
}

/**
 * Generate a semantic summary of code file
 */
export function generateCodeSummary(
  content: string,
  metadata: ReturnType<typeof analyzeCodeFile>,
  filePath: string
): string {
  const filenameWithoutPath =
    filePath.split("/").pop()?.split("\\").pop() || filePath;

  let summary = `File: ${filenameWithoutPath}\n\n`;

  // Add description of file purpose based on name and content
  if (filenameWithoutPath.includes("util")) {
    summary += "Purpose: Utility functions\n";
  } else if (filenameWithoutPath.includes("component")) {
    summary += "Purpose: UI Component\n";
  } else if (filenameWithoutPath.includes("service")) {
    summary += "Purpose: Service layer\n";
  } else if (filenameWithoutPath.includes("controller")) {
    summary += "Purpose: Controller\n";
  } else if (filenameWithoutPath.includes("model")) {
    summary += "Purpose: Data model\n";
  }

  // Add complexity
  summary += `Complexity: ${metadata.complexity}\n\n`;

  // Add key functions and classes
  if (metadata.functions.length > 0) {
    summary += "Key Functions:\n";
    metadata.functions.slice(0, 7).forEach((fn) => {
      summary += `- ${fn}\n`;
    });
    summary += "\n";
  }

  if (metadata.classes.length > 0) {
    summary += "Classes:\n";
    metadata.classes.forEach((cls) => {
      summary += `- ${cls}\n`;
    });
    summary += "\n";
  }

  // Add patterns detected
  if (metadata.patterns.length > 0) {
    summary += "Patterns: " + metadata.patterns.join(", ") + "\n\n";
  }

  // Add preview of actual code
  summary +=
    "Content Preview:\n```\n" +
    content.substring(0, 500) +
    (content.length > 500 ? "..." : "") +
    "\n```\n";

  return summary;
}

export default {
  analyzeCodeFile,
  generateCodeSummary,
};
