import { jsPDF } from 'jspdf';
import { PdfRecord, SensorFolder } from '@/types/users';
import { getCurrentUser } from '@/services/authService';

/**
 * Helper function to add a new page with Briks styling
 * Ensures consistent appearance across all pages of the PDF
 */
const addNewPageWithBriksStyle = (pdf: jsPDF): void => {
  pdf.addPage();
  
  // Apply consistent styling to the new page
  pdf.setFillColor(235, 240, 255); // Light blue/indigo background
  pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), 'F');
  
  // Add purple header bar
  pdf.setFillColor(108, 92, 231); // Purple color from Briks logo (#6c5ce7)
  pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 15, 'F');
  
  // Logo removed as requested
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
  temperature: { color: [255, 68, 68], label: "Temperature", min: 0, max: 40 },
  humidity: { color: [68, 68, 255], label: "Humidity", min: 0, max: 100 },
  battery: { color: [68, 255, 68], label: "Battery", min: 0, max: 100 },
  signal: { color: [255, 68, 255], label: "Signal", min: 0, max: 100 }
};

const generateProjectData = (startDate: Date, endDate: Date): SensorReading[] => {
  const data: SensorReading[] = [];
  const duration = endDate.getTime() - startDate.getTime();
  const intervals = 20; // Number of data points
  
  for (let i = 0; i <= intervals; i++) {
    const timestamp = new Date(startDate.getTime() + (duration * i / intervals));
    data.push({
      timestamp: timestamp.toISOString(),
      values: {
        temperature: { value: 20 + Math.sin(i/2) * 5 + Math.random() * 2, unit: '°C' },
        humidity: { value: 40 + Math.cos(i/2) * 15 + Math.random() * 5, unit: '%' },
        battery: { value: 100 - i/2, unit: '%' },
        signal: { value: 80 + Math.sin(i) * 10, unit: '%' }
      }
    });
  }
  
  return data;
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
  const values = data.map(d => d.values[valueType].value);
  const timestamps = data.map(d => new Date(d.timestamp));
  
  // Ensure we have margin for labels
  const graphMarginTop = 10;    // Space for title
  const graphMarginBottom = 15; // Space for x-axis labels
  const graphMarginLeft = 15;   // Space for y-axis labels
  
  // Adjusted coordinates for the actual graph area
  const graphX = x + graphMarginLeft;
  const graphY = y + graphMarginTop;
  const graphWidth = width - graphMarginLeft;
  const graphHeight = height - (graphMarginTop + graphMarginBottom);
  
  // Draw axes
  pdf.setDrawColor(0);
  pdf.setLineWidth(0.2);
  pdf.line(graphX, graphY + graphHeight, graphX + graphWidth, graphY + graphHeight); // X axis
  pdf.line(graphX, graphY, graphX, graphY + graphHeight); // Y axis
  
  // Draw grid
  pdf.setDrawColor(200);
  pdf.setLineWidth(0.1);
  for (let i = 1; i < 5; i++) {
    const gridY = graphY + graphHeight - (graphHeight * i / 4);
    pdf.line(graphX, gridY, graphX + graphWidth, gridY);
  }
  
  // Draw data line
  pdf.setDrawColor(config.color[0], config.color[1], config.color[2]);
  pdf.setLineWidth(0.3);
  
  // Ensure values are within the min-max range to prevent graph overflow
  const clampedValues = values.map(val =>
    Math.min(Math.max(val, config.min), config.max)
  );
  
  for (let i = 1; i < clampedValues.length; i++) {
    const x1 = graphX + (graphWidth * (i - 1) / (clampedValues.length - 1));
    const x2 = graphX + (graphWidth * i / (clampedValues.length - 1));
    
    // Calculate y position ensuring it's properly scaled within the graph height
    const y1 = graphY + graphHeight - (graphHeight * (clampedValues[i - 1] - config.min) / (config.max - config.min));
    const y2 = graphY + graphHeight - (graphHeight * (clampedValues[i] - config.min) / (config.max - config.min));
    
    pdf.line(x1, y1, x2, y2);
  }
  
  // Add labels
  pdf.setFontSize(8);
  pdf.setTextColor(0);
  
  // Title
  pdf.text(`${config.label} over Time`, x, y);
  
  // Y-axis labels
  for (let i = 0; i <= 4; i++) {
    const value = config.min + (config.max - config.min) * i / 4;
    const labelY = graphY + graphHeight - (graphHeight * i / 4);
    pdf.text(value.toFixed(0), graphX - 10, labelY + 2); // +2 to center text vertically
  }
  
  // X-axis labels (start, middle, end)
  const timeLabels = [timestamps[0], timestamps[Math.floor(timestamps.length / 2)], timestamps[timestamps.length - 1]];
  const xPositions = [graphX, graphX + graphWidth/2, graphX + graphWidth];
  
  timeLabels.forEach((time, i) => {
    try {
      pdf.text(time.toLocaleTimeString(), xPositions[i] - 10, graphY + graphHeight + 10);
    } catch (error) {
      // Fallback for time formatting issues
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
    // Updated jsPDF constructor with options object
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    let yOffset = 20;
    
    // Add background color similar to login page's gradient
    pdf.setFillColor(235, 240, 255); // Light blue/indigo similar to the gradient start
    pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), 'F');
    
    // Add header with gradient-like decoration
    pdf.setFillColor(108, 92, 231); // Purple color from Briks logo (#6c5ce7)
    pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 15, 'F');
    
    // Logo removed as requested
  
  // Add project information
  yOffset = 30; // Reduced since there's no logo to move past
  
  pdf.setTextColor(50, 50, 100); // Dark blue/indigo text
  pdf.setFontSize(20);
  pdf.text('Project Report', 20, yOffset);
  
  pdf.setFontSize(12);
  yOffset += 15; // Reduced from 20
  pdf.text(`Project Name: ${project.name}`, 20, yOffset);
  yOffset += 6; // Reduced from 10
  pdf.text(`Project Number: ${project.projectNumber}`, 20, yOffset);
  yOffset += 6; // Reduced from 10
  pdf.text(`Created By: ${project.creatorName}`, 20, yOffset);
  yOffset += 6; // Reduced from 10
  pdf.text(`Created At: ${new Date(project.createdAt).toLocaleDateString()}`, 20, yOffset);
  yOffset += 6; // Reduced from 10
  if (project.startedAt) {
    pdf.text(`Started At: ${new Date(project.startedAt).toLocaleString()}`, 20, yOffset);
    yOffset += 6; // Reduced from 10
  }
  if (project.stoppedAt) {
    pdf.text(`Stopped At: ${new Date(project.stoppedAt).toLocaleString()}`, 20, yOffset);
    yOffset += 6; // Reduced from 10
  }
  pdf.text(`Address: ${project.address || 'N/A'}`, 20, yOffset);
  yOffset += 6; // Reduced from 10
  pdf.text(`Description: ${project.description || 'N/A'}`, 20, yOffset);
  yOffset += 12; // Reduced from 20

  // Add sensor data
  if (project.assignedSensorIds?.length) {
    pdf.text('Sensor Data', 20, yOffset);
    yOffset += 6; // Reduced from 10

    for (const sensorId of project.assignedSensorIds) {
      // Use default time range if project hasn't been started/stopped
      const endDate = project.stoppedAt ? new Date(project.stoppedAt) : new Date();
      const startDate = project.startedAt ? new Date(project.startedAt) : new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // Default to last 24 hours
      const data = generateProjectData(startDate, endDate);
      const latestData = data[data.length - 1];

      pdf.text(`Sensor ${sensorId}`, 20, yOffset);
      yOffset += 6; // Reduced from 10

      // Add latest sensor readings - with reduced spacing
      Object.entries(latestData.values).forEach(([key, value]) => {
        pdf.text(`Latest ${key.charAt(0).toUpperCase() + key.slice(1)}: ${value.value.toFixed(1)}${value.unit}`, 30, yOffset);
        yOffset += 5; // Reduced from 7
      });
      yOffset += 3; // Reduced from 5

      // Check if we need a new page before drawing graphs - with reduced space requirement
            if (yOffset > pdf.internal.pageSize.getHeight() - 180) { // Reduced from 220
              addNewPageWithBriksStyle(pdf);
              yOffset = 25; // Reduced from 30 - Start content a bit closer to the header
            }
      
      // Filter data types if selectedDataTypes is provided
      const dataTypesToInclude = (selectedDataTypes && selectedDataTypes.length > 0)
        ? Object.keys(valueConfigs).filter(key => selectedDataTypes.includes(key))
        : Object.keys(valueConfigs);
      
      // Add graphs for selected sensor value types
      for (const valueType of dataTypesToInclude as Array<keyof SensorReading['values']>) {
        // Check if we have enough space for this graph - reduced space requirement
        if (yOffset > pdf.internal.pageSize.getHeight() - 60) { // Reduced from 70
          addNewPageWithBriksStyle(pdf);
          yOffset = 25; // Reduced from 30 - Start content a bit closer to the header
        }
        
        // Draw the graph with better height ratio (reduced from 60mm)
        drawGraph(pdf, data, valueType, 20, yOffset, 170, 50);
        yOffset += 55; // Reduced from 75mm to make the document more compact
      }

      // Add new page if needed for next sensor
      if (yOffset > pdf.internal.pageSize.getHeight() - 100) {
        addNewPageWithBriksStyle(pdf);
        yOffset = 30; // Start content below the header
      }
    }
  } else {
    pdf.text('No sensors assigned to this project', 20, yOffset);
  }

  // Add timestamp
  yOffset = pdf.internal.pageSize.getHeight() - 20;
  pdf.setFontSize(10);
  pdf.text(`Report generated on ${new Date().toLocaleString()}`, 20, yOffset);

  return pdf.output('blob') as Blob;
  } catch (error) {
    console.error('Error in PDF generation:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
};

/**
 * Gets PDF history for a project
 */
export const getProjectPdfHistory = (project: SensorFolder): PdfRecord[] => {
  return project.pdfHistory || [];
};

/**
 * Generates and downloads a PDF report for a project, and adds it to the project's PDF history
 * @param project The project to generate a report for
 * @param selectedDataTypes Optional array of data types to include in the report
 * @returns The updated project with the new PDF record added to history
 */
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
    
    // Generate the PDF with selected data types
    console.log('Calling generateProjectReport...');
    let pdfBlob;
    try {
      pdfBlob = await generateProjectReport(project, selectedDataTypes);
      console.log('PDF blob generated successfully');
    } catch (genError) {
      console.error('Error in generateProjectReport:', genError);
      throw new Error(`PDF generation failed: ${genError.message}`);
    }
    
    // Create URL from the blob
    console.log('Creating URL from blob...');
    let url;
    try {
      url = URL.createObjectURL(pdfBlob);
      console.log('URL created successfully');
    } catch (urlError) {
      console.error('Error creating URL from blob:', urlError);
      throw new Error(`Failed to create URL from PDF: ${urlError.message}`);
    }
    
    // Create download link
    console.log('Creating download link...');
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('Download initiated');
    } catch (linkError) {
      console.error('Error in download process:', linkError);
      throw new Error(`Failed to initiate download: ${linkError.message}`);
    }
    
    // Create a new PDF record
    const pdfRecord: PdfRecord = {
      id: `pdf-${Date.now()}`,
      filename: filename,
      createdAt: timestamp.toISOString(),
      createdBy: currentUser?.id,
      creatorName: currentUser?.name,
      blobUrl: url // Store temporarily for viewing
    };
    
    // Add to project history
    const updatedProject = {
      ...project,
      pdfHistory: [...(project.pdfHistory || []), pdfRecord]
    };
    
    // Clean up the URL after 30 minutes to avoid memory leaks
    setTimeout(() => {
      URL.revokeObjectURL(url);
      if (updatedProject.pdfHistory) {
        const index = updatedProject.pdfHistory.findIndex(pdf => pdf.id === pdfRecord.id);
        if (index !== -1) {
          updatedProject.pdfHistory[index] = {
            ...updatedProject.pdfHistory[index],
            blobUrl: undefined
          };
        }
      }
    }, 30 * 60 * 1000);
    
    console.log('PDF report generation completed successfully');
    return updatedProject;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

/**
 * Opens a PDF from history for viewing
 */
export const viewPdfFromHistory = (pdfRecord: PdfRecord) => {
  if (pdfRecord.blobUrl) {
    // URL is still cached, open it directly
    window.open(pdfRecord.blobUrl, '_blank');
  } else {
    // URL expired, notify the user
    console.log('PDF URL has expired. Please regenerate the PDF.');
    return false;
  }
  return true;
};