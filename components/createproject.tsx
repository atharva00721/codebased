"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Plus } from "lucide-react";
import {
  Aether,
  AetherContent,
  AetherDescription,
  AetherHeader,
  AetherTitle,
  AetherTrigger,
} from "./responsive-modal";

type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
};

const CreateProject = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onSubmit = async (data: FormInput) => {
    try {
      setIsSubmitting(true);
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.projectName,
          githubUrl: data.repoUrl,
          githubToken: data.githubToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create project");
      }

      toast.success("Project created successfully");
      reset();
    } catch (error) {
      console.error("Error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Aether>
      <AetherTrigger className="hover:bg-background/670 flex gap-2 rounded-xl bg-background p-2">
        <div className="flex size-6 items-center justify-center rounded-lg border bg-background">
          <Plus className="size-4" />
        </div>
        <div className="text-mute d-foreground mr-2 font-light">
          Add Project
        </div>
      </AetherTrigger>

      <AetherContent className="dark:glassmorphism2 bg-white dark:bg-opacity-90 dark:bg-black md:w-[768px] light:bg-white rounded-lg bg-clip-padding px-4 py-8 backdrop-blur-3xl backdrop-filter dark:border-themeGray">
        <AetherHeader>
          <AetherTitle className="text-2xl font-semibold dark:text-white">
            Link Your Github Repository
          </AetherTitle>
          <AetherDescription className="text-xs text-muted-foreground">
            Enter the URL of the repo to link it to codebase
          </AetherDescription>
        </AetherHeader>

        <div className="mx-auto flex h-full flex-col items-center justify-center gap-6 max-md:w-full md:flex-row rounded-lg">
          <Image
            src="/cute.png"
            width={250}
            height={250}
            alt="Create Project"
            className="rounded-lg hidden md:block"
          />
          <div>
            <div className="h-4" />
            <div className="">
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex w-full flex-col gap-y-2"
              >
                <Input
                  {...register("repoUrl", { required: true })}
                  placeholder="Repository URL"
                  required
                />
                <Input
                  {...register("projectName", { required: true })}
                  placeholder="Project Name"
                  required
                />
                <Input
                  {...register("githubToken")}
                  placeholder="Github Token"
                />
                <Button type="submit" disabled={isSubmitting} className="dark:text-black text-white">
                  {isSubmitting ? "Creating..." : "Create Project"}
                </Button>
              </form>

            </div>
          </div>
        </div>
      </AetherContent>
    </Aether>
  );
};

export default CreateProject;
