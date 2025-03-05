
import { SensorData, SensorType, SensorValue } from "@/components/SensorCard";
import { Company } from "@/types/users";

export interface SensorEditorProps {
  sensor: SensorData & { companyId?: string; imei?: string };
  companies?: Company[];
  onSave: (updatedSensor: SensorData & { companyId?: string; imei?: string }) => void;
  onCancel: () => void;
}

export interface SensorValueEditorProps {
  sensorValue: SensorValue;
  index: number;
  onChange: (index: number, field: keyof SensorValue, value: any) => void;
  onTypeChange: (index: number, value: string) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}
