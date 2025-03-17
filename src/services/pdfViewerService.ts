import { PdfRecord } from '@/types/users';

/**
 * Opens a PDF from a PdfRecord in a new tab/window
 * @param pdfRecord The PDF record containing the blobUrl
 * @returns boolean indicating success or failure
 */
export function viewPdfFromHistory(pdfRecord: PdfRecord): boolean {
  if (!pdfRecord.blobUrl) {
    return false;
  }
  
  try {
    // Open the PDF in a new tab/window
    window.open(pdfRecord.blobUrl, '_blank');
    return true;
  } catch (error) {
    console.error('Error viewing PDF:', error);
    return false;
  }
}