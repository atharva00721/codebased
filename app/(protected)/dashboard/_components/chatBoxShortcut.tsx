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
    <GridPatternCard className="group transition-all duration-300 h-full hover:scale-[1.01]">
      <GridPatternCardBody className="relative h-full flex flex-col p-6">
        <div className="flex items-center mb-4">
          <MessageSquare className="size-5 text-themeAccent mr-3" />
          <h3 className="text-xl font-medium text-foreground">
            Chat with{" "}
            <span className="text-themeAccent font-semibold">
              {projectName}
            </span>
          </h3>
        </div>

        <p className="text-wrap text-sm leading-relaxed text-muted-foreground/80 mb-6 flex-grow max-w-[85%]">
          Ask questions about your codebase and get instant answers from your AI
          assistant. Analyze functionality, understand patterns, and solve
          problems efficiently.
        </p>

        <div className="flex items-center text-themeAccent font-medium transition-all duration-300 group-hover:translate-x-2">
          <span className="text-sm">Start chatting</span>
          <ArrowRight className="ml-2 size-4 transition-all duration-300 group-hover:translate-x-1" />
        </div>
      </GridPatternCardBody>
    </GridPatternCard>
  );
}
