"use client";

import * as React from "react";
import {
  ChevronsUpDown,
  Plus,
  SquareActivity,
  SquareTerminal,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import useProject from "@/hooks/useProject";

export function ProjectSwitcher() {
  const { isMobile } = useSidebar();

  const { projects, setProjectId, project } = useProject();

  const handleProjectChange = (id: string) => {
    console.log("Switching to project:", id);
    setProjectId(id);
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <SquareTerminal className="size-6" />
              </div>
              <div className="grid flex-inline text-left text-sm leading-tight">
                <span className="truncate font-bold">{project?.name}</span>
                {/* <span className="truncate text-xs">by {project?.user.name}</span> */}
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="glassmorphism dark:glassmorphism3 w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-accent-foreground dark:text-muted-foreground">
              Projects
            </DropdownMenuLabel>

            {projects?.map((item, index) => (
              <DropdownMenuItem
                key={item.name}
                onClick={() => handleProjectChange(item.id)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <SquareActivity className="size-4 shrink-0" />
                </div>
                {item.name}
                <DropdownMenuShortcut>{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
