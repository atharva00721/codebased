import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy } from "lucide-react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Source } from "../types";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

interface CodeSourceProps {
  source: Source;
  getCodeSegment: (
    messageIndex: number,
    sourceIndex: number,
    segmentIndex?: number
  ) => string;
  messageIndex: number;
  sourceIndex: number;
}

export function CodeSource({
  source,
  getCodeSegment,
  messageIndex,
  sourceIndex,
}: CodeSourceProps) {
  const { theme } = useTheme();

  const getLanguage = (fileName: string) => {
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast("Code copied to clipboard", {
          description: "You can now paste it anywhere",
        });
      })
      .catch((error) => {
        console.error("Failed to copy:", error);
        toast("Failed to copy", {
          description: "Please try again",
        });
      });
  };

  return (
    <Card className="mt-3 border border-border bg-card/80 max-w-full sm:max-w-[90%] mx-auto overflow-auto">
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
          <h3 className="text-sm font-medium text-foreground truncate">
            {source.fileName.split("/").pop()}
          </h3>
          <Button
            variant="outline"
            size="sm"
            className="h-7 py-0 flex items-center gap-1 border-border hover:bg-accent hover:text-accent-foreground transition-colors"
            onClick={() =>
              copyToClipboard(getCodeSegment(messageIndex, sourceIndex, 0))
            }
          >
            <Copy className="h-3.5 w-3.5" />
            <span className="text-xs">Copy</span>
          </Button>
        </div>
        <div className="text-sm font-mono overflow-auto max-w-[50vw] max-h-[50vh] rounded-md">
          <Accordion
            type="single"
            collapsible
            defaultValue="fullCode"
            className="w-full"
          >
            <AccordionItem value="fullCode">
              <AccordionTrigger>Full Code</AccordionTrigger>
              <AccordionContent>
                {process.env.NODE_ENV === "development" && (
                  <div className="text-xs text-yellow-500 mb-2 p-1 bg-muted/30 rounded">
                    {source.sourceCode
                      ? "Source code available"
                      : "No source code in .sourceCode property"}
                    {source.relevantSegments?.[0]?.segment
                      ? " - Segment available"
                      : " - No segment.segment property"}
                  </div>
                )}
                <div className="relative rounded-md overflow-x-auto min-h-[180px] flex-shrink-0">
                  <SyntaxHighlighter
                    language={getLanguage(source.fileName)}
                    style={atomOneDark}
                    customStyle={{
                      fontSize: "0.85rem",
                      padding: "0.75rem",
                      borderRadius: "0.375rem",
                      backgroundColor: theme === "dark" ? "#1a1b26" : "#f5f5f5",
                      color: theme === "dark" ? "#c0caf5" : "#24292e",
                      overflowX: "auto",
                      whiteSpace: "pre",
                      overflow: "visible",
                    }}
                    showLineNumbers
                    wrapLines={true}
                    lineProps={(lineNumber) => {
                      const segment = source.relevantSegments?.[0];
                      if (
                        segment &&
                        lineNumber >= segment.lineStart &&
                        lineNumber <= segment.lineEnd
                      ) {
                        return {
                          style: {
                            backgroundColor:
                              theme === "dark"
                                ? "rgba(82, 92, 121, 0.2)"
                                : "rgba(200, 210, 230, 0.3)",
                          },
                        };
                      }
                      return {};
                    }}
                  >
                    {getCodeSegment(messageIndex, sourceIndex, 0)}
                  </SyntaxHighlighter>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem
              value="segments"
              disabled={!source?.relevantSegments?.length}
            >
              <AccordionTrigger>
                Segments ({source.relevantSegments?.length || 0})
              </AccordionTrigger>
              <AccordionContent>
                {source?.relevantSegments?.map((segment, i) => (
                  <div key={i} className="mb-4 bg-card rounded-md">
                    <div className="text-xs sm:text-sm text-muted-foreground mb-2 flex flex-col sm:flex-row sm:items-center justify-between px-2 py-1">
                      <span>
                        Lines {segment.lineStart}-{segment.lineEnd}
                      </span>
                      <div className="flex items-center gap-2 mt-1 sm:mt-0">
                        <Badge
                          variant="outline"
                          className="text-xs bg-muted/50 text-foreground"
                        >
                          {segment.lineEnd - segment.lineStart + 1} lines
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-accent hover:text-accent-foreground"
                          onClick={() =>
                            copyToClipboard(
                              segment.segment || "No code available"
                            )
                          }
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="relative rounded-md overflow-hidden">
                      <SyntaxHighlighter
                        language={getLanguage(source?.fileName || "")}
                        style={atomOneDark}
                        customStyle={{
                          fontSize: "0.85rem",
                          padding: "1rem",
                          borderRadius: "0.375rem",
                          backgroundColor:
                            theme === "dark" ? "#1a1b26" : "#f5f5f5",
                          color: theme === "dark" ? "#c0caf5" : "#24292e",
                        }}
                        showLineNumbers
                        startingLineNumber={segment.lineStart}
                        wrapLines={true}
                      >
                        {segment.segment || "No code available"}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                )) || (
                  <p className="text-center p-6 text-muted-foreground text-sm sm:text-base">
                    No segments available
                  </p>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
}
