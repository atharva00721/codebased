"use client";

import * as React from "react";
import { Bot, LayoutDashboardIcon } from "lucide-react";
import { NavMain } from "@/components/nav-main";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useUser } from "@clerk/nextjs";

import { ProjectSwitcher } from "./project-switcher";
import useProject from "@/hooks/useProject";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();
  const { projectId } = useProject();

  const iteams = {
    userdata: {
      name: user?.firstName || "",
      email: user?.emailAddresses[0]?.emailAddress || "",
      avatar: user?.imageUrl || "",
    },
    navMain: [
      {
        title: "Dashboard",
        url: `/dashboard`,
        icon: LayoutDashboardIcon,
        // isActive: true,
      },
      {
        title: "Q&A",
        url: `/dashboard/chat/${projectId || ""}`,
        icon: Bot,
      },
      // {
      //   title: "Meetings",
      //   url: `/meetings/${activeProject || ""}`,
      //   icon: PresentationIcon,
      // },
      // {
      //   title: "Billing",
      //   url: `/billing/${activeProject || ""}`,
      //   icon: CreditCardIcon,
      // },
    ],
  };
  return (
    <Sidebar
      className="border-none bg-themeWarmerCream dark:bg-themeGray"
      variant="sidebar"
      {...props}
      collapsible="icon"
    >
      <SidebarHeader>
        <h1>CODEBASED</h1>
      </SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <ProjectSwitcher />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      <SidebarContent>
        <NavMain items={iteams.navMain} />
      </SidebarContent>
      {/* <SidebarFooter>
        <ModeToggle />
      </SidebarFooter> */}
    </Sidebar>
  );
}
