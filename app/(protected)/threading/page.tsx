"use client";
import { Thread } from "@/components/thread";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";

export default function Page() {
  const runtime = useChatRuntime({
    api: "/api/cutechat",
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="grid w-full h-[85dvh] grid-cols-1 ">
        {/* <ThreadList /> */}
        <Thread />
      </div>
    </AssistantRuntimeProvider>
  );
}
