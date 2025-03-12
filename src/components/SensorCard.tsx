import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import SensorCardHeader from './sensor/SensorCardHeader';
import SensorValueDisplay from './sensor/SensorValueDisplay';

export type SensorType =
	| 'temperature'
	| 'humidity'
	| 'battery'
	| 'proximity'
	| 'signal';

export type SensorData = {
	id: string;
	name: string;
	values: string[];
	status: 'online' | 'offline' | 'warning';
	lastUpdated: string;
	companyId?: string;
	imei?: string;
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

			<div className="mt-4 text-xs text-muted-foreground">
				Last updated: {lastUpdated}
			</div>
		</div>
	);
};

export default SensorCard;
