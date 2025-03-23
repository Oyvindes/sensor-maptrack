import React from "react";
import Dashboard from "@/components/Dashboard";
import { useNavigate } from "react-router-dom";

const Overview: React.FC = () => {
  const navigate = useNavigate();
  
  return <Dashboard initialView="dashboard" onViewChange={(view) => {
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
  }} />;
};

export default Overview;