import React from "react";
import { SensorFolder } from "@/types/users";
import BasicProjectInfo from "./project-info/BasicProjectInfo";
import AddressSearch from "./project-info/AddressSearch";
import DirectionsDialog from "./project-info/DirectionsDialog";
import ProjectDescription from "./project-info/ProjectDescription";
import ProjectDates from "./project-info/ProjectDates";

interface ProjectInfoFieldsProps {
  formData: SensorFolder;
  onChange: (field: keyof SensorFolder, value: string) => void;
}

const ProjectInfoFields: React.FC<ProjectInfoFieldsProps> = ({
  formData,
  onChange
}) => {
  return (
    <>
      <BasicProjectInfo
        name={formData.name}
        projectNumber={formData.projectNumber}
        insuranceCompany={formData.insuranceCompany}
        onChange={onChange}
      />

      <ProjectDates
        projectStartDate={formData.projectStartDate}
        projectEndDate={formData.projectEndDate}
        onChange={onChange}
      />

      <AddressSearch 
        address={formData.address}
        onChange={onChange}
      />
      
      <DirectionsDialog 
        address={formData.address}
        location={formData.location}
      />

      <ProjectDescription 
        description={formData.description}
        onChange={onChange}
      />
    </>
  );
};

export default ProjectInfoFields;
