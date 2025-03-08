// Simple test script for PDF generation
import { jsPDF } from 'jspdf';

console.log('Testing PDF generation with jsPDF v3');

// Test function to check if jsPDF is working properly
async function testPdfGeneration() {
  try {
    console.log('Creating PDF instance...');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    console.log('Setting text on PDF...');
    pdf.setFont('helvetica');
    pdf.setFontSize(12);
    pdf.text('PDF Generation Test', 20, 20);
    
    console.log('Drawing shapes...');
    pdf.setDrawColor(0, 0, 0);
    pdf.setFillColor(255, 0, 0);
    pdf.rect(20, 30, 30, 20, 'FD');
    
    console.log('Outputting PDF to blob...');
    const blob = pdf.output('blob');
    console.log('PDF blob created successfully:', blob);
    
    console.log('Basic jsPDF test completed successfully!');
    return true;
  } catch (error) {
    console.error('Error in PDF generation test:', error);
    return false;
  }
}

// Run the test
testPdfGeneration()
  .then(success => {
    console.log(`PDF test ${success ? 'PASSED' : 'FAILED'}`);
  })
  .catch(err => {
    console.error('Test execution error:', err);
  });