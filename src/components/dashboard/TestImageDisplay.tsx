import React from "react";
import { SensorFolder } from "@/types/users";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";

interface TestImageDisplayProps {
  project: SensorFolder;
}

/**
 * Component to display test images for a project
 */
const TestImageDisplay: React.FC<TestImageDisplayProps> = ({
  project
}) => {
  const testImages = project.sensorImages || [];

  if (testImages.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Test Images</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4 bg-muted/50 rounded-md">
            <p className="text-muted-foreground">No test images available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Test Images</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {testImages.map((imageUrl, index) => (
            <div key={index} className="rounded-md overflow-hidden border">
              <img 
                src={imageUrl} 
                alt={`Test image ${index + 1}`} 
                className="w-full h-40 object-cover"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TestImageDisplay;