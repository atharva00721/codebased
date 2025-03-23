"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ExternalLinkIcon, Github } from "lucide-react";
import Link from "next/link";
import CommitBox from "./_components/commit-box";
import GlassCard from "@/components/glass-card";
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
    <div className="flex w-full flex-col gap-y-4 p-1 no-scrollbar">
      <div className="flex w-full flex-wrap items-center justify-between gap-y-4">
        <div className="flex w-fit rounded-md bg-purple-400 px-4 py-3 text-white dark:text-themeDarkGray">
          <Github className="size-5" />
          <div className="ml-2">
            <p className="text-sm font-medium text-primary ">
              This Project is Linked to{" "}
              <Link
                href={project?.githubUrl ?? ""}
                className="inline-flex items-center hover:underline"
              >
                {project?.name}

                <ExternalLinkIcon className="ml-1 size-3" />
              </Link>
            </p>
          </div>
        </div>

        <div className="h-4"></div>

        <Button className="dark:bg-themeBlack bg-white text-themeBlack dark:text-white hover:bg-white/50">
          Invite Button
        </Button>
      </div>

      <div className="mt-2">
        <div className="grid grid-cols-1 gap-4">
          <GlassCard className="rounded-lg border-none hover:ring-1 hover:ring-purple-300/30 transition-all duration-300 min-h-[200px]">
            <div className="cursor-pointer h-full" onClick={navigateToChat}>
              <GridPatternCardDemo projectName={project?.name} />
            </div>
          </GlassCard>
        </div>
      </div>
      <div className="pb-5">
        <CommitBox />
      </div>
    </div>
  );
};
export default DashboardPage;
