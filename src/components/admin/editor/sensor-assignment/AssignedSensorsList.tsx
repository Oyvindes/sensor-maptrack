import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tag, X, Home, Droplet } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AssignedSensorsListProps {
	assignedSensors: Array<{ imei: string; name: string }>;
	onRemoveSensor: (sensorImei: string, e: React.MouseEvent) => void;
	sensorLocations?: Record<string, string>;
	sensorZones?: Record<string, 'wet' | 'dry'>;
	onLocationChange?: (sensorImei: string, location: string) => void;
	onZoneChange?: (sensorImei: string, zone: 'wet' | 'dry') => void;
}

const AssignedSensorsList: React.FC<AssignedSensorsListProps> = ({
	assignedSensors,
	onRemoveSensor,
	sensorLocations = {},
	sensorZones = {},
	onLocationChange,
	onZoneChange
}) => {
	if (assignedSensors.length === 0) {
		return null;
	}

	return (
		<div className="mb-6">
			<div className="mb-2">
				<Label className="text-sm font-medium flex items-center gap-2">
					<Tag className="h-4 w-4" />
					<span>Current Assignments</span>
					<Badge variant="secondary">{assignedSensors.length}</Badge>
				</Label>
			</div>
			<div className="grid grid-cols-1 gap-4">
				{assignedSensors.map((sensor) => (
					<div
						key={`assigned-${sensor.imei}`}
						className="p-3 rounded-md bg-muted/30 border"
					>
						<div className="flex items-center justify-between mb-3">
							<span className="text-sm font-medium">{sensor.name}</span>
							<Button
								variant="ghost"
								size="sm"
								className="h-8 w-8 p-0"
								onClick={(e) => onRemoveSensor(sensor.imei, e)}
							>
								<X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
							</Button>
						</div>
						
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							<div className="space-y-2">
								<Label className="text-xs flex items-center gap-1">
									<Home className="h-3 w-3" />
									<span>Location</span>
								</Label>
								<Input
									placeholder="e.g., Kitchen, Livingroom"
									className="h-8 text-sm"
									value={sensorLocations[sensor.imei] || ''}
									onChange={(e) => onLocationChange && onLocationChange(sensor.imei, e.target.value)}
								/>
							</div>
							
							<div className="space-y-2">
								<Label className="text-xs flex items-center gap-1">
									<Droplet className="h-3 w-3" />
									<span>Zone Type</span>
								</Label>
								<Select
									value={sensorZones[sensor.imei] || ''}
									onValueChange={(value) => onZoneChange && onZoneChange(sensor.imei, value as 'wet' | 'dry')}
								>
									<SelectTrigger className="h-8 text-sm">
										<SelectValue placeholder="Select zone type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="wet">Wet Zone</SelectItem>
										<SelectItem value="dry">Dry Zone</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default AssignedSensorsList;
