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
    <SidebarProvider className="bg-black">
      <AppSidebar />
      <SidebarInset className="flex flex-col gap-0">
        <header className="flex h-20 shrink-0 items-start">
          <div className="flex w-full items-center  justify-between gap-2 bg-sidebar p-2 px-4">
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
        <main className="w-full p-3 sm:p-2">
          <div className="no-scrollbar flex h-[calc(100svh-5rem)] gap-2 overflow-y-auto border border-card-muted rounded-lg -mt-6 p-4">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default SidebarLayout;
