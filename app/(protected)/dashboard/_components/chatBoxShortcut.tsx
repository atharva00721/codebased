"use client";

import {
  GridPatternCard,
  GridPatternCardBody,
} from "@/components/ui/card-with-grid-ellipsis-pattern";
import { ArrowRight, MessageSquare } from "lucide-react";

interface GridPatternCardDemoProps {
  projectName?: string;
}

export function GridPatternCardDemo({
  projectName = "your project",
}: GridPatternCardDemoProps) {
  return (
    <GridPatternCard className="group transition-all duration-300 h-full">
      <GridPatternCardBody className="relative h-full flex flex-col">
        <div className="flex items-center mb-3">
          <MessageSquare className="size-4 text-purple-500 dark:text-purple-400 mr-2.5" />
          <h3 className="text-xl font-semibold text-foreground tracking-tight">
            Chat with{" "}
            <span className="text-purple-600 dark:text-purple-400">
              {projectName}
            </span>
          </h3>
        </div>

        <p className="text-wrap text-sm leading-relaxed text-foreground/80 mb-5 flex-grow max-w-[90%]">
          Ask questions about your codebase and get instant answers from your AI
          assistant. Analyze functionality, understand patterns, and solve
          problems efficiently.
        </p>

        <div className="flex items-center text-purple-500 dark:text-purple-400 text-sm font-medium transition-all duration-200 group-hover:translate-x-1 mt-auto">
          <span>Go to Chat</span>
          <ArrowRight className="ml-1.5 size-3.5 transition-transform group-hover:translate-x-0.5" />
        </div>
      </GridPatternCardBody>
    </GridPatternCard>
  );
}
