import React from "react";
import { SensorFolder, PdfRecord } from "@/types/users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileIcon, Download, Eye } from "lucide-react";
import { toast } from "sonner";
import { getPdfContent } from "@/services/pdf/supabasePdfService";

interface ProjectPdfHistoryProps {
  project: SensorFolder;
  className?: string;
}

const ProjectPdfHistory: React.FC<ProjectPdfHistoryProps> = ({
  project,
  className
}) => {
  if (!project.pdfHistory || project.pdfHistory.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">PDF Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center space-y-2 p-4">
            <FileIcon className="h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No reports generated yet</p>
            <p className="text-xs text-muted-foreground">
              Reports are automatically generated when a project is stopped
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleViewPdf = async (pdfRecord: PdfRecord) => {
    try {
      toast.loading("Loading PDF...");
      const result = await getPdfContent(pdfRecord.id);
      
      if (!result || !result.blob) {
        toast.error("PDF is no longer available. Please regenerate the report.");
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
      console.error("Error viewing PDF:", error);
      toast.error("Failed to load PDF. Please try again.");
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">PDF Reports ({project.pdfHistory.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[300px] overflow-auto pr-2">
          {project.pdfHistory.slice().reverse().map((pdf) => (
            <div 
              key={pdf.id} 
              className="flex items-center justify-between p-3 border rounded-md hover:bg-accent/20 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <FileIcon className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">{pdf.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(pdf.createdAt).toLocaleString()} 
                    {pdf.creatorName && ` • ${pdf.creatorName}`}
                  </p>
                </div>
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleViewPdf(pdf)}
                  title="View PDF"
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

export default ProjectPdfHistory;