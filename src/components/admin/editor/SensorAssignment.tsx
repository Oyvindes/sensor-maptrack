import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'lucide-react';
import { toast } from 'sonner';
import SensorImeiInput from './sensor-assignment/SensorImeiInput';
import AssignedSensorsList from './sensor-assignment/AssignedSensorsList';
import AvailableSensorsList from './sensor-assignment/AvailableSensorsList';
import { scanSensorQrCode } from '@/utils/cameraUtils';
import { validateSensorForCompany } from '@/services/sensor/sensorApi';

interface SensorAssignmentProps {
	availableSensors: Array<{ imei: string; name: string }>;
	assignedSensorImeis: string[];
	onSensorToggle: (sensorImei: string, checked: boolean) => void;
	companyId: string;
}

const SensorAssignment: React.FC<SensorAssignmentProps> = ({
	availableSensors,
	assignedSensorImeis,
	onSensorToggle,
	companyId
}) => {
	const [imeiInput, setImeiInput] = useState('');
	const [showScanner, setShowScanner] = useState(false);
	const [scanning, setScanning] = useState(false);
	const [assignedSensors, setAssignedSensors] = useState<
		Array<{ imei: string; name: string }>
	>([]);

	useEffect(() => {
		console.log('SensorAssignment - Available sensors:', availableSensors);
		console.log(
			'SensorAssignment - Assigned sensor IMEIs:',
			assignedSensorImeis
		);

		const sensorsWithDetails = assignedSensorImeis.map((imei) => {
			const sensorDetails = availableSensors.find((s) => s.imei === imei);
			return {
				imei,
				name:
					sensorDetails?.name ||
					`Sensor ${imei.replace('sensor-', '')}`
			};
		});
		setAssignedSensors(sensorsWithDetails);
	}, [assignedSensorImeis, availableSensors]);

	const handleImeiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setImeiInput(e.target.value);
	};

	const handleAddSensor = async () => {
		if (!imeiInput.trim()) return;

		if (!companyId) {
			toast.error('Please select a company before adding sensors');
			return;
		}

		// Show loading indicator
		toast.loading('Validating sensor...');

		try {
			// Validate the sensor with the API
			const validation = await validateSensorForCompany(
				imeiInput,
				companyId
			);

			// Handle validation result
			if (validation.valid && validation.sensorImei) {
				// Add the validated sensor
				toast.success(validation.message);
				onSensorToggle(validation.sensorImei, true);
				setImeiInput('');
			} else {
				// Show error message from validation
				toast.error(validation.message);
			}
		} catch (error) {
			console.error('Error validating sensor:', error);
			toast.error('Failed to validate sensor. Please try again.');
		} finally {
			toast.dismiss();
		}
	};

	const handleScanQR = async () => {
		try {
			setScanning(true);
			setShowScanner(true);

			// Start the QR code scanning process
			const result = await scanSensorQrCode();

			if (result.success && result.data) {
				// Set the IMEI input value to show in the UI
				setImeiInput(result.data);

				if (!companyId) {
					toast.error(
						'Please select a company before adding sensors'
					);
					return;
				}

				// Show loading indicator
				toast.loading('Validating scanned sensor...');

				try {
					// Validate the sensor with the company using our API
					const validation = await validateSensorForCompany(
						result.data,
						companyId
					);

					if (validation.valid && validation.sensorImei) {
						// Add the validated sensor to the project
						onSensorToggle(validation.sensorImei, true);

						// Clear the input field after adding
						setImeiInput('');

						toast.success(
							'Sensor validated and added successfully'
						);
					} else {
						// Keep the IMEI value in the input but show error message
						toast.error(validation.message);
					}
				} catch (validationError) {
					console.error('Error validating sensor:', validationError);
					toast.error('Failed to validate sensor. Please try again.');
				} finally {
					toast.dismiss();
				}
			} else {
				toast.error(result.error || 'Failed to scan QR code');
			}
		} catch (error) {
			console.error('Error scanning QR code:', error);
			toast.error('An error occurred while scanning');
		} finally {
			// Use a small delay before hiding the scanner UI to make the transition smoother
			setTimeout(() => {
				setScanning(false);
				setShowScanner(false);
			}, 300);
		}
	};

	const handleRemoveSensor = (sensorImei: string, e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		onSensorToggle(sensorImei, false);
	};

	return (
		<div className="space-y-2">
			<Label className="flex items-center gap-1">
				<Link className="h-4 w-4" />
				<span>Assigned Sensors</span>
			</Label>

			<Card>
				<CardContent className="pt-6">
					<SensorImeiInput
						imeiInput={imeiInput}
						showScanner={showScanner}
						scanning={scanning}
						onImeiChange={handleImeiChange}
						onScanQR={handleScanQR}
						onAddSensor={handleAddSensor}
					/>

					<AssignedSensorsList
						assignedSensors={assignedSensors}
						onRemoveSensor={handleRemoveSensor}
					/>

					{companyId ? (
						<div>
							<div className="mb-4 font-medium text-sm">
								Available Sensors
							</div>
							{availableSensors.length === 0 ? (
								<div className="text-muted-foreground text-sm p-4 bg-muted/30 rounded-md">
									No sensors are available for this company.
									Please go to the Sensors tab to add sensors
									to this company first.
								</div>
							) : (
								<AvailableSensorsList
									availableSensors={availableSensors}
									assignedSensorImeis={assignedSensorImeis}
									onSensorToggle={onSensorToggle}
								/>
							)}
						</div>
					) : (
						<div className="text-muted-foreground text-sm p-4 bg-muted/30 rounded-md">
							Please select a company to see available sensors.
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
};

export default SensorAssignment;
