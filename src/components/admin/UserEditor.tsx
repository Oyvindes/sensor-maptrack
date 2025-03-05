
import React, { useState, useEffect } from "react";
import { User, Company } from "@/types/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionContainer, SectionTitle } from "@/components/Layout";
import { ArrowLeft, Eye, EyeOff, Shield } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { getCurrentUser } from "@/services/authService";

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
    if (formData.email === "oe@briks.no" && formData.role !== "master") {
      setFormData(prev => ({ 
        ...prev, 
        role: "master" as const, // This is now correctly typed as "master" literal
        isCompanyAdmin: true 
      }));
    }
  }, [formData.email, formData.role]);

  const handleChange = (field: keyof User, value: string | boolean) => {
    // Prevent changing role for oe@briks.no
    if (field === "role" && formData.email === "oe@briks.no") {
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
    if (formData.email === "oe@briks.no") {
      const updatedUser: User = {
        ...formData,
        role: "master",
        isCompanyAdmin: true
      };
      onSave(updatedUser);
    } else {
      onSave(formData);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Check if user is the protected oe@briks.no account
  const isProtectedUser = formData.email === "oe@briks.no";
  
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
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select
            value={formData.role}
            onValueChange={(value: "admin" | "user" | "master") => handleChange("role", value)}
            disabled={isProtectedUser} // Disable role selection for protected user
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
              {/* Only show Master Admin option if current user is a master admin or user being edited is already master */}
              {(isMasterAdmin || formData.role === "master") && (
                <SelectItem value="master">
                  <div className="flex items-center gap-1">
                    <Shield className="h-3.5 w-3.5 text-amber-500" />
                    <span>Master Admin</span>
                  </div>
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {isProtectedUser && (
            <p className="text-sm text-amber-500 mt-1">
              This user is a permanent site-wide admin and cannot be changed.
            </p>
          )}
          {formData.role === "master" && (
            <p className="text-sm text-amber-500 mt-1">
              Master admins have full access to all companies and features.
            </p>
          )}
        </div>

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
              {(formData.role === "master" || isProtectedUser) && (
                <SelectItem value="system">System</SelectItem>
              )}
              {companies.map(company => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {(formData.role === "admin" || isProtectedUser) && (
          <div className="flex items-center space-x-2">
            <Switch
              id="company-admin"
              checked={formData.isCompanyAdmin === true || isProtectedUser}
              onCheckedChange={(checked) => handleChange("isCompanyAdmin", checked)}
              disabled={isProtectedUser} // Disable switch for protected user
            />
            <Label htmlFor="company-admin">Company Administrator</Label>
            {isProtectedUser && (
              <span className="text-xs text-amber-500">(cannot be changed)</span>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value: "active" | "inactive") => handleChange("status", value)}
            disabled={isProtectedUser} // Disable status selection for protected user
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          {isProtectedUser && (
            <p className="text-sm text-amber-500 mt-1">
              This user must remain active.
            </p>
          )}
        </div>

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
