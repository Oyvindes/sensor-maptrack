
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Navigation, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from "@/components/ui/dialog";

import { useDirectionsEmail, DirectionsEmailData } from "./useDirectionsEmail";

interface DirectionsDialogProps {
  address: string | undefined;
  location: string | { lat: number; lng: number } | undefined;
}

const DirectionsDialog: React.FC<DirectionsDialogProps> = ({ address, location }) => {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { openDirectionsInNewTab } = useDirectionsEmail({ address, location });

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);

    if (window) {
      const event = new CustomEvent('directionsDialogStateChange', { 
        detail: { isOpen: open } 
      });
      window.dispatchEvent(event);
    }
  };

  if (!address) return null;

  return (
    <div className="mt-2 flex gap-2">
      <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
        <DialogTrigger asChild>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            className="gap-2"
          >
            <Navigation className="h-4 w-4" />
            <span>{t('projectEditor.directions.getDirections')}</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md fixed z-[100] bg-background">
          <DialogHeader>
            <DialogTitle>{t('projectEditor.directions.title')}</DialogTitle>
            <DialogDescription>
              {t('projectEditor.directions.description')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex flex-col space-y-2">
              <p className="text-sm font-medium">{t('projectEditor.directions.projectAddress')}</p>
              <p className="p-2 bg-muted rounded">{address}</p>
            </div>
            
            <Button
              type="button"
              onClick={openDirectionsInNewTab}
              className="w-full gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span>{t('projectEditor.directions.openInNewTab')}</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DirectionsDialog;
