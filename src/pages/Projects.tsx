import React from "react";
import Dashboard from "@/components/Dashboard";
import { useNavigate } from "react-router-dom";
import { DashboardView } from "@/components/Dashboard";

const Projects: React.FC = () => {
  const navigate = useNavigate();
  
  return <Dashboard 
    initialView="projects" 
    onViewChange={(view: DashboardView) => {
      switch(view) {
        case "dashboard":
          navigate("/overview");
          break;
        case "projects":
          navigate("/projects");
          break;
        case "tracking":
          navigate("/track");
          break;
        case "help":
          navigate("/support");
          break;
        case "store":
          navigate("/shop");
          break;
      }
    }} 
  />;
};

export default Projects;