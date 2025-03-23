import React, { JSX } from "react";
import { cn } from "@/lib/utils";
import {
  Aether,
  AetherContent,
  AetherDescription,
  AetherHeader,
  AetherTitle,
  AetherTrigger,
} from "./responsive-modal";

type GlassModalProps = {
  trigger: JSX.Element;
  children: React.ReactNode;
  title: string;
  description: string;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
};

export const GlassModal = ({
  trigger,
  children,
  title,
  description,
  className,
}: GlassModalProps) => {
  return (
    <Aether>
      <AetherTrigger asChild>{trigger}</AetherTrigger>
      <AetherContent
        className={cn(
          "backdrop--blur__safari bg-themeGray border-themeGray bg-opacity-20 bg-clip-padding px-4 py-8 backdrop-blur-3xl backdrop-filter",
          className
        )}
      >
        <AetherHeader>
          <AetherTitle>{title}</AetherTitle>
          <AetherDescription>{description}</AetherDescription>
        </AetherHeader>
        {children}
      </AetherContent>
    </Aether>
  );
};
