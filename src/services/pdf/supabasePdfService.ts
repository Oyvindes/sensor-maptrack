import { supabase } from '@/integrations/supabase/client';
import { PdfRecord } from '@/types/users';
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
const base64ToBlob = (base64: string): Blob => {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes], { type: 'application/pdf' });
};

/**
 * Save a PDF record to the database
 */
export const savePdfRecord = async (
  folderId: string,
  record: Omit<PdfRecord, 'id' | 'blobUrl'> & { pdfBlob: Blob }
): Promise<{ success: boolean; data?: PdfRecord; message: string }> => {
  try {
    const base64Content = await blobToBase64(record.pdfBlob);

    const { data, error } = await supabase
      .from('pdf_records')
      .insert({
        folder_id: folderId,
        filename: record.filename,
        created_at: record.createdAt,
        creator_name: record.creatorName,
        content_base64: base64Content
      })
      .select()
      .single();

    if (error) throw error;

    const blob = base64ToBlob(data.content_base64);
    const blobUrl = URL.createObjectURL(blob);

    return {
      success: true,
      data: {
        id: data.id,
        filename: data.filename,
        createdAt: data.created_at,
        creatorName: data.creator_name,
        blobUrl,
        type: 'pdf'  // Add the required type property
      },
      message: 'PDF record saved successfully'
    };
  } catch (error) {
    console.error('Error saving PDF record:', error);
    return {
      success: false,
      message: `Failed to save PDF record: ${error.message}`
    };
  }
};

/**
 * Get all PDF records for a project
 */
export const fetchPdfRecords = async (folderId: string): Promise<PdfRecord[]> => {
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
      type: 'pdf'  // Add the required type property
    }));
  } catch (error) {
    console.error('Error fetching PDF records:', error);
    toast.error('Failed to load PDF records from database');
    return [];
  }
};

/**
 * Get PDF content by record ID
 */
export const getPdfContent = async (recordId: string): Promise<{ blob: Blob } | null> => {
  try {
    const { data, error } = await supabase
      .from('pdf_records')
      .select('content_base64')
      .eq('id', recordId)
      .single();

    if (error || !data.content_base64) {
      throw error || new Error('No PDF content found');
    }

    return { blob: base64ToBlob(data.content_base64) };
  } catch (error) {
    console.error('Error fetching PDF content:', error);
    return null;
  }
};