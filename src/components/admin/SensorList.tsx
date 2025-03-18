import React from 'react';
import { SensorData } from '@/components/SensorCard';
import { Plus, Folder, Pencil, FileUp, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionContainer, SectionTitle } from '@/components/Layout';
import { getSensorColor, getSensorIconComponent } from '@/utils/sensorUtils';
import { User } from '@/types/users';

interface SensorListProps {
	sensors: (SensorData & { folderId?: string })[];
	onSensorSelect: (sensor: SensorData & { folderId?: string }) => void;
	onAddNew: () => void;
	onImport: () => void;
	onDelete: () => void;
	currentUser?: User | null;
}

const SensorList: React.FC<SensorListProps> = ({
	sensors,
	onSensorSelect,
	onAddNew,
	onImport,
	onDelete,
	currentUser
}) => {
	// Check if user is a site-wide admin (master role)
	const isSiteAdmin = currentUser?.role === 'master';
	// Get the last seen timestamp for a sensor
	const getLastSeenTime = (sensor: SensorData) => {
		if (sensor.values && sensor.values.length > 0) {
			return new Date(sensor.values[0].time).toLocaleString();
		}
		return sensor.lastUpdated || 'Unknown';
	};

	return (
		<SectionContainer>
			<SectionTitle className="mb-2">Manage Sensors</SectionTitle>
			<div className="flex justify-start gap-2 mb-6">
				{isSiteAdmin && (
					<>
						<Button
							onClick={onImport}
							size="sm"
							variant="outline"
							className="h-12 w-16 px-4"
						>
							<span className="flex flex-col items-center gap-1">
							  <FileUp className="h-4 w-4" />
							  <span className="text-[10px]">Import</span>
							</span>
						</Button>
						<Button
							onClick={onDelete}
							size="sm"
							variant="outline"
							className="h-12 w-16 px-4 text-destructive"
						>
							<span className="flex flex-col items-center gap-1">
							  <Trash2 className="h-4 w-4" />
							  <span className="text-[10px]">Delete</span>
							</span>
						</Button>
					</>
				)}
				<Button onClick={onAddNew} size="sm" className="h-12 w-16 px-4">
					<span className="flex flex-col items-center gap-1">
						 <Plus className="h-4 w-4" />
						 <span className="text-[10px]">New</span>
					</span>
				</Button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{sensors.map((sensor) => {
					const primaryValue =
						sensor.values && sensor.values.length > 0
							? sensor.values[0]
							: null;
					const IconComponent = getSensorIconComponent('temperature');
					const lastSeen = getLastSeenTime(sensor);

					return (
						<div
							key={sensor.id}
							className="glass-card p-4 rounded-lg hover:shadow-md transition-all-ease"
						>
							<div className="flex items-center justify-between mb-2">
								<div className="flex items-center gap-2">
									<div
										className={`sensor-pulse ${getSensorColor(
											'temperature'
										)}`}
									>
										<IconComponent className="h-5 w-5" />
									</div>
									<h3 className="font-medium">
										{sensor.name}
									</h3>
								</div>
								<Button
									size="sm"
									variant="ghost"
									onClick={() => onSensorSelect(sensor)}
								>
									<span className="flex flex-col items-center gap-1">
										<Pencil className="h-4 w-4" />
										<span className="text-[10px]">Edit</span>
									</span>
								</Button>
							</div>
							<div className="text-sm text-muted-foreground">
								{sensor.values.length} sensor value
								{sensor.values.length !== 1 ? 's' : ''}
							</div>
							<div className="flex flex-col gap-1 mt-2">
								<div className="flex justify-between">
									<div className="text-xs text-muted-foreground">
										Status: {sensor.status}
									</div>
									{sensor.projectName ? (
										<div className="text-xs flex items-center gap-1">
											<Folder className="h-3 w-3" />
											<span>{sensor.projectName}</span>
										</div>
									) : sensor.folderId ? (
										<div className="text-xs flex items-center gap-1">
											<Folder className="h-3 w-3" />
											<span>Project {sensor.folderId.substring(0, 8)}...</span>
										</div>
									) : null}
								</div>
								<div className="text-xs text-muted-foreground">
									Last seen: {lastSeen}
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</SectionContainer>
	);
};

export default SensorList;
