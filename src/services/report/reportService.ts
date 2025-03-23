import { supabase } from '@/integrations/supabase/client';
import { ReportRecord } from '@/types/users';
import { toast } from 'sonner';

/**
 * Convert Blob to base64
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
      resolve(base64String.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Convert base64 to Blob
 */
const base64ToBlob = (base64: string, mimeType: string): Blob => {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
};

/**
 * Save a report record to the database
 */
export const saveReportRecord = async (
  folderId: string,
  record: Omit<ReportRecord, 'id' | 'blobUrl'> & { blob: Blob }
): Promise<{ success: boolean; data?: ReportRecord; message: string }> => {
  try {
    const base64Content = await blobToBase64(record.blob);
    const mimeType = record.type === 'pdf' ? 'application/pdf' : 'text/html';

    const { data, error } = await supabase
      .from('pdf_records')
      .insert({
        folder_id: folderId,
        filename: record.filename,
        created_at: record.createdAt,
        creator_name: record.creatorName,
        content_base64: base64Content,
        report_type: record.type
      })
      .select()
      .single();

    if (error) throw error;

    const blob = base64ToBlob(data.content_base64, mimeType);
    const blobUrl = URL.createObjectURL(blob);

    return {
      success: true,
      data: {
        id: data.id,
        filename: data.filename,
        createdAt: data.created_at,
        creatorName: data.creator_name,
        type: data.report_type || 'pdf', // Default to pdf for backward compatibility
        blobUrl
      },
      message: `${record.type.toUpperCase()} report saved successfully`
    };
  } catch (error) {
    console.error(`Error saving ${record.type} report:`, error);
    return {
      success: false,
      message: `Failed to save ${record.type} report: ${error.message}`
    };
  }
};

/**
 * Get all report records for a project
 */
export const fetchReportRecords = async (folderId: string): Promise<ReportRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('pdf_records')
      .select('*')
      .eq('folder_id', folderId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(record => ({
      id: record.id,
      filename: record.filename,
      createdAt: record.created_at,
      creatorName: record.creator_name,
      type: record.report_type || 'pdf' // Default to pdf for backward compatibility
    }));
  } catch (error) {
    console.error('Error fetching report records:', error);
    toast.error('Failed to load report records from database');
    return [];
  }
};

/**
 * Get report content by record ID
 */
export const getReportContent = async (recordId: string): Promise<{ blob: Blob; type: 'pdf' | 'html' } | null> => {
  try {
    const { data, error } = await supabase
      .from('pdf_records')
      .select('content_base64, report_type')
      .eq('id', recordId)
      .single();

    if (error || !data.content_base64) {
      throw error || new Error('No report content found');
    }

    const type = data.report_type || 'pdf'; // Default to pdf for backward compatibility
    const mimeType = type === 'pdf' ? 'application/pdf' : 'text/html';
    
    return { 
      blob: base64ToBlob(data.content_base64, mimeType),
      type: type as 'pdf' | 'html'
    };
  } catch (error) {
    console.error('Error fetching report content:', error);
    return null;
  }
};

/**
 * Convert HTML string to Blob
 */
export const htmlToBlob = (html: string): Blob => {
  return new Blob([html], { type: 'text/html' });
};

/**
 * For backward compatibility
 */
export const savePdfRecord = async (
  folderId: string,
  record: Omit<ReportRecord, 'id' | 'blobUrl' | 'type'> & { pdfBlob: Blob }
): Promise<{ success: boolean; data?: ReportRecord; message: string }> => {
  return saveReportRecord(folderId, {
    ...record,
    blob: record.pdfBlob,
    type: 'pdf'
  });
};

/**
 * For backward compatibility
 */
export const fetchPdfRecords = fetchReportRecords;

/**
 * For backward compatibility
 */
export const getPdfContent = async (recordId: string): Promise<{ blob: Blob } | null> => {
  const result = await getReportContent(recordId);
  if (!result) return null;
  return { blob: result.blob };
};