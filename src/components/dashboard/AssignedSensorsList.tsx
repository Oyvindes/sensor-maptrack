import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Thermometer, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SensorFolder } from '@/types/users';
import { toast } from 'sonner';

interface AssignedSensorsListProps {
	project: SensorFolder;
	onAssignSensor?: () => void;
	className?: string;
}

/**
 * Component to display and manage sensors assigned to a project
 */
const AssignedSensorsList: React.FC<AssignedSensorsListProps> = ({
	project,
	onAssignSensor,
	className
}) => {
	const assignedSensorImeis = project.assignedSensorImeis || [];

	const handleUnassignSensor = (sensorImei: string) => {
		toast.success(`Sensor ${sensorImei} unassigned from project`);
		// In a real app, you would update the project here
	};

	return (
		<Card className={cn('w-full', className)}>
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between">
					<CardTitle className="text-base">
						Assigned Sensors
					</CardTitle>
					<Button
						variant="ghost"
						size="sm"
						className="h-8 px-2"
						onClick={onAssignSensor}
					>
						<PlusCircle className="h-4 w-4 mr-1" />
						<span>Assign</span>
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				{assignedSensorImeis.length === 0 ? (
					<div className="text-center p-4 text-muted-foreground text-sm">
						No sensors assigned to this project
					</div>
				) : (
					<div className="space-y-2">
						{assignedSensorImeis.map((sensorImei) => (
							<div
								key={sensorImei}
								className="flex items-center justify-between p-2 rounded-md bg-muted/50"
							>
								<div className="flex items-center gap-2">
									<Thermometer className="h-4 w-4 text-primary" />
									<span className="text-sm">
										{sensorImei}
									</span>
								</div>
								<div className="flex items-center gap-1">
									<Button
										variant="ghost"
										size="icon"
										className="h-6 w-6 rounded-full"
										onClick={() =>
											toast.info(
												`Viewing sensor ${sensorImei}`
											)
										}
									>
										<Check className="h-3 w-3" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="h-6 w-6 rounded-full text-destructive"
										onClick={() =>
											handleUnassignSensor(sensorImei)
										}
									>
										<X className="h-3 w-3" />
									</Button>
								</div>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export default AssignedSensorsList;
