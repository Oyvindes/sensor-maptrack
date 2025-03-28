import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'lucide-react';
import { toast } from 'sonner';
import SensorImeiInput from './sensor-assignment/SensorImeiInput';
import AssignedSensorsListWithPlugs from './sensor-assignment/AssignedSensorsListWithPlugs';
import AvailableSensorsList from './sensor-assignment/AvailableSensorsList';
import { scanSensorQrCode } from '@/utils/cameraUtils';
import { validateSensorForCompany } from '@/services/sensor/sensorApi';
import { useTranslation } from 'react-i18next';

interface SensorAssignmentProps {
	availableSensors: Array<{ imei: string; name: string; sensorType?: string }>;
	assignedSensorImeis: string[];
	onSensorToggle: (sensorImei: string, checked: boolean) => void;
	companyId: string;
	sensorLocations?: Record<string, string>;
	sensorZones?: Record<string, 'wet' | 'dry'>;
	sensorTypes?: Record<string, 'wood' | 'concrete'>;
	onSensorLocationChange?: (sensorImei: string, location: string) => void;
	onSensorZoneChange?: (sensorImei: string, zone: 'wet' | 'dry') => void;
	onSensorTypeChange?: (sensorImei: string, type: 'wood' | 'concrete') => void;
}

const SensorAssignment: React.FC<SensorAssignmentProps> = ({
	availableSensors,
	assignedSensorImeis,
	onSensorToggle,
	companyId,
	sensorLocations = {},
	sensorZones = {},
	sensorTypes = {},
	onSensorLocationChange,
	onSensorZoneChange,
	onSensorTypeChange
}) => {
	const { t } = useTranslation();
	const [imeiInput, setImeiInput] = useState('');
	const [showScanner, setShowScanner] = useState(false);
	const [scanning, setScanning] = useState(false);
	const [assignedSensors, setAssignedSensors] = useState<
		Array<{ imei: string; name: string; sensorType?: string }>
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
					`Sensor ${imei.replace('sensor-', '')}`,
				sensorType: sensorDetails?.sensorType || undefined
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
			toast.error(t('projectEditor.selectCompanyBeforeAddingSensors'));
			return;
		}

		// Show loading indicator
		toast.loading(t('projectEditor.validatingSensor'));

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
			toast.error(t('projectEditor.failedToValidate'));
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
						t('projectEditor.selectCompanyBeforeAddingSensors')
					);
					return;
				}

				// Show loading indicator
				toast.loading(t('projectEditor.validatingScannedSensor'));

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
							t('projectEditor.sensorValidated')
						);
					} else {
						// Keep the IMEI value in the input but show error message
						toast.error(validation.message);
					}
				} catch (validationError) {
					console.error('Error validating sensor:', validationError);
					toast.error(t('projectEditor.failedToValidate'));
				} finally {
					toast.dismiss();
				}
			} else {
				toast.error(result.error || t('projectEditor.failedToScan'));
			}
		} catch (error) {
			console.error('Error scanning QR code:', error);
			toast.error(t('projectEditor.scanningError'));
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
				<span>{t('projectEditor.assignedSensorsAndPlugs')}</span>
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

					<AssignedSensorsListWithPlugs
						assignedSensors={assignedSensors}
						onRemoveSensor={handleRemoveSensor}
						sensorLocations={sensorLocations}
						sensorZones={sensorZones}
						sensorTypes={sensorTypes}
						onLocationChange={onSensorLocationChange}
						onZoneChange={onSensorZoneChange}
						onTypeChange={onSensorTypeChange}
					/>

					{companyId ? (
						<div>
							<div className="mb-4 font-medium text-sm">
								{t('sensorAssignment.availableSensors')}
							</div>
							{availableSensors.length === 0 ? (
								<div className="text-muted-foreground text-sm p-4 bg-muted/30 rounded-md">
									{t('sensorAssignment.noSensorsAvailable')}
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
							{t('projectEditor.selectCompanyForSensors')}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
};

export default SensorAssignment;
