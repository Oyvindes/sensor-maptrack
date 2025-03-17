import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Sensor, Device, TrackingObject } from '@/types/sensors';
import FlyToLocation from './FlyToLocation';
import FitBoundsToMarkers from './FitBoundsToMarkers';
import DeviceMarker from './DeviceMarker';
import SensorMarker from './SensorMarker';
import TrackingObjectMarker from './TrackingObjectMarker';
import {
	getMapCenter,
	addPopupInteractionStyles,
	getBoundsForAllMarkers
} from './mapUtils';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import './MapIcon'; // Import to ensure default icon is set

interface TrackingMapProps {
	devices?: Device[];
	sensors?: Sensor[];
	objects?: TrackingObject[];
	highlightId?: string;
	focusLocation?: [number, number];
	focusZoom?: number;
	fitAllMarkers?: boolean; // Controls the initial fit, but user zoom is maintained
	autoFitMarkers?: boolean; // If true, continuously fit to markers (legacy behavior)
	onDeviceClick?: (deviceId: string) => void;
	onSensorClick?: (sensorImei: string) => void;
	onObjectSelect?: (object: TrackingObject) => void;
	className?: string;
	renderCustomPopup?: (
		item: Device | Sensor | TrackingObject
	) => React.ReactNode;
}

const TrackingMap: React.FC<TrackingMapProps> = ({
	devices = [],
	sensors = [],
	objects = [],
	highlightId,
	focusLocation,
	focusZoom = 16,
	fitAllMarkers = false,
	autoFitMarkers = false, // Default to false for the new prop
	onDeviceClick,
	onSensorClick,
	onObjectSelect,
	className = 'h-[500px] w-full rounded-md border',
	renderCustomPopup
}) => {
	const mapCenter = getMapCenter(focusLocation, devices, sensors, objects);
	const allMarkersBounds = getBoundsForAllMarkers(devices, sensors, objects);

	// State to track if we should fit bounds (for reset button)
	const [shouldFitBounds, setShouldFitBounds] = useState(fitAllMarkers);

	// Reset when fitAllMarkers changes
	useEffect(() => {
		if (fitAllMarkers) {
			setShouldFitBounds(true);
			// Reset after fitting bounds
			setTimeout(() => setShouldFitBounds(false), 1000);
		}
	}, [fitAllMarkers]);

	useEffect(() => {
		// Disable auto-close for popups when clicking inside them (for buttons)
		const style = addPopupInteractionStyles();

		return () => {
			document.head.removeChild(style);
		};
	}, []);

	// Handler for reset zoom button
	const handleResetZoom = () => {
		if (allMarkersBounds) {
			// If we have valid bounds, fit to them
			setShouldFitBounds(true);
			// Reset after fitting bounds
			setTimeout(() => setShouldFitBounds(false), 1000);
		} else if (devices.length > 0 || sensors.length > 0 || objects.length > 0) {
			// If we have markers but no valid bounds, try to recalculate
			console.log('Attempting to recalculate bounds for reset view');
			// This will trigger a re-render which might recalculate bounds
			setShouldFitBounds(true);
			setTimeout(() => setShouldFitBounds(false), 1000);
		} else {
			// If no markers at all, just reset to default view
			console.log('No markers to fit, resetting to default view');
			// Could add a default view reset here if needed
		}
	};

	return (
		<div className={`${className} relative`}>
			{/* Reset zoom button - always visible */}
			<div className="absolute top-3 right-3 z-[9999]">
				<Button
					variant="default"
					size="sm"
					className="bg-black/80 hover:bg-black/90 text-white border-none shadow-md"
					onClick={handleResetZoom}
				>
					<RefreshCw className="w-4 h-4 mr-1" /> Reset View
				</Button>
			</div>

			<MapContainer
				style={{ height: '100%', width: '100%' }}
				// Need to explicitly type this as any to work around the type error
				// The react-leaflet types are not correctly matching the actual props
				{...({
					center: mapCenter,
					zoom: focusLocation ? focusZoom : 13
				} as any)}
			>
				<TileLayer
					// Need to explicitly type this as any to work around the type error
					{...({
						url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
						attribution:
							'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					} as any)}
				/>

				{/* Add FlyToLocation component to handle dynamic location changes */}
				{focusLocation && !shouldFitBounds && (
					<FlyToLocation position={focusLocation} zoom={focusZoom} />
				)}

				{/* Add FitBoundsToMarkers component to fit bounds to all markers - only when shouldFitBounds is true */}
				{(shouldFitBounds || autoFitMarkers) && (
					<FitBoundsToMarkers
						bounds={allMarkersBounds || [
							[63.4205, 10.3851], // Default bounds centered on Trondheim
							[63.4405, 10.4051]  // with a small area
						]}
					/>
				)}

				{/* Display devices */}
				{devices.map((device) => (
					<DeviceMarker
						key={device.id}
						device={device}
						onDeviceClick={onDeviceClick}
						renderCustomPopup={
							renderCustomPopup as (
								device: Device
							) => React.ReactNode
						}
					/>
				))}

				{/* Display sensors */}
				{sensors.map((sensor) => (
					<SensorMarker
						key={sensor.id}
						sensor={sensor}
						onSensorClick={onSensorClick}
						renderCustomPopup={
							renderCustomPopup as (
								sensor: Sensor
							) => React.ReactNode
						}
					/>
				))}

				{/* Display tracking objects */}
				{objects?.map((object) => (
					<TrackingObjectMarker
						key={object.id}
						object={object}
						onObjectSelect={onObjectSelect}
						renderCustomPopup={
							renderCustomPopup as (
								object: TrackingObject
							) => React.ReactNode
						}
					/>
				))}
			</MapContainer>
		</div>
	);
};

export type { TrackingMapProps };
export default TrackingMap;
