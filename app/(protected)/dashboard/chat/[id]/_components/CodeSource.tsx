import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Copy } from "lucide-react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Source } from "../types";
import { toast } from "sonner";

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
    <Card className="mt-3 overflow-hidden">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">
            {source.fileName.split("/").pop()}
          </h3>
          <Button
            variant="outline"
            size="sm"
            className="h-7 py-0 flex items-center gap-1"
            onClick={() =>
              copyToClipboard(getCodeSegment(messageIndex, sourceIndex, 0))
            }
          >
            <Copy className="h-3.5 w-3.5" />
            <span className="text-xs">Copy</span>
          </Button>
        </div>
        <div className="text-sm font-mono overflow-auto max-h-72">
          <Tabs defaultValue="code" className="w-full">
            <TabsList className="h-9">
              <TabsTrigger value="code" className="text-sm">
                Full Code
              </TabsTrigger>
              <TabsTrigger
                value="segments"
                className="text-sm"
                disabled={!source || !source?.relevantSegments?.length}
              >
                Segments ({source.relevantSegments?.length || 0})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="code" className="mt-3">
              {/* Debug information */}
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
              <SyntaxHighlighter
                language={getLanguage(source.fileName)}
                style={atomOneDark}
                customStyle={{
                  fontSize: "0.9rem",
                  padding: "1rem",
                  borderRadius: "0.5rem",
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
                        backgroundColor: "rgba(82, 92, 121, 0.2)",
                      },
                    };
                  }
                  return {};
                }}
              >
                {getCodeSegment(messageIndex, sourceIndex, 0)}
              </SyntaxHighlighter>
            </TabsContent>
            <TabsContent value="segments" className="mt-3">
              {source?.relevantSegments?.map((segment, i) => (
                <div key={i} className="mb-5">
                  <div className="text-sm opacity-70 mb-2 flex items-center justify-between">
                    <span>
                      Lines {segment.lineStart}-{segment.lineEnd}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {segment.lineEnd - segment.lineStart + 1} lines
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
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
                  <SyntaxHighlighter
                    language={getLanguage(source?.fileName || "")}
                    style={atomOneDark}
                    customStyle={{
                      fontSize: "0.9rem",
                      padding: "1rem",
                      borderRadius: "0.5rem",
                    }}
                    showLineNumbers
                    startingLineNumber={segment.lineStart}
                    wrapLines={true}
                  >
                    {segment.segment || "No code available"}
                  </SyntaxHighlighter>
                </div>
              )) || (
                <p className="text-center p-6 text-muted-foreground text-base">
                  No segments available
                </p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
