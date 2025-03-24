"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ExternalLinkIcon, Github, RefreshCcw } from "lucide-react";
import Link from "next/link";
import CommitBox from "./_components/commit-box";
import { Button } from "@/components/ui/button";
import useProject from "@/hooks/useProject";
import { GridPatternCardDemo } from "./_components/chatBoxShortcut";

const DashboardPage = () => {
  const { project, projectId } = useProject();
  const router = useRouter();

  const navigateToChat = () => {
    router.push(`/dashboard/chat/${projectId}`);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <Github className="size-5 text-zinc-500" />
          <Link
            href={project?.githubUrl ?? ""}
            className="text-sm hover:text-purple-500 transition-colors flex items-center"
          >
            {project?.name}
            <ExternalLinkIcon className="ml-1.5 size-3" />
          </Link>
        </div>
        {/* //TODO: add update commit */}
        <Button
          variant="outline"
          className="h-9
        "
          disabled
        >
          <RefreshCcw className="mr-2 size-4" />
          Update Commits
        </Button>
      </header>

      <main className="space-y-6">
        <div
          className="h-[200px] transition-all cursor-pointer"
          onClick={navigateToChat}
        >
          <GridPatternCardDemo projectName={project?.name} />
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3 text-zinc-500">Activity</h3>
          <CommitBox />
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
