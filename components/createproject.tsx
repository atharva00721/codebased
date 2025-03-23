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
import { FormItem, FormControl, FormMessage, Form, FormField } from "./ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  repoUrl: z.string().min(1, "Repository URL is required"),
  projectName: z.string().min(1, "Project name is required"),
  githubToken: z.string().optional(),
});

type FormInput = z.infer<typeof formSchema>;

const CreateProject = () => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const form = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      repoUrl: "",
      projectName: "",
      githubToken: "",
    },
  });

  const onSubmit = async (data: FormInput) => {
    setFormError(null);
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

      const responseData = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setFormError(
            responseData.error ||
              "A project with the same name or URL already exists"
          );
          throw new Error(
            responseData.error ||
              "A project with the same name or URL already exists"
          );
        } else {
          throw new Error(responseData.error || "Failed to create project");
        }
      }

      toast.success("Project created successfully");
      form.reset();
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create project"
      );
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
          <div className="w-full">
            <div className="h-4" />
            <div className="">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex w-full flex-col gap-y-4"
                >
                  {formError && (
                    <div className="bg-destructive/10 text-destructive px-3 py-2 rounded-md text-sm mb-2">
                      {formError}
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="repoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Repository URL"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="projectName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Project Name"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="githubToken"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Github Token (optional)"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="dark:text-black text-white"
                  >
                    {isSubmitting ? "Creating..." : "Create Project"}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </AetherContent>
    </Aether>
  );
};

export default CreateProject;
