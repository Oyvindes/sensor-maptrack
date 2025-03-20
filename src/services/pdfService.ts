import { jsPDF } from 'jspdf';
import { Purchase } from '@/types/store';
import { PdfRecord, SensorFolder } from '@/types/users';
import { format } from 'date-fns';
import { savePdfRecord } from './pdf/supabasePdfService';
import { fetchSensors } from './sensor/supabaseSensorService';

export interface PdfServiceInterface {
  generateProformaInvoice(purchase: Purchase): Promise<Blob>;
}

class PdfService implements PdfServiceInterface {
  async generateProformaInvoice(purchase: Purchase): Promise<Blob> {
    try {
      // Create a new PDF document
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text('PROFORMA INVOICE', 105, 20, { align: 'center' });
      
      // Set up coordinates with proper margins
      const leftMargin = 20;
      const rightMargin = 20;
      const pageWidth = doc.internal.pageSize.width;
      const rightColumnStart = 120;
      const startY = 40;
      let currentY = startY;
      
      // Calculate positions for summary section
      const summaryLabelX = 110; // Move labels left
      const summaryValueX = 165; // Move values left to avoid right margin
      
      // Add company details (left column)
      doc.setFontSize(12);
      doc.text('From:', leftMargin, currentY);
      currentY += 7;
      
      doc.setFontSize(10);
      doc.text('Your Company Name', leftMargin, currentY);
      currentY += 5;
      doc.text('Your Company Address', leftMargin, currentY);
      currentY += 5;
      doc.text('Your City, Country', leftMargin, currentY);
      currentY += 5;
      doc.text('VAT: Your VAT Number', leftMargin, currentY);
      currentY += 5;
      doc.text('Email: your@email.com', leftMargin, currentY);
      currentY += 5;
      doc.text('Phone: Your Phone Number', leftMargin, currentY);
      
      // Add invoice details (right column)
      currentY = startY;
      doc.setFontSize(10);
      
      // Invoice Date
      doc.text('Invoice Date:', rightColumnStart, currentY);
      doc.text(format(new Date(), 'yyyy-MM-dd'), rightColumnStart + 30, currentY);
      currentY += 5;
      
      // Invoice Number
      doc.text('Invoice Number:', rightColumnStart, currentY);
      doc.text(`INV-${purchase.orderReference || purchase.id.substring(0, 8)}`, rightColumnStart + 30, currentY);
      currentY += 5;
      
      // Order Reference - shortened to save space
      doc.text('Order Ref:', rightColumnStart, currentY);
      doc.text(purchase.orderReference || 'N/A', rightColumnStart + 30, currentY);
      currentY += 5;
      
      // Customer Reference (if available) - shortened to save space
      if (purchase.customerReference) {
        doc.text('Customer Ref:', rightColumnStart, currentY);
        doc.text(purchase.customerReference, rightColumnStart + 30, currentY);
      }
      
      // Add customer details
      currentY = 85;
      doc.setFontSize(12);
      doc.text('Bill To:', leftMargin, currentY);
      currentY += 7;
      
      doc.setFontSize(10);
      doc.text(purchase.companyName, leftMargin, currentY);
      currentY += 5;
      
      if (purchase.shippingAddress) {
        doc.text(purchase.shippingAddress, leftMargin, currentY);
        currentY += 5;
      }
      
      if (purchase.shippingCity || purchase.shippingPostalCode) {
        const cityPostal = [purchase.shippingCity, purchase.shippingPostalCode].filter(Boolean).join(', ');
        doc.text(cityPostal, leftMargin, currentY);
        currentY += 5;
      }
      
      if (purchase.shippingCountry) {
        doc.text(purchase.shippingCountry, leftMargin, currentY);
        currentY += 5;
      }
      
      if (purchase.contactEmail) {
        doc.text(`Email: ${purchase.contactEmail}`, leftMargin, currentY);
        currentY += 5;
      }
      
      if (purchase.contactPhone) {
        doc.text(`Phone: ${purchase.contactPhone}`, leftMargin, currentY);
        currentY += 5;
      }
      
      // Add item table
      currentY = 130;
      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);
      
      // Table headers with better spacing
      const colItem = leftMargin;
      const colDesc = leftMargin + 15;
      const colQty = 120;
      const colPrice = 140;
      const colTotal = 170; // Give more space between price and total
      
      doc.text('Item', colItem, currentY);
      doc.text('Description', colDesc, currentY);
      doc.text('Qty', colQty, currentY);
      doc.text('Price', colPrice, currentY);
      doc.text('Total', colTotal, currentY);
      
      // Draw a line under headers
      currentY += 2;
      doc.setDrawColor(200, 200, 200);
      doc.line(leftMargin, currentY, pageWidth - rightMargin, currentY);
      
      // Table data for each item
      currentY += 8;
      purchase.items.forEach((item, index) => {
        // Set color based on pricing type
        if (item.pricing_type === 'monthly') {
          doc.setTextColor(0, 0, 255); // Blue for monthly items
        } else {
          doc.setTextColor(40, 40, 40); // Default dark gray for one-time items
        }

        doc.text((index + 1).toString(), colItem, currentY);
        doc.text(`${item.productName} (${item.pricing_type === 'monthly' ? '📅 Monthly' : '💰 One-time'})`, colDesc, currentY);
        doc.text(item.quantity.toString(), colQty, currentY);
        doc.text(`${item.pricePerUnit.toFixed(2)}  kr${item.pricing_type === 'monthly' ? '/month' : ''}`, colPrice, currentY);
        doc.text(`${item.totalPrice.toFixed(2)}  kr${item.pricing_type === 'monthly' ? '/month' : ''}`, colTotal, currentY);

        // Reset text color
        doc.setTextColor(40, 40, 40);
        currentY += 6;
      });
      
      // Draw a line under data
      currentY += 2;
      doc.line(leftMargin, currentY, pageWidth - rightMargin, currentY);
      
      // Calculate totals with proper spacing
      const monthlyItems = purchase.items.filter(item => item.pricing_type === 'monthly');
      const onetimeItems = purchase.items.filter(item => item.pricing_type !== 'monthly');
      
      const monthlyTotal = monthlyItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const onetimeTotal = onetimeItems.reduce((sum, item) => sum + item.totalPrice, 0);

      // Add totals section
      currentY += 8;
      
      // Set default color
      doc.setTextColor(40, 40, 40);
      
      if (onetimeItems.length > 0) {
        doc.text('💰 One-time Costs:', summaryLabelX, currentY);
        doc.text(`${onetimeTotal.toFixed(2)}  kr`, summaryValueX, currentY);
        currentY += 5;
      }
      
      if (monthlyItems.length > 0) {
        // Set blue color for monthly items
        doc.setTextColor(0, 0, 255);
        doc.text('📅 Monthly Fees:', summaryLabelX, currentY);
        doc.text(`${monthlyTotal.toFixed(2)}  kr/month`, summaryValueX, currentY);
        currentY += 5;
        // Reset color
        doc.setTextColor(40, 40, 40);
      }
      
      // Only add tax line and total if there are one-time costs
      if (onetimeTotal > 0) {
        doc.text('Tax (0%):', summaryLabelX, currentY);
        doc.text('0.00  kr', summaryValueX, currentY);
        currentY += 5;
        
        doc.text('Total (One-time):', summaryLabelX, currentY);
        doc.text(`${onetimeTotal.toFixed(2)}  kr`, summaryValueX, currentY);
        currentY += 5;
      }
      
      // Add summary note
      currentY += 5;
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      if (monthlyTotal > 0) {
        doc.text(`* Monthly fees of ${monthlyTotal.toFixed(2)} kr will be billed separately`, leftMargin, currentY);
        currentY += 4;
      }
      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);
      
      // Add notes
      currentY += 15;
      doc.text('Notes:', leftMargin, currentY);
      currentY += 5;
      doc.text('This is a proforma invoice. It is not a tax invoice.', leftMargin, currentY);
      
      if (purchase.orderDetails) {
        currentY += 10;
        doc.text('Order Details:', leftMargin, currentY);
        currentY += 5;
        doc.text(purchase.orderDetails, leftMargin, currentY);
      }
      
      // Add a border around the entire invoice
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(leftMargin - 10, 10, pageWidth - (2 * (leftMargin - 10)), currentY + 10);
      
      // Add footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Page ${i} of ${pageCount} - Generated on ${format(new Date(), 'yyyy-MM-dd HH:mm')}`,
          105,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }
      
      // Return the PDF as a blob
      return doc.output('blob');
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }
}

/**
 * Generate and download a PDF report for a project
 * @param project The project to generate a report for
 * @param dataTypes Array of data types to include in the report (temperature, humidity, battery, signal)
 * @returns Updated project with new PDF history
 */
export async function downloadProjectReport(
  project: SensorFolder,
  dataTypes: string[] = ['temperature', 'humidity', 'battery', 'signal']
): Promise<SensorFolder> {
  try {
    // Fetch sensor data for the project
    const allSensors = await fetchSensors();
    const projectSensors = allSensors.filter(sensor =>
      project.assignedSensorImeis?.includes(sensor.imei)
    );

    // Create a new PDF document in landscape orientation
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text(`Project Report: ${project.name}`, 105, 20, { align: 'center' });
    
    // Add project details
    let currentY = 40;
    const leftMargin = 20;
    
    doc.setFontSize(12);
    doc.text('Project Details', leftMargin, currentY);
    currentY += 8;
    
    doc.setFontSize(10);
    doc.text(`Project Number: ${project.projectNumber || 'N/A'}`, leftMargin, currentY);
    currentY += 6;
    
    doc.text(`Address: ${project.address || 'N/A'}`, leftMargin, currentY);
    currentY += 6;
    
    doc.text(`Created By: ${project.creatorName || 'Unknown'}`, leftMargin, currentY);
    currentY += 6;
    
    doc.text(`Created On: ${format(new Date(project.createdAt), 'yyyy-MM-dd')}`, leftMargin, currentY);
    currentY += 6;
    
    if (project.startedAt) {
      doc.text(`Started: ${format(new Date(project.startedAt), 'yyyy-MM-dd HH:mm')}`, leftMargin, currentY);
      currentY += 6;
    }
    
    if (project.stoppedAt) {
      doc.text(`Stopped: ${format(new Date(project.stoppedAt), 'yyyy-MM-dd HH:mm')}`, leftMargin, currentY);
      currentY += 6;
    }
    
    // Add sensor data
    currentY += 10;
    doc.setFontSize(12);
    doc.text('Sensor Data', leftMargin, currentY);
    currentY += 8;
    
    // Value type configurations
    const valueConfigs = {
      temperature: { color: '#ff4444', label: 'Temperature', unit: '°C' },
      humidity: { color: '#4444ff', label: 'Humidity', unit: '%' },
      battery: { color: '#44ff44', label: 'Battery', unit: '%' },
      signal: { color: '#ff44ff', label: 'Signal', unit: '%' }
    };
    
    // Add data for each sensor
    for (const sensor of projectSensors) {
      // Get sensor location and zone if available
      const sensorLocation = project.sensorLocations?.[sensor.imei] || '';
      const sensorZone = project.sensorZones?.[sensor.imei] || '';
      
      // Create a display name that includes location and zone if available
      let displayName = `Sensor: ${sensor.name} (${sensor.imei})`;
      if (sensorLocation || sensorZone) {
        displayName += ' - ';
        if (sensorLocation) {
          displayName += sensorLocation;
          if (sensorZone) {
            displayName += `, ${sensorZone} zone`;
          }
        } else if (sensorZone) {
          displayName += `${sensorZone} zone`;
        }
      }
      
      doc.setFontSize(11);
      doc.text(displayName, leftMargin, currentY);
      currentY += 8;
      
      // Check if sensor has values
      if (!sensor.values || sensor.values.length === 0) {
        doc.setFontSize(9);
        doc.text('No data available for this sensor', leftMargin + 5, currentY);
        currentY += 10;
        continue;
      }
      
      // Process sensor values
      let processedValues = [];
      for (const value of sensor.values) {
        try {
          const parsedValue = typeof value === 'string' ? JSON.parse(value) : value;
          
          // Format the values appropriately
          const formattedValue = {
            ...parsedValue,
            time: new Date(parsedValue.time).toISOString(),
            formattedTime: format(new Date(parsedValue.time), 'MM/dd HH:mm'),
            // Apply the same transformations as in the UI
            batteryPercentage: ((parsedValue.battery - 2.5) / 1.1) * 100,
            signalPercentage: parsedValue.signal * 3.33
          };
          
          processedValues.push(formattedValue);
        } catch (e) {
          console.error('Error parsing sensor value:', e);
        }
      }
      
      // Sort by time
      processedValues.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
      
      // Get latest values for each selected data type
      if (processedValues.length > 0) {
        const latestValue = processedValues[processedValues.length - 1];
        
        doc.setFontSize(9);
        doc.text('Latest Values:', leftMargin + 5, currentY);
        currentY += 6;
        
        for (const dataType of dataTypes) {
          if (dataType in valueConfigs) {
            const config = valueConfigs[dataType as keyof typeof valueConfigs];
            let displayValue;
            
            // Get the appropriate value based on data type
            if (dataType === 'battery') {
              displayValue = latestValue.batteryPercentage;
            } else if (dataType === 'signal') {
              displayValue = latestValue.signalPercentage;
            } else {
              displayValue = latestValue[dataType];
            }
            
            doc.text(`${config.label}: ${displayValue.toFixed(1)}${config.unit}`, leftMargin + 10, currentY);
            currentY += 5;
          }
        }
        
        currentY += 5;
        
        // Draw graphs for each selected data type
        // In landscape mode, we can display graphs side by side
        // Calculate how many graphs we need to display
        const graphsToDisplay = dataTypes.filter(dt => dt in valueConfigs && processedValues.length > 1);
        
        if (graphsToDisplay.length > 0) {
          // Add a page break for the graphs
          doc.addPage();
          currentY = 20;
          
          // Add a title for the graphs page that includes location and zone
          const sensorLocation = project.sensorLocations?.[sensor.imei] || '';
          const sensorZone = project.sensorZones?.[sensor.imei] || '';
          
          let graphTitle = `Sensor Data Graphs: ${sensor.name}`;
          if (sensorLocation || sensorZone) {
            graphTitle += ' - ';
            if (sensorLocation) {
              graphTitle += sensorLocation;
              if (sensorZone) {
                graphTitle += `, ${sensorZone} zone`;
              }
            } else if (sensorZone) {
              graphTitle += `${sensorZone} zone`;
            }
          }
          
          doc.setFontSize(14);
          doc.setTextColor(40, 40, 40);
          doc.text(graphTitle, doc.internal.pageSize.width / 2, currentY, { align: 'center' });
          currentY += 15;
          
          // Display one graph per page for maximum size and detail
          const graphsPerPage = 1;
          
          // Calculate graph dimensions - use full width of the page with proper margins
          const graphSpacing = 30;
          const availableWidth = doc.internal.pageSize.width - (leftMargin * 2) - 20; // Extra margin for safety
          const singleGraphWidth = availableWidth;
          const singleGraphHeight = 120; // Make graphs taller
          
          // Draw graphs two at a time, with a new page for each pair
          for (let i = 0; i < graphsToDisplay.length; i += graphsPerPage) {
            // Start a new page for each pair of graphs (except the first pair)
            if (i > 0) {
              doc.addPage();
              currentY = 20;
              
              // Add a title for the graphs page that includes location and zone
              const sensorLocation = project.sensorLocations?.[sensor.imei] || '';
              const sensorZone = project.sensorZones?.[sensor.imei] || '';
              
              let graphTitle = `Sensor Data Graphs: ${sensor.name}`;
              if (sensorLocation || sensorZone) {
                graphTitle += ' - ';
                if (sensorLocation) {
                  graphTitle += sensorLocation;
                  if (sensorZone) {
                    graphTitle += `, ${sensorZone} zone`;
                  }
                } else if (sensorZone) {
                  graphTitle += `${sensorZone} zone`;
                }
              }
              
              doc.setFontSize(14);
              doc.setTextColor(40, 40, 40);
              doc.text(graphTitle, doc.internal.pageSize.width / 2, currentY, { align: 'center' });
              currentY += 15;
            }
            
            // Draw up to two graphs on this page
            for (let j = 0; j < graphsPerPage && (i + j) < graphsToDisplay.length; j++) {
              const dataType = graphsToDisplay[i + j];
              const config = valueConfigs[dataType as keyof typeof valueConfigs];
              
              // Calculate position based on vertical layout
              const graphX = leftMargin;
              const graphY = currentY + (j * (singleGraphHeight + graphSpacing));
              
              // Add graph title
              doc.setFontSize(10);
              doc.setTextColor(40, 40, 40);
              doc.text(`${config.label} (${config.unit})`, graphX + singleGraphWidth / 2, graphY - 5, { align: 'center' });
              
              // Define padding for the graph - more space for labels
              const padding = { top: 15, right: 15, bottom: 25, left: 35 };
              
              // Calculate the actual plotting area
              const plotX = graphX + padding.left;
              const plotY = graphY + padding.top;
              const plotWidth = singleGraphWidth - padding.left - padding.right;
              const plotHeight = singleGraphHeight - padding.top - padding.bottom;
              
              // Get min and max values for scaling
              let values = [];
              for (const value of processedValues) {
                if (dataType === 'battery') {
                  values.push(value.batteryPercentage);
                } else if (dataType === 'signal') {
                  values.push(value.signalPercentage);
                } else {
                  values.push(value[dataType]);
                }
              }
              
              // Calculate nice min/max values for the y-axis
              let minValue = Math.min(...values);
              let maxValue = Math.max(...values);
              
              // Add some padding to the min/max values
              const valuePadding = (maxValue - minValue) * 0.1;
              minValue = Math.max(0, minValue - valuePadding);
              maxValue = maxValue + valuePadding;
              
              // Round to nice numbers
              minValue = Math.floor(minValue);
              maxValue = Math.ceil(maxValue);
              
              const valueRange = maxValue - minValue;
              
              // Draw grid lines
              doc.setDrawColor(220, 220, 220);
              doc.setLineWidth(0.2);
              
              // Draw background rectangle with light gray
              doc.setFillColor(248, 248, 248);
              doc.rect(plotX, plotY, plotWidth, plotHeight, 'F');
              
              // Horizontal grid lines (y-axis) - more lines for better detail
              const yGridCount = 6;
              for (let k = 0; k <= yGridCount; k++) {
                const y = plotY + plotHeight - (k / yGridCount) * plotHeight;
                
                // Make grid lines lighter
                doc.setDrawColor(220, 220, 220);
                doc.setLineWidth(0.2);
                doc.line(plotX, y, plotX + plotWidth, y);
                
                // Add y-axis labels
                const labelValue = minValue + (k / yGridCount) * valueRange;
                doc.setFontSize(9);
                doc.setTextColor(80, 80, 80);
                doc.text(`${labelValue.toFixed(1)}${config.unit}`, plotX - 5, y, { align: 'right' });
              }
              
              // Vertical grid lines (x-axis) - more lines for better time resolution
              const xGridCount = 8;
              for (let k = 0; k <= xGridCount; k++) {
                const x = plotX + (k / xGridCount) * plotWidth;
                
                // Make grid lines lighter
                doc.setDrawColor(220, 220, 220);
                doc.setLineWidth(0.2);
                doc.line(x, plotY, x, plotY + plotHeight);
                
                // Add x-axis labels with better formatting
                if (processedValues.length > 0) {
                  const index = Math.floor((k / xGridCount) * (processedValues.length - 1));
                  const value = processedValues[index];
                  doc.setFontSize(8);
                  // Rotate text slightly for better readability
                  doc.text(value.formattedTime, x, plotY + plotHeight + 15, {
                    align: 'center',
                    angle: 0
                  });
                }
              }
              
              // Draw axes
              doc.setDrawColor(100, 100, 100);
              doc.setLineWidth(0.5);
              doc.line(plotX, plotY + plotHeight, plotX + plotWidth, plotY + plotHeight); // X-axis
              doc.line(plotX, plotY, plotX, plotY + plotHeight); // Y-axis
              
              // Use only a subset of points if there are too many
              const maxPoints = 100;
              const step = processedValues.length > maxPoints ? Math.floor(processedValues.length / maxPoints) : 1;
              const pointsToPlot = [];
              
              for (let k = 0; k < processedValues.length; k += step) {
                pointsToPlot.push(processedValues[k]);
              }
              
              // Make sure the last point is included
              if (pointsToPlot[pointsToPlot.length - 1] !== processedValues[processedValues.length - 1]) {
                pointsToPlot.push(processedValues[processedValues.length - 1]);
              }
              
              // Prepare points for the area fill
              const areaPoints = [];
              
              // Mark day changes with vertical lines
              let currentDay = null;
              const dayMarkers = [];
              
              // Find where days change
              for (let k = 0; k < processedValues.length; k++) {
                const date = new Date(processedValues[k].time);
                const day = date.getDate();
                
                if (currentDay !== null && day !== currentDay) {
                  // Day changed, calculate position
                  const position = plotX + (k / processedValues.length) * plotWidth;
                  const dateStr = format(date, 'MMM d');
                  dayMarkers.push({ position, dateStr });
                }
                
                currentDay = day;
              }
              
              // Draw day change markers
              for (const marker of dayMarkers) {
                // Draw vertical line
                doc.setDrawColor(180, 0, 0); // Red line
                doc.setLineWidth(0.5);
                doc.line(marker.position, plotY, marker.position, plotY + plotHeight);
                
                // Add date label
                doc.setFontSize(8);
                doc.setTextColor(180, 0, 0);
                doc.text(marker.dateStr, marker.position, plotY - 5, { align: 'center' });
              }
              
              // Draw data points and connect them with lines
              // Parse the color components
              const r = parseInt(config.color.substring(1, 3), 16);
              const g = parseInt(config.color.substring(3, 5), 16);
              const b = parseInt(config.color.substring(5, 7), 16);
              
              // Set line color and width
              doc.setDrawColor(r, g, b);
              doc.setLineWidth(1.5); // Thicker line for better visibility
              
              let prevX = null;
              let prevY = null;
              
              for (let k = 0; k < pointsToPlot.length; k++) {
                const value = pointsToPlot[k];
                let dataValue;
                
                if (dataType === 'battery') {
                  dataValue = value.batteryPercentage;
                } else if (dataType === 'signal') {
                  dataValue = value.signalPercentage;
                } else {
                  dataValue = value[dataType];
                }
                
                // Calculate position
                const xPos = plotX + (k / (pointsToPlot.length - 1)) * plotWidth;
                const normalizedValue = valueRange === 0 ? 0.5 : (dataValue - minValue) / valueRange;
                const yPos = plotY + plotHeight - (normalizedValue * plotHeight);
                
                // Store points for area fill
                areaPoints.push({ x: xPos, y: yPos });
                
                // Connect with line if not the first point
                if (prevX !== null && prevY !== null) {
                  doc.line(prevX, prevY, xPos, yPos);
                }
                
                prevX = xPos;
                prevY = yPos;
              }
              
              // Fill area under the curve
              if (areaPoints.length > 1) {
                // Create a filled area under the curve using triangles
                // Use a more transparent fill for better appearance
                doc.setFillColor(r, g, b, 0.15); // More transparent fill
                
                // Draw triangles to fill the area under the curve
                for (let k = 0; k < areaPoints.length - 1; k++) {
                  const p1 = areaPoints[k];
                  const p2 = areaPoints[k + 1];
                  
                  // Draw a filled triangle for each segment
                  doc.setDrawColor(0, 0, 0, 0); // Transparent border
                  
                  // Triangle: current point, next point, and bottom point
                  doc.triangle(
                    p1.x, p1.y,
                    p2.x, p2.y,
                    p2.x, plotY + plotHeight,
                    'F'
                  );
                  
                  // Triangle: current point, bottom point under current, bottom point under next
                  doc.triangle(
                    p1.x, p1.y,
                    p1.x, plotY + plotHeight,
                    p2.x, plotY + plotHeight,
                    'F'
                  );
                }
                
                // Redraw the line on top to make it more visible
                doc.setDrawColor(r, g, b);
                doc.setLineWidth(1.5);
                
                for (let k = 0; k < areaPoints.length - 1; k++) {
                  const p1 = areaPoints[k];
                  const p2 = areaPoints[k + 1];
                  doc.line(p1.x, p1.y, p2.x, p2.y);
                }
              }
              
              // Draw points on top of the area
              doc.setFillColor(parseInt(config.color.substring(1, 3), 16),
                              parseInt(config.color.substring(3, 5), 16),
                              parseInt(config.color.substring(5, 7), 16));
              
              // Only draw points if there aren't too many
              if (pointsToPlot.length <= 20) {
                for (const point of areaPoints) {
                  doc.circle(point.x, point.y, 1, 'F');
                }
              }
            }
          }
          
          // Update currentY to account for the graphs
          currentY += singleGraphHeight + 30;
        }
      }
      
      // Add a page break between sensors
      if (sensor !== projectSensors[projectSensors.length - 1]) {
        doc.addPage();
        currentY = 20;
      }
    }
    
    // Add footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Page ${i} of ${pageCount} - Generated on ${format(new Date(), 'yyyy-MM-dd HH:mm')}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    // Generate the PDF blob
    const pdfBlob = doc.output('blob');
    
    // Create a filename
    const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
    const filename = `${project.name.replace(/\s+/g, '_')}_Report_${timestamp}.pdf`;
    
    // Save the PDF record to the database
    const pdfRecord = {
      filename,
      createdAt: new Date().toISOString(),
      creatorName: project.creatorName || 'System',
      pdfBlob
    };
    
    const result = await savePdfRecord(project.id, pdfRecord);
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    // Update the project with the new PDF record
    const updatedProject = {
      ...project,
      pdfHistory: [
        ...(project.pdfHistory || []),
        result.data as PdfRecord
      ]
    };
    
    return updatedProject;
  } catch (error) {
    console.error('Error generating project report:', error);
    throw error;
  }
}

export const pdfService: PdfServiceInterface = new PdfService();
