import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface AvailableSensorsListProps {
	availableSensors: Array<{ imei: string; name: string }>;
	assignedSensorImeis: string[];
	onSensorToggle: (sensorImei: string, checked: boolean) => void;
}

const AvailableSensorsList: React.FC<AvailableSensorsListProps> = ({
	availableSensors,
	assignedSensorImeis,
	onSensorToggle
}) => {
	if (availableSensors.length === 0) {
		return (
			<p className="text-muted-foreground text-sm">
				No sensors available for this company
			</p>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
			{availableSensors.map((sensor) => {
				const isAssigned = assignedSensorImeis.includes(sensor.imei);

				return (
					<div
						key={sensor.imei}
						className={`flex items-center space-x-2 p-2 rounded-md ${
							isAssigned ? 'bg-muted/50' : ''
						}`}
					>
						<Checkbox
							id={`sensor-${sensor.imei}`}
							checked={isAssigned}
							onCheckedChange={(checked) =>
								onSensorToggle(sensor.imei, checked === true)
							}
						/>
						<Label
							htmlFor={`sensor-${sensor.imei}`}
							className={`text-sm font-normal flex-1 ${
								isAssigned ? 'font-medium' : ''
							}`}
						>
							{sensor.name}
						</Label>
						{isAssigned && (
							<Badge
								variant="outline"
								className="ml-auto text-xs"
							>
								Assigned
							</Badge>
						)}
					</div>
				);
			})}
		</div>
	);
};

export default AvailableSensorsList;
