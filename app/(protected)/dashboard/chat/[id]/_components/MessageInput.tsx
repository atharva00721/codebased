import { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send } from "lucide-react";

interface MessageInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
  isLoading: boolean;
}

export function MessageInput({
  input,
  setInput,
  handleSubmit,
  isLoading,
}: MessageInputProps) {
  return (
    <div className="border-t mt-4 pt-4">
      <form onSubmit={handleSubmit} className="flex gap-3 items-center">
        <Input
          placeholder="Ask about the codebase (e.g., How does authentication work?)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          className="flex-1 text-base py-6"
        />
        <Button
          type="submit"
          disabled={isLoading || !input.trim()}
          size="lg"
          className="text-base px-6"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Send className="h-5 w-5 mr-2" />
              Send
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
