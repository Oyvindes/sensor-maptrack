
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface DirectionsEmailFormProps {
  projectAddress: string | undefined;
  emailAddress: string;
  onEmailChange: (email: string) => void;
  emailError: string | null;
  isSendingDirections: boolean;
  onOpenDirections: () => void;
}

const DirectionsEmailForm: React.FC<DirectionsEmailFormProps> = ({
  projectAddress,
  emailAddress,
  onEmailChange,
  emailError,
  isSendingDirections,
  onOpenDirections
}) => {
  return (
    <div className="space-y-4 py-4">
      <div className="flex flex-col space-y-2">
        <Label htmlFor="projectAddress">Project Address</Label>
        <Input 
          id="projectAddress" 
          value={projectAddress || ""} 
          readOnly 
          className="bg-muted" 
        />
      </div>
      
      <div className="flex flex-col space-y-2">
        <Label htmlFor="emailAddress" className="flex justify-between">
          <span>Email Address</span>
          {isSendingDirections && <span className="text-sm text-muted-foreground">Sending...</span>}
        </Label>
        <Input 
          id="emailAddress" 
          type="email" 
          placeholder="Enter email address" 
          value={emailAddress} 
          onChange={(e) => onEmailChange(e.target.value)}
          className={emailError ? "border-red-500" : ""}
          disabled={isSendingDirections}
        />
        {emailError && (
          <div className="text-sm text-red-500 mt-1">{emailError}</div>
        )}
      </div>
      
      <Button
        type="button"
        variant="outline"
        onClick={onOpenDirections}
        className="w-full gap-2"
        disabled={isSendingDirections}
      >
        <ExternalLink className="h-4 w-4" />
        <span>Open Directions in New Tab</span>
      </Button>
    </div>
  );
};

export default DirectionsEmailForm;
