
import React from "react";
import { User, Company } from "@/types/users";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Shield } from "lucide-react";
import { isProtectedUser } from "../utils/userEditorUtils";

interface UserRoleFieldsProps {
  formData: User;
  companies: Company[];
  handleChange: (field: keyof User, value: string | boolean) => void;
  isMasterAdmin: boolean;
}

const UserRoleFields: React.FC<UserRoleFieldsProps> = ({
  formData,
  companies,
  handleChange,
  isMasterAdmin
}) => {
  // Check if user is the protected oe@briks.no account
  const isProtected = isProtectedUser(formData.email);

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select
          value={formData.role}
          onValueChange={(value: "admin" | "user" | "master") => handleChange("role", value)}
          disabled={isProtected} // Disable role selection for protected user
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
        {isProtected && (
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
            {(formData.role === "master" || isProtected) && (
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

      {(formData.role === "admin" || isProtected) && (
        <div className="flex items-center space-x-2">
          <Switch
            id="company-admin"
            checked={formData.isCompanyAdmin === true || isProtected}
            onCheckedChange={(checked) => handleChange("isCompanyAdmin", checked)}
            disabled={isProtected} // Disable switch for protected user
          />
          <Label htmlFor="company-admin">Company Administrator</Label>
          {isProtected && (
            <span className="text-xs text-amber-500">(cannot be changed)</span>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value: "active" | "inactive") => handleChange("status", value)}
          disabled={isProtected} // Disable status selection for protected user
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        {isProtected && (
          <p className="text-sm text-amber-500 mt-1">
            This user must remain active.
          </p>
        )}
      </div>
    </>
  );
};

export default UserRoleFields;
