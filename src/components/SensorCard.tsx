import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import SensorCardHeader from './sensor/SensorCardHeader';
import SensorValueDisplay from './sensor/SensorValueDisplay';
import PowerDashboardButton from './power/PowerDashboardButton';

export type SensorType =
	| 'temperature'
	| 'humidity'
	| 'battery'
	| 'proximity'
	| 'signal'
	| 'adc1'
	| 'power';

export type SensorData = {
	id: string;
	name: string;
	values: SensorDataValues[];
	status: 'online' | 'offline' | 'warning';
	lastUpdated: string;
	companyId?: string;
	imei?: string;
	folderId?: string;
	projectName?: string;
	sensorType?: 'wood' | 'concrete' | 'power';
};

export type SensorDataValues = {
	1: any[];
	2: any[];
	3: any[];
	4: any[];
	5: any[];
	6: any[];
	7: any[];
	8: any[];
	DS18B20_Temp: number;
	IMEI: string;
	IMSI: string;
	Model: string;
	adc1: number;
	battery: number;
	digital_in: number;
	humidity: number;
	interrupt: number;
	interrupt_level: number;
	mod: number;
	signal: number;
	temperature: number;
	time: string;
};

type SensorCardProps = {
	sensor: SensorData;
	onClick?: () => void;
	className?: string;
};

const SensorCard: React.FC<SensorCardProps> = ({
	sensor,
	onClick,
	className
}) => {
	const [expanded, setExpanded] = useState(false);
	const { values, status, name, lastUpdated } = sensor;

	const handleToggle = () => {
		setExpanded(!expanded);
		if (onClick) onClick();
	};

	// Get the most recent sensor value timestamp if available
	const lastSeenTimestamp = values && values.length > 0
		? new Date(values[0].time).toLocaleString()
		: lastUpdated;

	return (
		<div
			className={cn(
				'glass-card rounded-xl p-6 cursor-pointer transition-all-ease hover:shadow-xl',
				className
			)}
			onClick={handleToggle}
		>
			<SensorCardHeader
				name={name}
				status={status}
				primaryType="temperature"
				expanded={expanded}
				onToggle={handleToggle}
				sensorType={sensor.sensorType}
			/>

			{expanded && values && values.length > 0 && (
				<div className="mt-4 space-y-4 animate-fade-in">
					{values.map((sensorValue, index) => (
						<SensorValueDisplay
							key={index}
							sensorValue={sensorValue}
						/>
					))}
				</div>
			)}

			{sensor.sensorType === 'power' && (
				<div
					className="mt-4 flex justify-between items-center"
					onClick={(e) => e.stopPropagation()} // Prevent card expansion when button is clicked
				>
					<PowerDashboardButton
						deviceId={sensor.id}
						deviceName={sensor.name}
						size="sm"
						showLabel={true}
					/>
				</div>
			)}

			<div className="mt-4 flex flex-col gap-1 text-xs text-muted-foreground">
				{sensor.projectName && (
					<div className="flex items-center gap-1">
						<span className="font-medium">Project:</span> {sensor.projectName}
					</div>
				)}
				<div>Last updated: {lastUpdated}</div>
				<div>Last seen: {lastSeenTimestamp}</div>
			</div>
		</div>
	);
};

export default SensorCard;
