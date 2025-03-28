import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tag, X, Home, Droplet, Gauge, Power, Thermometer } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';

interface AssignedSensorsListWithPlugsProps {
	assignedSensors: Array<{ imei: string; name: string; sensorType?: string }>;
	onRemoveSensor: (sensorImei: string, e: React.MouseEvent) => void;
	sensorLocations?: Record<string, string>;
	sensorZones?: Record<string, 'wet' | 'dry'>;
	sensorTypes?: Record<string, 'wood' | 'concrete'>;
	onLocationChange?: (sensorImei: string, location: string) => void;
	onZoneChange?: (sensorImei: string, zone: 'wet' | 'dry') => void;
	onTypeChange?: (sensorImei: string, type: 'wood' | 'concrete') => void;
}

const AssignedSensorsListWithPlugs: React.FC<AssignedSensorsListWithPlugsProps> = ({
	assignedSensors,
	onRemoveSensor,
	sensorLocations = {},
	sensorZones = {},
	sensorTypes = {},
	onLocationChange,
	onZoneChange,
	onTypeChange
}) => {
	const { t } = useTranslation();
	
	if (assignedSensors.length === 0) {
		return null;
	}

	return (
		<div className="mb-6">
			<div className="mb-2">
				<Label className="text-sm font-medium flex items-center gap-2">
					<Tag className="h-4 w-4" />
					<span>{t('sensorAssignment.currentAssignments')}</span>
					<Badge variant="secondary">{assignedSensors.length}</Badge>
				</Label>
			</div>
			<div className="grid grid-cols-1 gap-4">
				{assignedSensors.map((sensor) => {
					const isPowerPlug = sensor.sensorType === 'power';
					
					return (
						<div
							key={`assigned-${sensor.imei}`}
							className="p-3 rounded-md bg-muted/30 border"
						>
							<div className="flex items-center justify-between mb-3">
								<div className="flex items-center gap-2">
									{isPowerPlug ? (
										<Power className="h-4 w-4 text-green-500" />
									) : (
										<Thermometer className="h-4 w-4 text-blue-500" />
									)}
									<span className="text-sm font-medium">{sensor.name}</span>
								</div>
								<Button
									variant="ghost"
									size="sm"
									className="h-8 w-8 p-0"
									onClick={(e) => onRemoveSensor(sensor.imei, e)}
								>
									<X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
								</Button>
							</div>
							
							<div className={`grid grid-cols-1 ${isPowerPlug ? 'md:grid-cols-1' : 'md:grid-cols-3'} gap-3`}>
								<div className="space-y-2">
									<Label className="text-xs flex items-center gap-1">
										<Home className="h-3 w-3" />
										<span>{t('sensorAssignment.location')}</span>
									</Label>
									<Input
										placeholder={t('sensorAssignment.locationPlaceholder')}
										className="h-8 text-sm"
										value={sensorLocations[sensor.imei] || ''}
										onChange={(e) => onLocationChange && onLocationChange(sensor.imei, e.target.value)}
									/>
								</div>
								
								{!isPowerPlug && (
									<>
										<div className="space-y-2">
											<Label className="text-xs flex items-center gap-1">
												<Droplet className="h-3 w-3" />
												<span>{t('sensorAssignment.zoneType')}</span>
											</Label>
											<Select
												value={sensorZones[sensor.imei] || ''}
												onValueChange={(value) => onZoneChange && onZoneChange(sensor.imei, value as 'wet' | 'dry')}
											>
												<SelectTrigger className="h-8 text-sm">
													<SelectValue placeholder={t('sensorAssignment.selectZoneType')} />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="wet">{t('sensorAssignment.wetZone')}</SelectItem>
													<SelectItem value="dry">{t('sensorAssignment.dryZone')}</SelectItem>
												</SelectContent>
											</Select>
										</div>

										<div className="space-y-2">
											<Label className="text-xs flex items-center gap-1">
												<Gauge className="h-3 w-3" />
												<span>{t('sensorAssignment.materialType')}</span>
											</Label>
											<Select
												value={sensorTypes[sensor.imei] || ''}
												onValueChange={(value) => onTypeChange && onTypeChange(sensor.imei, value as 'wood' | 'concrete')}
											>
												<SelectTrigger className="h-8 text-sm">
													<SelectValue placeholder={t('sensorAssignment.selectMaterialType')} />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="concrete">{t('sensorAssignment.concrete')}</SelectItem>
													<SelectItem value="wood">{t('sensorAssignment.wood')}</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default AssignedSensorsListWithPlugs;