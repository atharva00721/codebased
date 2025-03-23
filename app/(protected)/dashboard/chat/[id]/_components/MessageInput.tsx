import { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfile } from "../types";

// Define a more specific type for Clerk user
interface ClerkUserType {
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  emailAddresses?: Array<{ emailAddress: string }>;
}

interface MessageInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
  isLoading: boolean;
  clearChat?: () => Promise<void>;
  showClearChat?: boolean;
  userProfile?: UserProfile | null;
  clerkUser?: ClerkUserType | null;
  isLoadingProfile?: boolean;
}

export function MessageInput({
  input,
  setInput,
  handleSubmit,
  isLoading,
  clearChat,
  showClearChat = false,
  userProfile,
  clerkUser,
  isLoadingProfile = false,
}: MessageInputProps) {
  // State for user credits - removed unused loading state

  // Get initials from user profile or clerk user
  const getInitials = () => {
    if (userProfile) {
      return `${userProfile.firstName?.charAt(0) || ""}${
        userProfile.lastName?.charAt(0) || ""
      }`.toUpperCase();
    } else if (clerkUser) {
      return `${clerkUser.firstName?.charAt(0) || ""}${
        clerkUser.lastName?.charAt(0) || ""
      }`.toUpperCase();
    }
    return "U";
  };

  const initials = getInitials();
  const imageUrl = userProfile?.imageUrl || clerkUser?.imageUrl;
  const name = userProfile?.firstName || clerkUser?.firstName || "User";
  const credits = userProfile?.credits;

  return (
    <div className="border-t mt-4 pt-4">
      <div className="flex justify-between items-center mb-3 px-1">
        {/* Clear chat button now on the left side */}
        <div>
          {showClearChat && clearChat && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearChat}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Clear Chat
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clear chat history</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* User profile now on the right side with credits */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-sm font-medium">{name}</p>
            <p className="text-xs text-green-500 font-medium">
              {credits !== null ? `Credits: ${credits}` : "Credits: -"}
            </p>
          </div>
          <Avatar className="h-8 w-8">
            <AvatarImage src={imageUrl} alt={name} />
            <AvatarFallback>
              {isLoadingProfile ? "..." : initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3 items-center w-full">
        <Input
          placeholder="Ask about the codebase (e.g., How does authentication work?)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          className="w-auto min-w-0 text-base py-6 rounded-xl flex-grow"
          style={{
            width: "fit-content",
            maxWidth: "100%",
          }}
        />
        <Button
          type="submit"
          disabled={isLoading || !input.trim()}
          size="lg"
          className="text-base px-4 sm:px-6 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 shrink-0"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Send className="h-5 w-5 sm:mr-2" />
              <span className="hidden sm:inline">Send</span>
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
