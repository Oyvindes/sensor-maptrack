
import React, { useState } from "react";
import { SensorFolder, Company } from "@/types/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SectionContainer, SectionTitle } from "@/components/Layout";
import { ArrowLeft, UserRound, Clock } from "lucide-react";
import { getCurrentUser } from "@/services/authService";

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
  const currentUser = getCurrentUser();
  const isMasterAdmin = currentUser?.role === 'master';

  const handleChange = (field: keyof SensorFolder, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <SectionContainer>
      <div className="flex items-center mb-4 gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <SectionTitle>
          {folder.id.startsWith("folder-") && folder.id.length > 15 
            ? "Add New Folder" 
            : `Edit Folder: ${folder.name}`}
        </SectionTitle>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Folder Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
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
              onValueChange={(value) => handleChange("companyId", value)}
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
