import { FormEvent } from "react";

interface EmptyChatProps {
  setInput: (value: string) => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
}

export function EmptyChat({ setInput, handleSubmit }: EmptyChatProps) {
  const handleQuestionClick = (question: string) => {
    setInput(question);
    // Optional: Auto-submit the form after selecting a question
    const event = { preventDefault: () => {} } as FormEvent;
    handleSubmit(event);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-gradient-to-b from-background to-background/80 rounded-lg">
      <div className="p-6 rounded-full bg-primary/10 mb-6 hover:scale-105 transition-all duration-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-14 w-14 text-primary"
        >
          <path d="M12 8V4H8" />
          <rect width="16" height="12" x="4" y="8" rx="2" />
          <path d="M2 14h2" />
          <path d="M20 14h2" />
          <path d="M15 13v2" />
          <path d="M9 13v2" />
        </svg>
      </div>
      <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
        Code Assistant
      </h2>
      <p className="text-muted-foreground text-lg max-w-lg mb-8">
        Ask questions about this codebase, and I&apos;ll help you understand how
        it works.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl mt-2">
        {[
          "How does the authentication system work?",
          "Explain the database schema",
          "Can you show me how routing works?",
          "What state management is used in this project?",
        ].map((question, i) => (
          <div
            key={i}
            className="p-4 border border-border rounded-lg hover:bg-accent/50 hover:border-primary/50 cursor-pointer transition-all"
            onClick={() => handleQuestionClick(question)}
          >
            <p className="text-sm font-medium text-left flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m15 9-6 6" />
                <path d="m9 9 6 6" />
              </svg>
              {question}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 text-sm text-muted-foreground">
        <p>Or just type your question in the input box below</p>
      </div>
    </div>
  );
}
