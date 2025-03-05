
import React, { useState, useEffect } from "react";
import { SensorFolder, Company } from "@/types/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SectionContainer, SectionTitle } from "@/components/Layout";
import { ArrowLeft, UserRound, Clock, MapPin, Hash, Link } from "lucide-react";
import { getCurrentUser } from "@/services/authService";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { getMockSensors } from "@/services/sensorService";

interface SensorFolderEditorProps {
  folder: SensorFolder;
  companies: Company[];
  onSave: (folder: SensorFolder) => void;
  onCancel: () => void;
}

const SensorFolderEditor: React.FC<SensorFolderEditorProps> = ({
  folder,
  companies,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<SensorFolder>(folder);
  const [availableSensors, setAvailableSensors] = useState<Array<{ id: string; name: string }>>([]);
  const currentUser = getCurrentUser();
  const isMasterAdmin = currentUser?.role === 'master';

  useEffect(() => {
    // Filter sensors by company ID
    const allSensors = getMockSensors();
    const filteredSensors = allSensors
      .filter(sensor => sensor.companyId === formData.companyId)
      .map(sensor => ({
        id: sensor.id,
        name: sensor.name
      }));
    
    setAvailableSensors(filteredSensors);
  }, [formData.companyId]);

  const handleChange = (field: keyof SensorFolder, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSensorToggle = (sensorId: string, checked: boolean) => {
    setFormData(prev => {
      const currentAssignedSensors = prev.assignedSensorIds || [];
      let updatedSensors: string[];
      
      if (checked) {
        // Add the sensor to assigned list
        updatedSensors = [...currentAssignedSensors, sensorId];
      } else {
        // Remove the sensor from assigned list
        updatedSensors = currentAssignedSensors.filter(id => id !== sensorId);
      }
      
      return { ...prev, assignedSensorIds: updatedSensors };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleCompanyChange = (companyId: string) => {
    // When company changes, we need to:
    // 1. Update the form data with the new company ID
    // 2. Clear the assigned sensors as they might not belong to the new company
    setFormData(prev => ({
      ...prev,
      companyId,
      assignedSensorIds: [] // Reset assigned sensors
    }));
  };

  return (
    <SectionContainer>
      <div className="flex items-center mb-4 gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <SectionTitle>
          {folder.id.startsWith("folder-") && folder.id.length > 15 
            ? "Add New Project" 
            : `Edit Project: ${folder.name}`}
        </SectionTitle>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectNumber">
              <div className="flex items-center gap-1">
                <Hash className="h-4 w-4" />
                <span>Project Number</span>
              </div>
            </Label>
            <Input
              id="projectNumber"
              value={formData.projectNumber || ""}
              onChange={(e) => handleChange("projectNumber", e.target.value)}
              placeholder="e.g., PRJ-2023-001"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>Project Address</span>
            </div>
          </Label>
          <Input
            id="address"
            value={formData.address || ""}
            onChange={(e) => handleChange("address", e.target.value)}
            placeholder="Full address of the project location"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            value={formData.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={3}
          />
        </div>

        {isMasterAdmin ? (
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Select
              value={formData.companyId}
              onValueChange={handleCompanyChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map(company => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={companies.find(c => c.id === formData.companyId)?.name || ""}
              disabled
              className="bg-muted"
            />
          </div>
        )}

        <div className="space-y-2 pt-4 border-t">
          <Label className="flex items-center gap-1">
            <Link className="h-4 w-4" />
            <span>Assigned Sensors</span>
          </Label>
          <Card>
            <CardContent className="pt-6">
              {availableSensors.length === 0 ? (
                <p className="text-muted-foreground text-sm">No sensors available for this company</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {availableSensors.map(sensor => (
                    <div key={sensor.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`sensor-${sensor.id}`}
                        checked={(formData.assignedSensorIds || []).includes(sensor.id)}
                        onCheckedChange={(checked) => 
                          handleSensorToggle(sensor.id, checked === true)
                        }
                      />
                      <Label 
                        htmlFor={`sensor-${sensor.id}`}
                        className="text-sm font-normal"
                      >
                        {sensor.name}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {(formData.creatorName || formData.createdAt) && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              {formData.creatorName && (
                <div className="flex items-center gap-2">
                  <UserRound className="h-4 w-4" />
                  <span>Created by: {formData.creatorName}</span>
                </div>
              )}
              {formData.createdAt && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Created on: {formData.createdAt}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            Save Changes
          </Button>
        </div>
      </form>
    </SectionContainer>
  );
};

export default SensorFolderEditor;
