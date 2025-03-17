import { jsPDF } from 'jspdf';
import { Purchase } from '@/types/store';
import { PdfRecord } from '@/types/users';
import { format } from 'date-fns';

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
      
      // Set up coordinates
      const leftMargin = 20;
      const rightColumnStart = 120;
      const startY = 40;
      let currentY = startY;
      
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
      
      // Table headers
      const colItem = leftMargin;
      const colDesc = leftMargin + 15;
      const colQty = 140;
      const colPrice = 160;
      const colTotal = 180;
      
      doc.text('Item', colItem, currentY);
      doc.text('Description', colDesc, currentY);
      doc.text('Qty', colQty, currentY);
      doc.text('Price', colPrice, currentY);
      doc.text('Total', colTotal, currentY);
      
      // Draw a line under headers
      currentY += 2;
      doc.setDrawColor(200, 200, 200);
      doc.line(leftMargin, currentY, 190, currentY);
      
      // Table data
      currentY += 8;
      doc.text('1', colItem, currentY);
      doc.text(purchase.productName, colDesc, currentY);
      doc.text(purchase.quantity.toString(), colQty, currentY);
      doc.text(`$${(purchase.totalPrice / purchase.quantity).toFixed(2)}`, colPrice, currentY);
      doc.text(`$${purchase.totalPrice.toFixed(2)}`, colTotal, currentY);
      
      // Draw a line under data
      currentY += 5;
      doc.line(leftMargin, currentY, 190, currentY);
      
      // Add total
      currentY += 15;
      doc.text('Subtotal:', 140, currentY);
      doc.text(`$${purchase.totalPrice.toFixed(2)}`, 180, currentY);
      
      currentY += 5;
      doc.text('Tax (0%):', 140, currentY);
      doc.text('$0.00', 180, currentY);
      
      currentY += 5;
      doc.text('Total:', 140, currentY);
      doc.text(`$${purchase.totalPrice.toFixed(2)}`, 180, currentY);
      
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
      doc.rect(10, 10, 190, currentY + 10);
      
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

export const pdfService: PdfServiceInterface = new PdfService();
