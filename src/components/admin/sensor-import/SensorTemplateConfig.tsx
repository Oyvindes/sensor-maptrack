
import React, { useState } from 'react';
import { SensorData } from '@/components/SensorCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import SensorValueEditor from '@/components/sensor-editor/SensorValueEditor';
import { Plus } from 'lucide-react';
import { getDefaultUnit } from '@/components/sensor-editor/utils';
import { SensorValue, SensorDataValues, convertToSensorValue, convertToSensorDataValues } from '@/types/sensor';

interface SensorTemplateConfigProps {
	template: Omit<SensorData, 'id'> & { companyId?: string };
	onTemplateChange: (
		template: Omit<SensorData, 'id'> & { companyId?: string }
	) => void;
	companies: { id: string; name: string }[];
}

const SensorTemplateConfig: React.FC<SensorTemplateConfigProps> = ({
	template,
	onTemplateChange,
	companies
}) => {
	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onTemplateChange({
			...template,
			name: e.target.value
		});
	};

	const handleStatusChange = (value: string) => {
		onTemplateChange({
			...template,
			status: value as 'online' | 'offline' | 'warning'
		});
	};

	const handleCompanyChange = (value: string) => {
		onTemplateChange({
			...template,
			companyId: value
		});
	};

	const handlePrefixToggle = (checked: boolean) => {
		setUsePrefix(checked);
	};

	const [usePrefix, setUsePrefix] = useState(true);

	// Convert SensorDataValues to SensorValue for the UI
	const simplifiedValues = template.values.map(value => convertToSensorValue(value));

	const handleValueChange = (
		index: number,
		field: keyof SensorValue,
		value: any
	) => {
		const newValues = [...simplifiedValues];
		newValues[index] = {
			...newValues[index],
			[field]: field === 'value' ? parseFloat(value) : value
		};

		// Convert back to SensorDataValues
		const updatedDataValues = template.values.map((original, i) => 
			i === index 
				? { ...original, ...convertToSensorDataValues(newValues[i]) }
				: original
		);

		onTemplateChange({
			...template,
			values: updatedDataValues
		});
	};

	const handleTypeChange = (index: number, value: string) => {
		const newValues = [...simplifiedValues];
		newValues[index] = {
			...newValues[index],
			type: value,
			unit: getDefaultUnit(value)
		};

		// Convert back to SensorDataValues
		const updatedDataValues = template.values.map((original, i) => 
			i === index 
				? { ...original, ...convertToSensorDataValues(newValues[i]) }
				: original
		);

		onTemplateChange({
			...template,
			values: updatedDataValues
		});
	};

	const addSensorValue = () => {
		// Create new value with default properties
		const defaultValue: SensorDataValues = {
			1: [],
			2: [],
			3: [],
			4: [],
			5: [],
			6: [],
			7: [],
			8: [],
			DS18B20_Temp: 0,
			IMEI: '',
			IMSI: '',
			Model: '',
			adc1: 0,
			battery: 0,
			digital_in: 0,
			humidity: 0,
			interrupt: 0,
			interrupt_level: 0,
			mod: 0,
			signal: 0,
			temperature: 0,
			time: new Date().toISOString(),
			type: "temperature",
			value: 0,
			unit: "°C"
		};

		onTemplateChange({
			...template,
			values: [...template.values, defaultValue]
		});
	};

	const removeSensorValue = (index: number) => {
		onTemplateChange({
			...template,
			values: template.values.filter((_, i) => i !== index)
		});
	};

	return (
		<Card>
			<CardContent className="pt-6 space-y-4">
				<h3 className="text-lg font-medium mb-2">
					Sensor Template Configuration
				</h3>
				<div className="text-sm text-muted-foreground mb-4">
					Configure the template to use when importing sensors from
					CSV
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label htmlFor="template-name">Name Template</Label>
						<Input
							id="template-name"
							placeholder="Sensor {imei}"
							value={template.name}
							onChange={handleNameChange}
						/>
						<p className="text-xs text-muted-foreground">
							Use {'{imei}'} as placeholder for the IMEI number
						</p>
					</div>

					<div className="space-y-2">
						<Label htmlFor="template-company">Company</Label>
						<Select
							value={template.companyId}
							onValueChange={handleCompanyChange}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select company" />
							</SelectTrigger>
							<SelectContent>
								{companies.map((company) => (
									<SelectItem
										key={company.id}
										value={company.id}
									>
										{company.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="template-status">Status</Label>
					<Select
						value={template.status}
						onValueChange={handleStatusChange}
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
			</CardContent>
		</Card>
	);
};

export default SensorTemplateConfig;
