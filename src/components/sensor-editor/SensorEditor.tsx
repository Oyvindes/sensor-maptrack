import React, { useState } from 'react';
import { SensorData, SensorType } from '@/components/SensorCard';
import { Button } from '@/components/ui/button';
import { Save, X, Plus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { SensorEditorProps } from './types';
import SensorValueEditor from './SensorValueEditor';
import SensorBasicInfo from './SensorBasicInfo';
import { getDefaultUnit } from './utils';

const SensorEditor: React.FC<SensorEditorProps> = ({
	sensor,
	companies = [],
	onSave,
	onCancel
}) => {
	const initialSensor = {
		...sensor,
		lastUpdated: sensor.lastUpdated || new Date().toLocaleString()
	};

	const [editedSensor, setEditedSensor] = useState<
		SensorData & { companyId?: string; imei?: string }
	>(initialSensor);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setEditedSensor((prev) => ({
			...prev,
			[name]: value
		}));
	};

	const handleValueChange = (index: number, value: any) => {
		setEditedSensor((prev) => {
			const newValues = [...prev.values];

			return {
				...prev,
				values: newValues
			};
		});
	};

	const handleTypeChange = (index: number, value: string) => {
		setEditedSensor((prev) => {
			return {
				...prev
			};
		});
	};

	const handleStatusChange = (value: string) => {
		setEditedSensor((prev) => ({
			...prev,
			status: value as 'online' | 'offline' | 'warning'
		}));
	};

	const handleCompanyChange = (value: string) => {
		setEditedSensor((prev) => ({
			...prev,
			companyId: value
		}));
	};

	const addSensorValue = () => {
		setEditedSensor((prev) => ({
			...prev
		}));
	};

	const removeSensorValue = (index: number) => {
		setEditedSensor((prev) => ({
			...prev,
			values: prev.values.filter((_, i) => i !== index)
		}));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// Update the lastUpdated timestamp when saving
		const updatedSensor = {
			...editedSensor,
			lastUpdated: new Date().toLocaleString()
		};
		onSave(updatedSensor);
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="glass-card p-6 rounded-lg space-y-4"
		>
			<div className="flex justify-between items-center mb-4">
				<h3 className="text-lg font-medium">
					{sensor.id.startsWith('sensor-')
						? 'Add New Sensor'
						: `Edit ${sensor.name}`}
				</h3>
				<Button
					size="sm"
					variant="ghost"
					onClick={onCancel}
					type="button"
				>
					<X className="h-4 w-4" />
				</Button>
			</div>

			<SensorBasicInfo
				sensor={editedSensor}
				companies={companies}
				onChange={handleChange}
				onStatusChange={handleStatusChange}
				onCompanyChange={handleCompanyChange}
			/>

			<div className="flex justify-end gap-2 pt-4">
				<Button variant="outline" onClick={onCancel} type="button">
					Cancel
				</Button>
				<Button type="submit" variant="outline" className="gap-2">
					<Save className="h-4 w-4" />
					Save Changes
				</Button>
			</div>
		</form>
	);
};

export default SensorEditor;
