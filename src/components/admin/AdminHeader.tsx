
import React from "react";
import { Button } from "@/components/ui/button";
import { PageHeader, PageTitle, PageSubtitle } from "@/components/Layout";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const AdminHeader: React.FC = () => {
  return (
    <PageHeader>
      <div className="flex items-center justify-between">
        <div>
          <PageTitle>Admin Panel</PageTitle>
          <PageSubtitle>
            Manage sensors and tracking devices
          </PageSubtitle>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            asChild
          >
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
          </Button>
        </div>
      </div>
    </PageHeader>
  );
};

export default AdminHeader;
