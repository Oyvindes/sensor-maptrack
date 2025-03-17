import {
	Camera,
	CameraResultType,
	CameraSource,
	CameraDirection
} from '@capacitor/camera';

export interface CameraScanResult {
	success: boolean;
	data?: string;
	image?: string;
	error?: string;
}

// Store the active video stream to be able to stop it later
let activeVideoStream: MediaStream | null = null;

/**
 * Stops any active camera stream
 */
export function stopCameraStream() {
	if (activeVideoStream) {
		activeVideoStream.getTracks().forEach((track) => track.stop());
		activeVideoStream = null;
	}
}

/**
 * Takes a picture using the device camera or file input fallback
 * @returns Promise with the image path or null if failed
 */
export async function takePicture(): Promise<string | null> {
	try {
		console.log('Starting capture process...');

		// Check if we're on Android
		const isAndroid = /android/i.test(navigator.userAgent);

		// On Android devices, try Capacitor camera API first
		if (isAndroid) {
			const hasCapacitor =
				typeof window !== 'undefined' && !!(window as any).Capacitor;

			if (hasCapacitor) {
				try {
					console.log(
						'Using Capacitor camera API for Android device'
					);

					// Explicitly configure for QR/Barcode scanning
					const image = await Camera.getPhoto({
						quality: 90,
						allowEditing: false, // Must be false for QR scanning
						resultType: CameraResultType.Uri,
						source: CameraSource.Camera, // Force camera source not gallery
						direction: CameraDirection.Rear, // Use rear camera for scanning
						correctOrientation: true,
						promptLabelHeader: 'Scan QR Code',
						promptLabelCancel: 'Cancel',
						promptLabelPhoto: 'Scan QR Code',
						saveToGallery: false, // Don't save QR code images to gallery
						webUseInput: true, // Allow fallback to file input on web if camera fails
						width: 1024, // Optimal for QR scanning
						height: 1024
					});

					console.log(
						'Camera captured QR image:',
						image?.webPath || 'No image captured'
					);
					return image.webPath || null;
				} catch (capacitorError) {
					console.error(
						'Capacitor camera error on Android:',
						capacitorError
					);
					// For Android, return null to allow falling back to native camera
					return null;
				}
			}
		}

		// For PC (non-Android) or if Android Capacitor failed, skip camera and use file input directly
		console.log('Using file input method for PC or as Android fallback');
		return await useFileInput();
	} catch (error) {
		console.error('Error in takePicture:', error);

		return null;
	}
}

// Browser camera API is not used on PC - only file upload is allowed

/**
 * Uses a file input to select an image
 * @returns Promise with the image data URL or null if failed
 */
async function useFileInput(): Promise<string | null> {
	// Create container for file input UI
	const container = document.createElement('div');

	// Style the container
	Object.assign(container.style, {
		position: 'fixed',
		top: '0',
		left: '0',
		width: '100%',
		height: '100%',
		backgroundColor: 'rgba(0,0,0,0.8)',
		zIndex: '9999',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		padding: '20px'
	});

	// Create a message
	const message = document.createElement('div');
	const isPc = !('ontouchstart' in document);
	message.innerHTML = isPc
		? 'Please select an image file containing a QR code<br/><small>(Camera scanning is disabled on PC)</small>'
		: 'Please select a QR code image from your device';
	Object.assign(message.style, {
		color: 'white',
		fontSize: '16px',
		marginBottom: '20px',
		textAlign: 'center'
	});

	// Create a file input element
	const input = document.createElement('input');
	input.type = 'file';
	input.accept = 'image/*';
	(input as any).capture = 'environment'; // Use the camera if available
	Object.assign(input.style, {
		display: 'none' // Hide the actual input
	});

	// Create a button to trigger file selection
	const selectButton = document.createElement('button');
	selectButton.textContent = 'Select Image';
	Object.assign(selectButton.style, {
		padding: '10px 20px',
		backgroundColor: '#4CAF50',
		color: 'white',
		border: 'none',
		borderRadius: '4px',
		fontSize: '16px',
		cursor: 'pointer',
		marginBottom: '10px'
	});

	// Create cancel button
	const cancelButton = document.createElement('button');
	cancelButton.textContent = 'Cancel';
	Object.assign(cancelButton.style, {
		padding: '10px 20px',
		backgroundColor: '#f44336',
		color: 'white',
		border: 'none',
		borderRadius: '4px',
		fontSize: '16px',
		cursor: 'pointer'
	});

	// Add elements to container
	container.appendChild(message);
	container.appendChild(selectButton);
	container.appendChild(input);
	container.appendChild(cancelButton);

	// Add container to document
	document.body.appendChild(container);

	// Create a promise that resolves when the file is selected
	return new Promise<string | null>((resolve) => {
		selectButton.onclick = () => {
			input.click();
		};

		input.onchange = (event) => {
			const file = (event.target as HTMLInputElement).files?.[0];
			if (file) {
				const reader = new FileReader();
				reader.onload = () => {
					document.body.removeChild(container);
					resolve(reader.result as string);
				};
				reader.onerror = () => {
					console.error('Error reading file');
					document.body.removeChild(container);
					resolve(null);
				};
				reader.readAsDataURL(file);
			} else {
				// No file selected
				resolve(null);
			}
		};

		// Handle cancel case
		cancelButton.onclick = () => {
			document.body.removeChild(container);
			resolve(null);
		};
	});
}

/**
 * Scans a QR code using the device camera
 * @returns Promise with the scan result
 */
export async function scanSensorQrCode(): Promise<CameraScanResult> {
	try {
		console.log('Starting QR code scanning process...');

		// Take picture in QR scan mode
		const imagePath = await takePicture();

		if (!imagePath) {
			console.log(
				'No QR code image captured during scan attempt - user may have cancelled'
			);
			return {
				success: false,
				error: 'QR code scanning cancelled'
			};
		}

		// Log success for debugging
		console.log(
			'QR code image captured successfully for processing:',
			imagePath
		);

		// Process the image to extract QR code data
		try {
			// Import the QR code processing function
			const { processQRCodeImage, extractImeiFromQrCode } = await import(
				'./qrCodeUtils'
			);

			// Process the image to extract QR code data
			const qrData = await processQRCodeImage(imagePath);

			if (qrData) {
				console.log('QR code data extracted:', qrData);

				// Try to extract an IMEI from the QR code data
				const imei = extractImeiFromQrCode(qrData);

				if (imei) {
					// Return the IMEI
					return {
						success: true,
						data: imei,
						image: imagePath
					};
				} else {
					// If no IMEI pattern was found, return the raw QR code data
					return {
						success: true,
						data: qrData,
						image: imagePath
					};
				}
			} else {
				// No QR code found in the image
				return {
					success: false,
					error: 'No QR code found in the image. Please try again with better lighting and focus.',
					image: imagePath
				};
			}
		} catch (error) {
			console.error('Error processing QR code:', error);
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: 'Failed to process QR code',
				image: imagePath
			};
		}
	} catch (error) {
		console.error('Error scanning QR code:', error);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: 'Failed to scan QR code'
		};
	}
}
