
import React from "react";
import { SensorData } from "@/components/SensorCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Company } from "@/types/users";

interface SensorBasicInfoProps {
  sensor: SensorData & { companyId?: string; imei?: string };
  companies: Company[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStatusChange: (value: string) => void;
  onCompanyChange: (value: string) => void;
}

const SensorBasicInfo: React.FC<SensorBasicInfoProps> = ({
  sensor,
  companies,
  onChange,
  onStatusChange,
  onCompanyChange
}) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Sensor Name</Label>
        <Input
          id="name"
          name="name"
          value={sensor.name}
          onChange={onChange}
          required
        />
      </div>
      
      <div className="space-y-2 mt-4">
        <Label htmlFor="imei">IMEI</Label>
        <Input
          id="imei"
          name="imei"
          value={sensor.imei || ""}
          onChange={onChange}
          placeholder="Enter device IMEI"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select 
            value={sensor.status} 
            onValueChange={onStatusChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyId">Company</Label>
          <Select 
            value={sensor.companyId || ""} 
            onValueChange={onCompanyChange}
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
      </div>
    </>
  );
};

export default SensorBasicInfo;
