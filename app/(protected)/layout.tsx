import { UserButton } from "@clerk/nextjs";
import { AppSidebar } from "@/components/app-sidebar";
import CreateProject from "@/components/createproject";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

type Props = {
  children: React.ReactNode;
};

const SidebarLayout = ({ children }: Props) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-20 shrink-0 items-center p-2">
          <div className="flex w-full items-center justify-between gap-2 rounded-lg border border-sidebar-border bg-sidebar p-2 px-4 shadow">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="hover:glassmorphism2 -ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
            </div>
            <div className="flex items-center gap-4">
              <CreateProject />
              <UserButton />
            </div>
          </div>
        </header>
        <main className="w-full p-2">
          <div className="no-scrollbar flex h-[calc(100svh-6rem)] gap-2 overflow-y-auto rounded-lg border border-sidebar-border bg-background p-4 shadow">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default SidebarLayout;
