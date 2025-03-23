"use client";

import * as React from "react";

// import useProject from "~/hooks/useProject";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExternalLinkIcon, Github } from "lucide-react";
import Link from "next/link";
import CommitBox from "./_components/commit-box";
import GlassCard from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import useProject from "@/hooks/useProject";

const DashboardPage = () => {
  const { project, projectId, setProjectId } = useProject();

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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-5 ">
          <GlassCard className="rounded-lg border-none sm:col-span-3 border-2 border-slate-400">
            <CardHeader className="flex flex-col items-start space-y-0 border-b p-0 sm:flex-row">
              <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                <CardTitle className="capitalize">Ask Questions</CardTitle>
                <CardDescription>{project?.id}</CardDescription>
                <CardDescription>THIS IS WIP</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-2 sm:p-6">hello</CardContent>
          </GlassCard>
          <GlassCard className="rounded-lg border-none sm:col-span-2">
            <CardHeader className="flex flex-col items-start space-y-0 border-b p-0 sm:flex-row">
              <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                <CardTitle className="capitalize">{project?.name}</CardTitle>
                <CardTitle className="capitalize">A work in progress</CardTitle>

                <CardDescription>THIS IS WIP</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-2 sm:p-6">hello</CardContent>
          </GlassCard>
        </div>
      </div>
      <div className="pb-5">
        <CommitBox />
      </div>
    </div>
    // <Card className="w-full">
    //   <CardHeader className="flex flex-col items-start space-y-0 border-b p-0 sm:flex-row">
    //     <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
    //       <CardTitle className="capitalize">{project?.name}</CardTitle>
    //       <CardDescription>{project?.id}</CardDescription>
    //     </div>
    //   </CardHeader>
    //   <CardContent className="px-2 sm:p-6">hello</CardContent>
    // </Card>
  );
};
export default DashboardPage;
