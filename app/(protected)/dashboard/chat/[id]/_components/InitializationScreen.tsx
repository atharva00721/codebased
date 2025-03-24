import { Loader2, GitBranch, GitFork } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface InitializationScreenProps {
  initializeRAG: () => Promise<void>;
  isInitializing: boolean;
}

export function InitializationScreen({
  initializeRAG,
  isInitializing,
}: InitializationScreenProps) {
  return (
    <div className="flex w-full h-[calc(100vh-10rem)] flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg border-0 shadow-none bg-transparent">
        <CardContent className="pt-6">
          <div className="flex justify-center mb-4">
            {isInitializing ? (
              <GitFork className="w-12 h-12 animate-spin" />
            ) : (
              <GitFork className="w-12 h-12" />
            )}
          </div>
          <h2 className="text-3xl font-bold text-center mb-4">
            Initialize Repository
          </h2>
          <p className="text-muted-foreground text-lg mb-6 text-center">
            We need to analyze your project before we can start the
            conversation. This might take a few minutes depending on the
            repository size.
          </p>
            <Button
            className="w-full text-lg py-6 bg-themeAccent hover:bg-themeAccent/90 text-themeTextWhite dark:bg-themeAccent dark:hover:bg-themeAccent/90 "
            onClick={initializeRAG}
            disabled={isInitializing}
            >
            {isInitializing ? (
              <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing Repository
              </>
            ) : (
              <>
              <GitBranch className="mr-2 h-5 w-5" />
              Start Analysis
              </>
            )}
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
