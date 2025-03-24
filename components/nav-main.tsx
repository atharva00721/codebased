"use client";

import { type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Collapsible } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const pathname = usePathname();
  return (
    <SidebarGroup className="space-y-6">
      <SidebarGroupLabel className="px-3 text-[15px] font-medium">
        Platform
      </SidebarGroupLabel>
      <SidebarMenu className="space-y-1.5">
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible transition-colors"
          >
            <SidebarMenuItem>
              <Link href={item.url} className="w-full">
                <SidebarMenuButton
                  tooltip={item.title}
                  className={cn(
                    "w-full py-3 transition-all duration-200 ease-in-out hover:bg-accent/40",
                    {
                      "bg-accent dark:!text-themeTextWhite !text-themeTextBlack border-l-2 border-accent-foreground":
                        pathname === item.url,
                    }
                  )}
                >
                  {item.icon && <item.icon className="h-[18px] w-[18px]" />}
                  <span className="ml-3 text-[15px]">{item.title}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
