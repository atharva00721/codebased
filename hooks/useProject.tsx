import React, { useState, useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";
import { getProjects } from "@/app/actions/projects";

interface Project {
  id: string;
  name: string;
  githubUrl: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  deleteAt: string | Date | null;
}

const useProject = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useLocalStorage<string>(
    "selected-project-id",
    ""
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await getProjects();
        console.log("Fetched projects:", data);
        setProjects(data);

        // Set first project as default if no project is selected
        if (!projectId && data.length > 0) {
          console.log("Setting default project:", data[0].id);
          setProjectId(data[0].id);
        }

        setError(null);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch projects"
        );
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [projectId, setProjectId]);

  const currentProject = projects.find((p) => p.id === projectId);
  console.log("Current project:", currentProject);

  return {
    projects,
    project: currentProject,
    projectId,
    setProjectId,
    loading,
    error,
  };
};

export default useProject;
