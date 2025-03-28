import React from 'react';
import { useTranslation } from 'react-i18next';
import { SensorData } from '@/components/SensorCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Power, AlertTriangle, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import PowerDashboardButton from './PowerDashboardButton';

interface PowerPlugListProps {
  sensors: SensorData[];
  loading: boolean;
  onEdit: (sensor: SensorData) => void;
  onDelete: (sensor: SensorData) => void;
  onSelect?: (sensor: SensorData) => void;
  selectedSensor?: SensorData | null;
}

const PowerPlugList: React.FC<PowerPlugListProps> = ({
  sensors,
  loading,
  onEdit,
  onDelete,
  onSelect,
  selectedSensor
}) => {
  const { t } = useTranslation();
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (sensors.length === 0) {
    return (
      <div className="text-center py-8">
        <Power className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
        <p className="mt-2 text-muted-foreground">{t('powerPlugs.noPlugsFound')}</p>
        <p className="text-sm text-muted-foreground">{t('powerPlugs.addToGetStarted')}</p>
      </div>
    );
  }

  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('common.name')}</TableHead>
            <TableHead>{t('common.status')}</TableHead>
            <TableHead>IMEI</TableHead>
            <TableHead>{t('sensorAssignment.location')}</TableHead>
            <TableHead>{t('common.lastUpdated')}</TableHead>
            <TableHead className="text-right">{t('common.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sensors.map((sensor) => (
            <TableRow
              key={sensor.id}
              className={`${selectedSensor?.id === sensor.id ? 'bg-muted' : ''} ${onSelect ? 'cursor-pointer hover:bg-muted/50' : ''}`}
              onClick={() => onSelect && onSelect(sensor)}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Power className="h-4 w-4 text-green-500" />
                  {sensor.name}
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={sensor.status} />
              </TableCell>
              <TableCell className="font-mono text-xs">
                {sensor.imei || 'N/A'}
              </TableCell>
              <TableCell>
                {sensor.projectName || 'N/A'}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {sensor.lastUpdated}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end space-x-2">
                  <PowerDashboardButton
                    deviceId={sensor.id}
                    deviceName={sensor.name}
                    size="sm"
                    variant="ghost"
                    showLabel={false}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(sensor);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">{t('common.edit')}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent row selection when clicking delete
                      onDelete(sensor);
                    }}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">{t('common.delete')}</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// Helper component for status badges
const StatusBadge: React.FC<{ status: 'online' | 'offline' | 'warning' }> = ({ status }) => {
  const { t } = useTranslation();
  switch (status) {
    case 'online':
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Power className="h-3 w-3 mr-1 text-green-500" />
          {t('common.online')}
        </Badge>
      );
    case 'warning':
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <AlertTriangle className="h-3 w-3 mr-1 text-yellow-500" />
          {t('common.warning')}
        </Badge>
      );
    case 'offline':
    default:
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          {t('common.offline')}
        </Badge>
      );
  }
};

export default PowerPlugList;