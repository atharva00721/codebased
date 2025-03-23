import { FileText, ExternalLink, Github, MessageSquare } from "lucide-react";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-6xl uppercase font-bold">Codebase</h1>
        <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2">
            Turn any GitHub repository into a RAG chat with{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
              Codebase
            </code>
            .
          </li>
          <li>
            Chat with your codebase to understand and navigate it quickly.
          </li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="/dashboard"
            rel="noopener noreferrer"
          >
            <MessageSquare size={20} />
            Start Chatting
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            href="https://github.com/atharva00721/codebase"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="mr-2" size={16} />
            View on GitHub
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="/documentation"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FileText size={16} />
          Documentation
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="/examples"
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageSquare size={16} />
          Example Chats
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://github.com/atharva00721/codebased"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink size={16} />
          GitHub Repository
        </a>
      </footer>
    </div>
  );
}
