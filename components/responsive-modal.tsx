"use client";

import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/isdesk";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface BaseProps {
  children: React.ReactNode;
}

interface RootAetherProps extends BaseProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface AetherProps extends BaseProps {
  className?: string;
  asChild?: true;
}

const desktop = "(min-width: 768px)";

const Aether = ({
  children,
  tooltip,
  ...props
}: RootAetherProps & {
  tooltip?: string | React.ComponentProps<typeof TooltipContent>;
}) => {
  const isDesktop = useMediaQuery(desktop);
  const Aether = isDesktop ? Dialog : Drawer;

  return <Aether {...props}>{children}</Aether>;
};

const AetherTrigger = ({ className, children, ...props }: AetherProps) => {
  const isDesktop = useMediaQuery(desktop);
  const AetherTrigger = isDesktop ? DialogTrigger : DrawerTrigger;

  return (
    <AetherTrigger className={className} {...props}>
      {children}
    </AetherTrigger>
  );
};

const AetherClose = ({ className, children, ...props }: AetherProps) => {
  const isDesktop = useMediaQuery(desktop);
  const AetherClose = isDesktop ? DialogClose : DrawerClose;

  return (
    <AetherClose className={className} {...props}>
      {children}
    </AetherClose>
  );
};

const AetherContent = ({ className, children, ...props }: AetherProps) => {
  const isDesktop = useMediaQuery(desktop);
  const AetherContent = isDesktop ? DialogContent : DrawerContent;

  return (
    <AetherContent className={className} {...props}>
      {children}
    </AetherContent>
  );
};

const AetherDescription = ({ className, children, ...props }: AetherProps) => {
  const isDesktop = useMediaQuery(desktop);
  const AetherDescription = isDesktop ? DialogDescription : DrawerDescription;

  return (
    <AetherDescription className={className} {...props}>
      {children}
    </AetherDescription>
  );
};

const AetherHeader = ({ className, children, ...props }: AetherProps) => {
  const isDesktop = useMediaQuery(desktop);
  const AetherHeader = isDesktop ? DialogHeader : DrawerHeader;

  return (
    <AetherHeader className={className} {...props}>
      {children}
    </AetherHeader>
  );
};

const AetherTitle = ({ className, children, ...props }: AetherProps) => {
  const isDesktop = useMediaQuery(desktop);
  const AetherTitle = isDesktop ? DialogTitle : DrawerTitle;

  return (
    <AetherTitle className={className} {...props}>
      {children}
    </AetherTitle>
  );
};

const AetherBody = ({ className, children, ...props }: AetherProps) => {
  return (
    <div className={cn("px-4 md:px-0", className)} {...props}>
      {children}
    </div>
  );
};

const AetherFooter = ({ className, children, ...props }: AetherProps) => {
  const isDesktop = useMediaQuery(desktop);
  const AetherFooter = isDesktop ? DialogFooter : DrawerFooter;

  return (
    <AetherFooter className={className} {...props}>
      {children}
    </AetherFooter>
  );
};

export {
  Aether,
  AetherTrigger,
  AetherClose,
  AetherContent,
  AetherDescription,
  AetherHeader,
  AetherTitle,
  AetherBody,
  AetherFooter,
};
