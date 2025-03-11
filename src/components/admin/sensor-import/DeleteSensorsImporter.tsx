import React, { useCallback, useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Papa from 'papaparse';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteSensorsImporterProps {
  onSensorsDelete: (sensorIdentifiers: { imei: string }[]) => void;
  onCancel: () => void;
}

const DeleteSensorsImporter: React.FC<DeleteSensorsImporterProps> = ({
  onSensorsDelete,
  onCancel
}) => {
  const [importedImeis, setImportedImeis] = useState<string[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        if (!results.data || !Array.isArray(results.data)) {
          toast.error("Invalid CSV format");
          return;
        }

        // Skip header row and filter out empty rows
        const rows = results.data.slice(1).filter(row => Array.isArray(row) && row.length > 0);

        // Extract IMEIs from CSV
        const imeis = rows
          .map(row => row[0]?.toString()?.trim())
          .filter((imei): imei is string => Boolean(imei));

        if (imeis.length === 0) {
          toast.error("No valid sensor IMEIs found in CSV. Please ensure the file has an 'imei' column with one IMEI per row.");
          return;
        }

        setImportedImeis(imeis);
      },
      error: (error) => {
        toast.error(`Error parsing CSV: ${error.message}`);
      }
    });
  }, [onSensorsDelete]);

  const handleDelete = useCallback(() => {
    onSensorsDelete(importedImeis.map(imei => ({ imei })));
  }, [importedImeis, onSensorsDelete]);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">Delete Sensors by CSV</h2>
      
      {importedImeis.length === 0 ? (
        <>
          <p className="text-muted-foreground">
            Upload a CSV file containing sensor IMEIs to delete. The CSV should have a single 'imei' column,
            with one IMEI per row.
          </p>
          
          <div className="space-y-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-violet-50 file:text-violet-700
                hover:file:bg-violet-100"
            />
            
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </div>
        </>
      ) : (
        <>
          <p className="text-muted-foreground mb-4">
            The following sensors will be deleted:
          </p>
          
          <div className="border rounded-lg overflow-hidden mb-4">
            <table className="min-w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="py-2 px-4 text-left">IMEI</th>
                </tr>
              </thead>
              <tbody>
                {importedImeis.map((imei, index) => (
                  <tr key={imei} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/50'}>
                    <td className="py-2 px-4">{imei}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowConfirmation(true)}
            >
              Delete Sensors
            </Button>
          </div>
        </>
      )}

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {importedImeis.length} sensors.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmation(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                handleDelete();
                setShowConfirmation(false);
              }}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DeleteSensorsImporter;