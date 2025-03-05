
import React, { useState, useEffect } from "react";
import { User, Company } from "@/types/users";
import { Button } from "@/components/ui/button";
import { SectionContainer, SectionTitle } from "@/components/Layout";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/services/authService";
import UserDetailsFields from "./user-editor/UserDetailsFields";
import UserRoleFields from "./user-editor/UserRoleFields";
import { ensureProtectedUserPermissions, isProtectedUser } from "./utils/userEditorUtils";

interface UserEditorProps {
  user: User;
  companies: Company[];
  onSave: (user: User) => void;
  onCancel: () => void;
}

const UserEditor: React.FC<UserEditorProps> = ({
  user,
  companies,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<User>(user);
  const [showPassword, setShowPassword] = useState(false);
  const currentUser = getCurrentUser();
  
  // Always ensure oe@briks.no is a master admin
  useEffect(() => {
    if (isProtectedUser(formData.email)) {
      setFormData(prev => ensureProtectedUserPermissions(prev));
    }
  }, [formData.email, formData.role]);

  const handleChange = (field: keyof User, value: string | boolean) => {
    // Prevent changing role for oe@briks.no
    if (field === "role" && isProtectedUser(formData.email)) {
      return; // Don't allow role change for this specific user
    }
    
    // Type checking for role field to ensure it only accepts valid values
    if (field === "role") {
      // Make sure value is one of the allowed role types
      if (value === "admin" || value === "user" || value === "master") {
        setFormData(prev => ({ ...prev, [field]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure oe@briks.no is always master and company admin before saving
    if (isProtectedUser(formData.email)) {
      const updatedUser = ensureProtectedUserPermissions(formData);
      onSave(updatedUser);
    } else {
      onSave(formData);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Check if current user is a site-wide admin (master role)
  const isMasterAdmin = currentUser?.role === "master";

  return (
    <SectionContainer>
      <div className="flex items-center mb-4 gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <SectionTitle>
          {user.id.startsWith("user-") && user.id.length > 12 
            ? "Add New User" 
            : `Edit User: ${user.name}`}
        </SectionTitle>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <UserDetailsFields 
          formData={formData}
          showPassword={showPassword}
          togglePasswordVisibility={togglePasswordVisibility}
          handleChange={handleChange}
        />

        <UserRoleFields
          formData={formData}
          companies={companies}
          handleChange={handleChange}
          isMasterAdmin={isMasterAdmin}
        />

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

export default UserEditor;
