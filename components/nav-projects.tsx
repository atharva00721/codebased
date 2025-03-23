"use client";

import { PlusCircle, SquareTerminal } from "lucide-react";
import { useState } from "react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

// Static project data
const sampleProjects = [
  { id: 1, name: "Project Alpha" },
  { id: 2, name: "Project Beta" },
  { id: 3, name: "Project Gamma" },
];

export function NavProjects() {
  // Replace dynamic state with static data and local state
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu>
        {sampleProjects.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton
              className={cn({
                "bg-purple-400 !text-white hover:bg-purple-400":
                  item.id === selectedProjectId,
              })}
              asChild
            >
              <div
                onClick={() => {
                  setSelectedProjectId(item.id);
                }}
              >
                <SquareTerminal />
                <span>{item.name}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}

        <Button className="mt-2 text-white" variant={"ghost"}>
          <PlusCircle className="" />
          <span>Add Project</span>
        </Button>
      </SidebarMenu>
    </SidebarGroup>
  );
}
