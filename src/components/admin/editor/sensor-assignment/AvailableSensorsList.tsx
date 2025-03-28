import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Power, Thermometer } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AvailableSensorsListProps {
	availableSensors: Array<{ imei: string; name: string; sensorType?: string }>;
	assignedSensorImeis: string[];
	onSensorToggle: (sensorImei: string, checked: boolean) => void;
}

const AvailableSensorsList: React.FC<AvailableSensorsListProps> = ({
	availableSensors,
	assignedSensorImeis,
	onSensorToggle
}) => {
	const { t } = useTranslation();
	
	if (availableSensors.length === 0) {
		return (
			<p className="text-muted-foreground text-sm">
				{t('sensorAssignment.noSensorsAvailable')}
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
							<div className="flex items-center gap-2">
								{sensor.sensorType === 'power' ? (
									<Power className="h-3 w-3 text-green-500" />
								) : (
									<Thermometer className="h-3 w-3 text-blue-500" />
								)}
								<span>{sensor.name}</span>
							</div>
						</Label>
						{isAssigned && (
							<Badge
								variant="outline"
								className="ml-auto text-xs"
							>
								{t('sensorAssignment.assigned')}
							</Badge>
						)}
					</div>
				);
			})}
		</div>
	);
};

export default AvailableSensorsList;
