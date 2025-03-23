import React from "react";
import { SensorFolder, ReportRecord } from "@/types/users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileIcon, Download, Eye, FileText, FileCode } from "lucide-react";
import { toast } from "sonner";
import { getReportContent } from "@/services/report/reportService";

interface ProjectReportHistoryProps {
  project: SensorFolder;
  className?: string;
}

const ProjectReportHistory: React.FC<ProjectReportHistoryProps> = ({
  project,
  className
}) => {
  if (!project.pdfHistory || project.pdfHistory.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center space-y-2 p-4">
            <FileIcon className="h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No reports generated yet</p>
            <p className="text-xs text-muted-foreground">
              Generate reports using the Report button above
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleViewReport = async (report: ReportRecord) => {
    try {
      toast.loading(`Loading ${(report.type || 'pdf').toUpperCase()} report...`);
      const result = await getReportContent(report.id);
      
      if (!result || !result.blob) {
        toast.error("Report is no longer available. Please regenerate the report.");
        return;
      }
      
      // Create a blob URL and open it in a new tab
      const blobUrl = URL.createObjectURL(result.blob);
      window.open(blobUrl, '_blank');
      
      // Clean up the blob URL after opening
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 1000);
      
      toast.dismiss();
    } catch (error) {
      console.error(`Error viewing ${report.type || 'pdf'} report:`, error);
      toast.error(`Failed to load ${report.type || 'pdf'} report. Please try again.`);
    }
  };

  // Get the report icon based on type
  const getReportIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-primary" />;
      case 'html':
        return <FileCode className="h-5 w-5 text-emerald-500" />;
      default:
        return <FileIcon className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Reports ({project.pdfHistory.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[300px] overflow-auto pr-2">
          {project.pdfHistory.slice().reverse().map((report) => (
            <div 
              key={report.id} 
              className="flex items-center justify-between p-3 border rounded-md hover:bg-accent/20 transition-colors"
            >
              <div className="flex items-center space-x-3">
                {getReportIcon(report.type || 'pdf')}
                <div>
                  <p className="text-sm font-medium">
                    {report.filename}
                    <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                      {report.type || 'pdf'}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(report.createdAt).toLocaleString()} 
                    {report.creatorName && ` • ${report.creatorName}`}
                  </p>
                </div>
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleViewReport(report)}
                  title={`View ${(report.type || 'pdf').toUpperCase()} Report`}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectReportHistory;