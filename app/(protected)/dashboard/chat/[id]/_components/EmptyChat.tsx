export function EmptyChat() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center py-10">
      <div className="p-6 rounded-full bg-primary/10 mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-12 w-12 text-primary"
        >
          <path d="M12 8V4H8" />
          <rect width="16" height="12" x="4" y="8" rx="2" />
          <path d="M2 14h2" />
          <path d="M20 14h2" />
          <path d="M15 13v2" />
          <path d="M9 13v2" />
        </svg>
      </div>
      <h2 className="text-3xl font-bold mb-4">Code Assistant</h2>
      <p className="text-muted-foreground text-lg max-w-lg">
        Ask questions about this codebase, and I'll help you understand how it
        works.
      </p>
    </div>
  );
}
