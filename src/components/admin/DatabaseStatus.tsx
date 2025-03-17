import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Database, RefreshCw } from 'lucide-react';
import { SupabaseTable } from '@/types/supabase';

interface TableStatus {
  name: string;
  count: number | null;
  error: string | null;
  loading: boolean;
}

export function DatabaseStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [tableStatuses, setTableStatuses] = useState<TableStatus[]>([]);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const tables: SupabaseTable[] = [
    'companies',
    'folder_sensors',
    'pdf_records',
    'sensor_folders',
    'sensors',
    'sensor_values',
    'users'
  ];

  const checkConnection = async () => {
    setIsLoading(true);
    setConnectionError(null);
    
    try {
      // Check basic connection
      const { data, error } = await supabase
        .from('companies' as SupabaseTable)
        .select('count()', { count: 'exact', head: true });
      
      if (error) {
        setIsConnected(false);
        setConnectionError(error.message);
      } else {
        setIsConnected(true);
        
        // Initialize table statuses
        const initialStatuses = tables.map(table => ({
          name: table,
          count: null,
          error: null,
          loading: true
        }));
        
        setTableStatuses(initialStatuses);
        
        // Check each table
        const updatedStatuses = await Promise.all(
          tables.map(async (table) => {
            try {
              const { count, error } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });
              
              return {
                name: table,
                count: error ? null : count,
                error: error ? error.message : null,
                loading: false
              };
            } catch (err: any) {
              return {
                name: table,
                count: null,
                error: err.message,
                loading: false
              };
            }
          })
        );
        
        setTableStatuses(updatedStatuses);
      }
    } catch (err: any) {
      setIsConnected(false);
      setConnectionError(err.message);
    } finally {
      setIsLoading(false);
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Connection Status
        </CardTitle>
        <CardDescription>
          Check the status of your Supabase database connection
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Connection Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Connection Status</h3>
              <p className="text-sm text-muted-foreground">
                {isLoading ? 'Checking connection...' : 
                  isConnected ? 'Connected to Supabase' : 'Connection failed'}
              </p>
            </div>
            <div>
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : isConnected ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500" />
              )}
            </div>
          </div>
          
          {connectionError && (
            <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
              <h3 className="font-medium text-red-800">Connection Error</h3>
              <p className="text-sm text-red-600">{connectionError}</p>
            </div>
          )}
          
          {/* Table Statuses */}
          {isConnected && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted px-4 py-2">
                <h3 className="font-medium">Database Tables</h3>
              </div>
              <div className="divide-y">
                {tableStatuses.map((table) => (
                  <div key={table.name} className="flex items-center justify-between p-3">
                    <div>
                      <p className="font-medium">{table.name}</p>
                      {table.error && (
                        <p className="text-xs text-red-500">{table.error}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {table.loading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : table.error ? (
                        <Badge variant="destructive">Error</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-50">
                          {table.count} records
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {lastChecked && (
            <p className="text-xs text-muted-foreground text-right">
              Last checked: {lastChecked.toLocaleString()}
            </p>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={checkConnection} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Connection Status
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
