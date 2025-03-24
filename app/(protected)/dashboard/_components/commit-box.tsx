import React, { useEffect, useState } from "react";
import useProject from "@/hooks/useProject";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import GlassCard from "@/components/glass-card";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

type Commit = {
  id: string;
  commitHash: string;
  commitMessage: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
  summary: string;
};

const CommitBox = () => {
  const { projectId, project } = useProject();
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommits = async () => {
      if (!projectId) {
        console.log("No projectId available, skipping fetch");
        return;
      }

      console.log("Fetching commits for projectId:", projectId);
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/commits", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ projectId }),
        });

        const data = await response.json();
        console.log("API Response status:", response.status);
        console.log("API Response data:", data);

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch commits");
        }

        if (!Array.isArray(data)) {
          console.error("Unexpected data format:", data);
          throw new Error("Invalid data format received from server");
        }

        setCommits(data);
        console.log("Successfully set commits:", data.length);
      } catch (error) {
        console.error("Error fetching commits:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch commits"
        );
        setCommits([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCommits();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-pulse">Loading commits...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center p-4 text-red-500">Error: {error}</div>
    );
  }

  if (!projectId) {
    return (
      <div className="flex justify-center p-4 text-muted-foreground">
        Please select a project to view commits
      </div>
    );
  }

  if (commits.length === 0) {
    return (
      <div className="flex justify-center p-4 text-muted-foreground">
        No commits found for this project
      </div>
    );
  }

  return (
    <div>
      <ul className="space-y-6">
        {commits.map((commit, commitIdx) => (
          <li key={commit.id} className="relative flex gap-x-4">
            <div
              className={cn(
                commitIdx === commits.length - 1 ? "h-6" : "-bottom-6",
                "absolute left-0 top-0 flex w-6 justify-center"
              )}
            >
              <div className="w-[2px] translate-x-3 translate-y-5 bg-themeAccent dark:bg-gradient-to-b dark:from-pink-700 dark:to-purple-400"></div>
            </div>
            <>
              <Image
                src={commit.commitAuthorAvatar}
                alt="author avatar"
                width={46}
                height={46}
                className="relative ml-2 mt-5 size-8 flex-none rounded-full bg-gray-50"
              />
              <GlassCard className="w-full">
                <CardHeader className="flex flex-col items-start justify-start space-y-0 px-3 py-4 max-sm:flex-row">
                  <CardTitle className="font-medium">
                    <Link
                      target="_blank"
                      href={`${project?.githubUrl}/commits/${commit.commitHash}`}
                      className="flex items-center justify-center gap-x-1 py-0.5 text-sm leading-5 transition-colors duration-300 hover:text-foreground"
                    >
                      <span className="text-foreground">
                        {commit.commitAuthorName}
                      </span>
                      <span className="inline-flex items-center justify-center text-primary/60 transition-colors duration-300 hover:text-foreground">
                        committed
                        <ExternalLink size={12} className="ml-2" />
                      </span>
                    </Link>
                  </CardTitle>
                  <CardDescription className="text-md font-semibold leading-5 text-primary">
                    {commit.commitMessage}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-3">
                  <pre className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground/70">
                    {commit.summary}
                  </pre>
                </CardContent>
              </GlassCard>
            </>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommitBox;
