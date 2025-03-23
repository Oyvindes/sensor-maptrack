
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SensorFolder, InsuranceCompany } from "@/types/users";
import { Hash, Building } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

interface BasicProjectInfoProps {
  name: string;
  projectNumber: string | undefined;
  insuranceCompany?: InsuranceCompany;
  onChange: (field: keyof SensorFolder, value: string) => void;
}

const BasicProjectInfo: React.FC<BasicProjectInfoProps> = ({
  name,
  projectNumber,
  insuranceCompany,
  onChange
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-4">
      {/* Project Name */}
      <div className="space-y-2">
        <Label htmlFor="name">{t('projectEditor.projectName')}</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => onChange("name", e.target.value)}
          required
        />
      </div>

      {/* Insurance Company */}
      <div className="space-y-2">
        <Label htmlFor="insuranceCompany">
          <div className="flex items-center gap-1">
            <Building className="h-4 w-4" />
            <span>{t('projectEditor.insuranceCompany')}</span>
          </div>
        </Label>
        <Select
          value={insuranceCompany}
          onValueChange={(value) => onChange("insuranceCompany", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('projectEditor.selectInsurance')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Gjensidige">Gjensidige</SelectItem>
            <SelectItem value="If">If</SelectItem>
            <SelectItem value="Tryg">Tryg</SelectItem>
            <SelectItem value="SpareBank 1">SpareBank 1</SelectItem>
            <SelectItem value="Storebrand">Storebrand</SelectItem>
            <SelectItem value="Fremtind">Fremtind</SelectItem>
            <SelectItem value="Eika Forsikring">Eika Forsikring</SelectItem>
            <SelectItem value="KLP">KLP</SelectItem>
            <SelectItem value="Protector Forsikring">Protector Forsikring</SelectItem>
            <SelectItem value="Frende Forsikring">Frende Forsikring</SelectItem>
            <SelectItem value="DNB Forsikring">DNB Forsikring</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Project Number */}
      <div className="space-y-2">
        <Label htmlFor="projectNumber">
          <div className="flex items-center gap-1">
            <Hash className="h-4 w-4" />
            <span>{t('projectEditor.projectNumber')}</span>
          </div>
        </Label>
        <Input
          id="projectNumber"
          value={projectNumber || ""}
          onChange={(e) => onChange("projectNumber", e.target.value)}
          placeholder={t('projectEditor.projectNumberPlaceholder')}
        />
      </div>
    </div>
  );
};

export default BasicProjectInfo;
