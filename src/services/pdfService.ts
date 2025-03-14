import { jsPDF } from 'jspdf';
import { PdfRecord, SensorFolder } from '@/types/users';
import { getCurrentUser } from '@/services/authService';
import { supabase } from '@/integrations/supabase/client';
import { savePdfRecord, getPdfContent } from './pdf/supabasePdfService';

const addNewPageWithBriksStyle = (pdf: jsPDF): void => {
  pdf.addPage();
  pdf.setFillColor(235, 240, 255);
  pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), 'F');
  pdf.setFillColor(108, 92, 231);
  pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 15, 'F');
};

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
    // Apply the same calculations as in SensorDataGraphs.tsx
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
          value: Math.min(Math.max(batteryValue, 0), 100), // Ensure value is between 0-100
          unit: '%'
        },
        signal: {
          value: Math.min(Math.max(signalValue, 0), 100), // Ensure value is between 0-100
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
  height: number
) => {
  const config = valueConfigs[valueType];
  const values = data.map((d) => d.values[valueType].value);
  const timestamps = data.map((d) => new Date(d.timestamp));

  const graphMarginTop = 10;
  const graphMarginBottom = 15;
  const graphMarginLeft = 15;

  const graphX = x + graphMarginLeft;
  const graphY = y + graphMarginTop;
  const graphWidth = width - graphMarginLeft;
  const graphHeight = height - (graphMarginTop + graphMarginBottom);

  // Draw axes
  pdf.setDrawColor(0);
  pdf.setLineWidth(0.2);
  pdf.line(graphX, graphY + graphHeight, graphX + graphWidth, graphY + graphHeight);
  pdf.line(graphX, graphY, graphX, graphY + graphHeight);

  // Draw grid
  pdf.setDrawColor(200);
  pdf.setLineWidth(0.1);
  for (let i = 1; i < 5; i++) {
    const gridY = graphY + graphHeight - (graphHeight * i) / 4;
    pdf.line(graphX, gridY, graphX + graphWidth, gridY);
  }

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

  // Add labels
  pdf.setFontSize(8);
  pdf.setTextColor(0);
  pdf.text(`${config.label} over Time`, x, y);

  // Y-axis labels
  for (let i = 0; i <= 4; i++) {
    const value = config.min + ((config.max - config.min) * i) / 4;
    const labelY = graphY + graphHeight - (graphHeight * i) / 4;
    pdf.text(value.toFixed(0), graphX - 10, labelY + 2);
  }

  // X-axis labels (start, middle, end)
  const timeLabels = [timestamps[0], timestamps[Math.floor(timestamps.length / 2)], timestamps[timestamps.length - 1]];
  const xPositions = [graphX, graphX + graphWidth / 2, graphX + graphWidth];

  timeLabels.forEach((time, i) => {
    try {
      pdf.text(time.toLocaleTimeString(), xPositions[i] - 10, graphY + graphHeight + 10);
    } catch (error) {
      pdf.text(time.toString().split(' ')[4] || '00:00:00', xPositions[i] - 10, graphY + graphHeight + 10);
    }
  });
};

export const generateProjectReport = async (
  project: SensorFolder,
  selectedDataTypes?: string[]
): Promise<Blob> => {
  try {
    console.log('Starting PDF generation with jsPDF v3...');

    let pdf = new jsPDF({
      orientation: 'portrait',
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

    // Add sensor data
    if (project.assignedSensorImeis?.length) {
      pdf.text('Sensor Data', 20, yOffset);
      yOffset += 6;

      for (const sensorImei of project.assignedSensorImeis) {
        const endDate = project.stoppedAt ? new Date(project.stoppedAt) : new Date();
        const startDate = project.startedAt
          ? new Date(project.startedAt)
          : new Date(endDate.getTime() - 24 * 60 * 60 * 1000);

        const data = await fetchSensorData(sensorImei, startDate, endDate);
        if (data.length > 0) {
          const latestData = data[data.length - 1];

          pdf.text(`Sensor ${sensorImei}`, 20, yOffset);
          yOffset += 6;

          Object.entries(latestData.values).forEach(([key, value]) => {
            pdf.text(
              `Latest ${key.charAt(0).toUpperCase() + key.slice(1)}: ${value.value.toFixed(1)}${value.unit}`,
              30,
              yOffset
            );
            yOffset += 5;
          });
          yOffset += 3;

          if (yOffset > pdf.internal.pageSize.getHeight() - 180) {
            addNewPageWithBriksStyle(pdf);
            yOffset = 25;
          }

          const dataTypesToInclude =
            selectedDataTypes && selectedDataTypes.length > 0
              ? Object.keys(valueConfigs).filter((key) => selectedDataTypes.includes(key))
              : Object.keys(valueConfigs);

          for (const valueType of dataTypesToInclude as Array<keyof SensorReading['values']>) {
            if (yOffset > pdf.internal.pageSize.getHeight() - 60) {
              addNewPageWithBriksStyle(pdf);
              yOffset = 25;
            }

            drawGraph(pdf, data, valueType, 20, yOffset, 170, 50);
            yOffset += 55;
          }

          if (yOffset > pdf.internal.pageSize.getHeight() - 100) {
            addNewPageWithBriksStyle(pdf);
            yOffset = 30;
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

export const downloadProjectReport = async (
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

    // Create URL from the blob
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

    // Create download link
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

    // Save record to database with PDF blob
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

    // Update project with the new PDF record using the real ID from the database
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

export const viewPdfFromHistory = async (pdfRecord: PdfRecord): Promise<boolean> => {
  try {
    const content = await getPdfContent(pdfRecord.id);
    if (!content) {
      console.log('PDF URL has expired. Please regenerate the PDF.');
      return false;
    }

    const url = URL.createObjectURL(content.blob);
    window.open(url, '_blank');

    // Clean up URL after a delay
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch (error) {
    console.error('Error viewing PDF:', error);
    return false;
  }
};
