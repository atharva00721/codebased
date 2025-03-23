import { Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface InitializationScreenProps {
  initializeRAG: () => Promise<void>;
  isInitializing: boolean;
  progress?: number; // new: progress percentage
  currentFile?: string; // new: current file name
}

export function InitializationScreen({
  initializeRAG,
  isInitializing,
  progress, // new prop
  currentFile, // new prop
}: InitializationScreenProps) {
  return (
    <div className="flex w-full h-[calc(100vh-10rem)] flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardContent className="pt-6">
          <h2 className="text-3xl font-bold text-center mb-4">
            Initialize Repository
          </h2>
          {isInitializing && currentFile && (
            <>
              <p className="text-center text-sm text-gray-500">
                Processing file: {currentFile}
              </p>
              {progress !== undefined && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              )}
            </>
          )}
          <p className="text-muted-foreground text-lg mb-6 text-center">
            This project needs to be analyzed before you can ask questions about
            the code. Processing may take a few minutes depending on the size of
            the repository.
          </p>
          <Button
            className="w-full text-lg py-6"
            onClick={initializeRAG}
            disabled={isInitializing}
          >
            {isInitializing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-5 w-5" />
                Initialize Repository
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
