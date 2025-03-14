import { jsPDF } from 'jspdf';
import { PdfRecord, SensorFolder } from '@/types/users';
import { getCurrentUser } from '@/services/authService';
import { supabase } from '@/integrations/supabase/client';
import { savePdfRecord, getPdfContent } from './pdf/supabasePdfService';
import { getAddressCoordinates } from '@/services/geocodingService';

interface SensorReading {
  timestamp: string;
  values: {
    temperature: { value: number; unit: string };
    humidity: { value: number; unit: string };
    battery: { value: number; unit: string };
    signal: { value: number; unit: string };
  };
}

const valueConfigs = {
  temperature: { color: [255, 68, 68], label: 'Temperature', min: 0, max: 40 },
  humidity: { color: [68, 68, 255], label: 'Humidity', min: 0, max: 100 },
  battery: { color: [68, 255, 68], label: 'Battery', min: 0, max: 100 },
  signal: { color: [255, 68, 255], label: 'Signal', min: 0, max: 100 }
};

const addNewPageWithBriksStyle = (pdf: jsPDF): void => {
  pdf.addPage();
  pdf.setFillColor(235, 240, 255);
  pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), 'F');
  pdf.setFillColor(108, 92, 231);
  pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 15, 'F');
};

/**
 * Adds a static map image to the PDF based on coordinates
 * @param pdf The PDF document
 * @param lat Latitude
 * @param lng Longitude
 * @param x X position on the page
 * @param y Y position on the page
 * @param width Width of the map image
 * @param height Height of the map image
 * @returns Promise that resolves when the image is added
 */
/**
 * Draws a fallback map placeholder when actual map image can't be loaded
 */
const drawMapFallback = (
  pdf: jsPDF,
  lat: number,
  lng: number,
  x: number,
  y: number,
  width: number,
  height: number
): void => {
  // Create a better-looking placeholder with coordinates
  pdf.setDrawColor(200, 200, 200);
  pdf.setFillColor(245, 245, 250);
  pdf.roundedRect(x, y, width, height, 3, 3, 'FD');
  
  // Add grid lines to make it look map-like
  pdf.setDrawColor(220, 220, 230);
  pdf.setLineWidth(0.2);
  
  // Horizontal grid lines
  for (let i = 1; i < 8; i++) {
    pdf.line(x, y + (height / 8) * i, x + width, y + (height / 8) * i);
  }
  
  // Vertical grid lines
  for (let i = 1; i < 8; i++) {
    pdf.line(x + (width / 8) * i, y, x + (width / 8) * i, y + height);
  }
  
  // Add a marker in the center
  pdf.setFillColor(255, 0, 0);
  const markerX = x + width/2;
  const markerY = y + height/2;
  pdf.circle(markerX, markerY, 3, 'F');
  
  // Add coordinates text
  pdf.setTextColor(50, 50, 100);
  pdf.setFontSize(10);
  pdf.text(`Location: ${lat.toFixed(5)}, ${lng.toFixed(5)}`, x + 10, y + height - 10);
  
  // Add unavailable text
  pdf.setTextColor(100, 100, 100);
  pdf.setFontSize(12);
  pdf.text('Map image unavailable', x + width/2 - 40, y + 20);
};

const addMapImage = async (
  pdf: jsPDF,
  lat: number,
  lng: number,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<void> => {
  try {
    // Try multiple map services in case one fails
    const mapServices = [
      // OpenStreetMap via MapQuest (no API key required)
      `https://open.mapquestapi.com/staticmap/v5/map?key=open-source-client&center=${lat},${lng}&zoom=14&size=600,400&type=map&locations=${lat},${lng}`,
      
      // Fallback to a different service
      `https://maps.geoapify.com/v1/staticmap?style=osm-carto&width=600&height=400&center=lonlat:${lng},${lat}&zoom=14&marker=lonlat:${lng},${lat};color:%23ff0000;size:medium&apiKey=15e7c8c184d94478a1d655b3edb40450`,
      
      // Third option
      `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+f00(${lng},${lat})/${lng},${lat},14,0/600x400?access_token=pk.eyJ1IjoiZGVtby1hY2NvdW50IiwiYSI6ImNrZHhjNHl3ejE5aHYycm83eTlzMm1jemMifQ.gIkM3PwGGsz7ennJLnb0nw`
    ];
    
    // Try each service until one works
    let blob = null;
    for (const mapUrl of mapServices) {
      try {
        console.log(`Trying map service: ${mapUrl.substring(0, 50)}...`);
        const response = await fetch(mapUrl);
        if (response.ok) {
          blob = await response.blob();
          if (blob.size > 1000) { // Make sure it's not an error image
            break;
          }
        }
      } catch (err) {
        console.warn(`Failed to fetch from map service: ${err.message}`);
      }
    }
    
    if (!blob || blob.size < 1000) {
      console.warn('Could not retrieve a valid map image from any service, using fallback');
      // Instead of throwing an error, we'll use the fallback
      drawMapFallback(pdf, lat, lng, x, y, width, height);
      return;
    }
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function() {
        try {
          const imgData = reader.result as string;
          pdf.addImage(imgData, 'PNG', x, y, width, height);
          resolve();
        } catch (error) {
          console.error('Error adding map image to PDF:', error);
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error fetching map image:', error);
    // Use the fallback function instead of duplicating code
    drawMapFallback(pdf, lat, lng, x, y, width, height);
  }
};

const calculateTimePoints = (timestamps: Date[], count: number = 12): Date[] => { // Default to 12 points
  if (timestamps.length <= count) return timestamps;
  
  const totalMinutes = (timestamps[timestamps.length - 1].getTime() - timestamps[0].getTime()) / (1000 * 60);
  const interval = Math.floor(totalMinutes / (count - 1));
  const points: Date[] = [timestamps[0]];

  for (let i = 1; i < count - 1; i++) {
    const targetTime = new Date(timestamps[0].getTime() + interval * i * 60 * 1000);
    const closestIndex = timestamps.reduce((prev, curr, index) => {
      return Math.abs(curr.getTime() - targetTime.getTime()) < Math.abs(timestamps[prev].getTime() - targetTime.getTime())
        ? index
        : prev;
    }, 0);
    points.push(timestamps[closestIndex]);
  }

  points.push(timestamps[timestamps.length - 1]);
  return points;
};

const fetchSensorData = async (sensorImei: string, startDate: Date, endDate: Date): Promise<SensorReading[]> => {
  const { data, error } = await supabase
    .from('sensor_values')
    .select('created_at, payload')
    .eq('sensor_imei', sensorImei)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching sensor data:', error);
    return [];
  }

  return data.map(record => {
    const payload = record.payload as any;
    const batteryValue = payload.battery ? ((payload.battery - 2.5) / 1.1) * 100 : 0;
    const signalValue = payload.signal ? payload.signal * 3.33 : 0;

    return {
      timestamp: record.created_at,
      values: {
        temperature: {
          value: payload.temperature || 0,
          unit: '°C'
        },
        humidity: {
          value: payload.humidity || 0,
          unit: '%'
        },
        battery: {
          value: Math.min(Math.max(batteryValue, 0), 100),
          unit: '%'
        },
        signal: {
          value: Math.min(Math.max(signalValue, 0), 100),
          unit: '%'
        }
      }
    };
  });
};

const drawGraph = (
  pdf: jsPDF,
  data: SensorReading[],
  valueType: keyof SensorReading['values'],
  x: number,
  y: number,
  width: number,
  height: number,
  sensorImei: string
): void => {
  const config = valueConfigs[valueType];
  const values = data.map((d) => d.values[valueType].value);
  const timestamps = data.map((d) => new Date(d.timestamp));

  const graphMarginTop = 10;
  const graphMarginBottom = 25; // Increased for date labels
  const graphMarginLeft = 30; // Increased for value labels

  const graphX = x + graphMarginLeft;
  const graphY = y + graphMarginTop;
  const graphWidth = width - (graphMarginLeft + 15);
  const graphHeight = height - (graphMarginTop + graphMarginBottom);

  // Draw background grid
  pdf.setDrawColor(200);
  pdf.setLineWidth(0.1);

  // Draw horizontal grid lines
  for (let i = 0; i <= 4; i++) {
    const gridY = graphY + graphHeight - (graphHeight * i) / 4;
    pdf.line(graphX, gridY, graphX + graphWidth, gridY);
  }

  // Calculate time points for vertical grid lines
  const timeLabels = calculateTimePoints(timestamps, 12); // 12 vertical lines
  const xStep = graphWidth / (timeLabels.length - 1);

  // Draw vertical grid lines and time labels
  timeLabels.forEach((time, i) => {
    const xPos = graphX + (xStep * i);
    
    // Draw vertical grid line
    pdf.line(xPos, graphY, xPos, graphY + graphHeight);

    // Format time and date
    const timeStr = time.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const dateStr = time.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'numeric',
      day: 'numeric'
    });

    // Center and draw the labels with smaller font for better fit
    pdf.setFontSize(6); // Reduced font size for dates
    const dateWidth = pdf.getStringUnitWidth(dateStr) * 6 / (72 / 25.6);
    pdf.text(dateStr, xPos - (dateWidth / 2), graphY + graphHeight + 15);

    pdf.setFontSize(7); // Slightly larger for time
    const timeWidth = pdf.getStringUnitWidth(timeStr) * 7 / (72 / 25.6);
    pdf.text(timeStr, xPos - (timeWidth / 2), graphY + graphHeight + 8);
  });

  // Draw main axes
  pdf.setDrawColor(0);
  pdf.setLineWidth(0.2);
  pdf.line(graphX, graphY + graphHeight, graphX + graphWidth, graphY + graphHeight);
  pdf.line(graphX, graphY, graphX, graphY + graphHeight);

  if (values.length === 0) {
    pdf.setTextColor(100);
    pdf.setFontSize(10);
    pdf.text('No data available', x + width / 2 - 20, y + height / 2);
    return;
  }

  // Draw data line
  pdf.setDrawColor(config.color[0], config.color[1], config.color[2]);
  pdf.setLineWidth(0.3);

  const clampedValues = values.map((val) =>
    Math.min(Math.max(val, config.min), config.max)
  );

  for (let i = 1; i < clampedValues.length; i++) {
    const x1 = graphX + (graphWidth * (i - 1)) / (clampedValues.length - 1);
    const x2 = graphX + (graphWidth * i) / (clampedValues.length - 1);
    const y1 = graphY + graphHeight - (graphHeight * (clampedValues[i - 1] - config.min)) / (config.max - config.min);
    const y2 = graphY + graphHeight - (graphHeight * (clampedValues[i] - config.min)) / (config.max - config.min);
    pdf.line(x1, y1, x2, y2);
  }

  // Draw title and Y-axis labels
  pdf.setFontSize(8);
  pdf.setTextColor(0);
  pdf.text(`Sensor ${sensorImei} - ${config.label} over Time`, x, y);

  for (let i = 0; i <= 4; i++) {
    const value = config.min + ((config.max - config.min) * i) / 4;
    const labelY = graphY + graphHeight - (graphHeight * i) / 4;
    pdf.text(value.toFixed(0), graphX - 20, labelY + 2);
  }
  
  // Add latest value below the graph title
  if (values.length > 0) {
    const latestValue = values[values.length - 1];
    const unit = data[data.length - 1].values[valueType].unit;
    pdf.setFontSize(8);
    pdf.setTextColor(config.color[0], config.color[1], config.color[2]);
    pdf.text(`Last ${config.label}: ${latestValue.toFixed(1)}${unit}`, x, y + 5);
  }
};

const generateProjectReport = async (
  project: SensorFolder,
  selectedDataTypes?: string[]
): Promise<Blob> => {
  try {
    console.log('Starting PDF generation with jsPDF v3...');

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    let yOffset = 20;

    // Add background and header
    pdf.setFillColor(235, 240, 255);
    pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), 'F');
    pdf.setFillColor(108, 92, 231);
    pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 15, 'F');

    // Add project information
    yOffset = 30;
    pdf.setTextColor(50, 50, 100);
    pdf.setFontSize(20);
    pdf.text('Project Report', 20, yOffset);

    pdf.setFontSize(12);
    yOffset += 15;
    pdf.text(`Project Name: ${project.name}`, 20, yOffset);
    yOffset += 6;
    pdf.text(`Project Number: ${project.projectNumber}`, 20, yOffset);
    yOffset += 6;
    pdf.text(`Created At: ${new Date(project.createdAt).toLocaleDateString()}`, 20, yOffset);
    yOffset += 6;
    if (project.startedAt) {
      pdf.text(`Started At: ${new Date(project.startedAt).toLocaleString()}`, 20, yOffset);
      yOffset += 6;
    }
    if (project.stoppedAt) {
      pdf.text(`Stopped At: ${new Date(project.stoppedAt).toLocaleString()}`, 20, yOffset);
      yOffset += 6;
    }
    pdf.text(`Address: ${project.address || 'N/A'}`, 20, yOffset);
    yOffset += 6;
    pdf.text(`Description: ${project.description || 'N/A'}`, 20, yOffset);
    yOffset += 12;

    // Always add a map section
    pdf.text('Project Location:', 20, yOffset);
    yOffset += 8;
    
    try {
      // Get coordinates for the address or use default coordinates
      let coordinates;
      if (project.address) {
        try {
          coordinates = await getAddressCoordinates(project.address);
        } catch (geoError) {
          console.warn('Error geocoding address:', geoError);
          // Use default coordinates for Norway if geocoding fails
          coordinates = { lat: 63.4305, lng: 10.3951 }; // Default to Trondheim
        }
      } else {
        // No address provided, use default coordinates
        coordinates = { lat: 63.4305, lng: 10.3951 }; // Default to Trondheim
        console.log('No address provided, using default coordinates');
      }
      
      // Add map image
      await addMapImage(
        pdf,
        coordinates.lat,
        coordinates.lng,
        20,
        yOffset,
        pdf.internal.pageSize.getWidth() - 40,
        80
      );
      
      yOffset += 90; // Space for map + margin
    } catch (error) {
      console.error('Error adding map to PDF:', error);
      // Use fallback with default coordinates if all else fails
      drawMapFallback(
        pdf,
        63.4305,
        10.3951,
        20,
        yOffset,
        pdf.internal.pageSize.getWidth() - 40,
        80
      );
      yOffset += 90; // Space for map + margin
    }

    // Start graphs on a new page (second page)
    if (project.assignedSensorImeis?.length) {
      // Skip the "Sensor Data" header and go directly to graphs on a new page
      addNewPageWithBriksStyle(pdf);
      yOffset = 25;

      for (const sensorImei of project.assignedSensorImeis) {
        // For second and subsequent sensors, check if we need a new page
        if (sensorImei !== project.assignedSensorImeis[0] &&
            yOffset > pdf.internal.pageSize.getHeight() - 40) {
          addNewPageWithBriksStyle(pdf);
          yOffset = 25;
        }
        
        const endDate = project.stoppedAt ? new Date(project.stoppedAt) : new Date();
        const startDate = project.startedAt
          ? new Date(project.startedAt)
          : new Date(endDate.getTime() - 24 * 60 * 60 * 1000);

        const data = await fetchSensorData(sensorImei, startDate, endDate);
        if (data.length > 0) {
          const latestData = data[data.length - 1];

          // Skip displaying the sensor IMEI before graphs

          // Check if we need a new page before adding graphs
          if (yOffset > pdf.internal.pageSize.getHeight() - 180) {
            addNewPageWithBriksStyle(pdf);
            yOffset = 25;
          }

          const dataTypesToInclude =
            selectedDataTypes && selectedDataTypes.length > 0
              ? Object.keys(valueConfigs).filter((key) => selectedDataTypes.includes(key))
              : Object.keys(valueConfigs);

          // Track how many graphs we've added to the current page
          let graphsOnCurrentPage = 0;
          
          for (const valueType of dataTypesToInclude as Array<keyof SensorReading['values']>) {
            // Start a new page if we've already added 2 graphs to the current page
            // or if there's not enough space
            if (graphsOnCurrentPage >= 2 || yOffset > pdf.internal.pageSize.getHeight() - 80) {
              addNewPageWithBriksStyle(pdf);
              yOffset = 25;
              graphsOnCurrentPage = 0;
            }

            drawGraph(pdf, data, valueType, 20, yOffset, pdf.internal.pageSize.getWidth() - 40, 80, sensorImei); // Increased height
            yOffset += 90; // Increased spacing
            graphsOnCurrentPage++;
          }
        } else {
          pdf.text(`No data available for sensor ${sensorImei}`, 20, yOffset);
          yOffset += 8;
        }
      }
    } else {
      pdf.text('No sensors assigned to this project', 20, yOffset);
    }

    yOffset = pdf.internal.pageSize.getHeight() - 20;
    pdf.setFontSize(10);
    pdf.text(`Report generated on ${new Date().toLocaleString()}`, 20, yOffset);

    const blob = pdf.output('blob');
    if (!blob) throw new Error('PDF output returned null or undefined');

    return blob;
  } catch (error) {
    console.error('Error in PDF generation:', error);
    throw new Error(`Failed to generate PDF: ${error.message || 'Unknown error'}`);
  }
};

const downloadProjectReport = async (
  project: SensorFolder,
  selectedDataTypes?: string[]
): Promise<SensorFolder> => {
  try {
    console.log('Starting PDF generation for project:', project.name);
    console.log('Selected data types:', selectedDataTypes);

    const currentUser = getCurrentUser();
    const timestamp = new Date();
    const filename = `${project.name}-report-${timestamp.toISOString().split('T')[0]}.pdf`;

    let pdfBlob;
    try {
      console.log('Initializing PDF generation with jsPDF v3');
      pdfBlob = await generateProjectReport(project, selectedDataTypes);
      console.log('PDF blob generated successfully, size:', pdfBlob.size);

      if (!pdfBlob || pdfBlob.size === 0) {
        throw new Error('Generated PDF blob is empty or invalid');
      }
    } catch (genError) {
      console.error('Error in generateProjectReport:', genError);
      throw new Error(`PDF generation failed: ${genError.message || 'Unknown error'}`);
    }

    let url;
    try {
      console.log('Creating URL from blob...');
      url = URL.createObjectURL(pdfBlob);

      if (!url) {
        throw new Error('URL creation returned empty result');
      }
      console.log('URL created successfully:', url.substring(0, 30) + '...');
    } catch (urlError) {
      console.error('Error creating URL from blob:', urlError);
      throw new Error(`Failed to create URL from PDF: ${urlError.message || 'Unknown error'}`);
    }

    try {
      console.log('Creating download link...');
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);

      setTimeout(() => {
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          console.log('Download initiated and link cleaned up');
        }, 100);
      }, 100);
    } catch (linkError) {
      console.error('Error in download process:', linkError);
      throw new Error(`Failed to initiate download: ${linkError.message || 'Unknown error'}`);
    }

    const pdfRecord = {
      filename: filename,
      createdAt: timestamp.toISOString(),
      createdBy: currentUser?.id,
      creatorName: currentUser?.name,
      pdfBlob
    };

    const { success, data, message } = await savePdfRecord(project.id, pdfRecord);
    if (!success || !data) {
      console.error('Error saving PDF record:', message);
      throw new Error(`Failed to save PDF record: ${message}`);
    }

    const updatedProject = {
      ...project,
      pdfHistory: [
        ...project.pdfHistory || [],
        {
          id: data.id,
          filename: data.filename,
          createdAt: data.createdAt,
          creatorName: data.creatorName,
          blobUrl: data.blobUrl
        }
      ]
    };

    console.log('PDF report generation completed successfully');
    return updatedProject;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

const viewPdfFromHistory = async (pdfRecord: PdfRecord): Promise<boolean> => {
  try {
    const content = await getPdfContent(pdfRecord.id);
    if (!content) {
      console.log('PDF URL has expired. Please regenerate the PDF.');
      return false;
    }

    const url = URL.createObjectURL(content.blob);
    window.open(url, '_blank');

    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch (error) {
    console.error('Error viewing PDF:', error);
    return false;
  }
};

export {
  generateProjectReport,
  downloadProjectReport,
  viewPdfFromHistory
};
