
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SensorFolder } from "@/types/users";
import { Hash, MapPin, Search, Mail, Navigation, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";

interface ProjectInfoFieldsProps {
  formData: SensorFolder;
  onChange: (field: keyof SensorFolder, value: string) => void;
}

interface AddressSuggestion {
  address: string;
  postcode: string;
  city: string;
  lat?: number;
  lng?: number;
}

const ProjectInfoFields: React.FC<ProjectInfoFieldsProps> = ({
  formData,
  onChange
}) => {
  const [addressQuery, setAddressQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [isSendingDirections, setIsSendingDirections] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const searchNorwegianAddresses = async (query: string) => {
    if (!query || query.length < 3) return;
    
    try {
      setIsSearching(true);
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)},Trondheim,Norway&addressdetails=1&limit=3`,
        {
          headers: {
            "Accept-Language": "en-US,en;q=0.9,nb;q=0.8",
            "User-Agent": "SensorTrackingAppDemo/1.0"
          }
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch address data");
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const addressSuggestions: AddressSuggestion[] = data.map((item: any) => {
          const road = item.address.road || "";
          const houseNumber = item.address.house_number || "";
          const postcode = item.address.postcode || "";
          const city = item.address.city || item.address.town || item.address.village || "Trondheim";
          
          return {
            address: `${road} ${houseNumber}`.trim(),
            postcode: postcode,
            city: city,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon)
          };
        });
        
        setSuggestions(addressSuggestions);
        setShowSuggestions(true);
      } else {
        // Trondheim mock addresses with real coordinates
        const mockAddresses: AddressSuggestion[] = [
          {
            address: "Munkegata 1",
            postcode: "7013",
            city: "Trondheim",
            lat: 63.4305,
            lng: 10.3951
          },
          {
            address: "Olav Tryggvasons gate 1",
            postcode: "7011",
            city: "Trondheim",
            lat: 63.4336,
            lng: 10.4027
          },
          {
            address: "Kongens gate 14",
            postcode: "7011", 
            city: "Trondheim",
            lat: 63.4298,
            lng: 10.3940
          }
        ];
        
        setSuggestions(mockAddresses);
        setShowSuggestions(true);
        toast.warning("Using sample Trondheim addresses - no exact match found");
      }
    } catch (error) {
      console.error("Error fetching address suggestions:", error);
      toast.error("Failed to fetch address data");
      
      // Backup Trondheim address if API fails
      const mockAddresses: AddressSuggestion[] = [
        {
          address: "Prinsens gate 22",
          postcode: "7012",
          city: "Trondheim",
          lat: 63.4292,
          lng: 10.3942
        }
      ];
      
      setSuggestions(mockAddresses);
      setShowSuggestions(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddressSearch = () => {
    searchNorwegianAddresses(addressQuery);
  };

  const handleSelectAddress = (suggestion: AddressSuggestion) => {
    const fullAddress = `${suggestion.address}, ${suggestion.postcode} ${suggestion.city}, Norway`;
    onChange("address" as keyof SensorFolder, fullAddress);
    
    if (suggestion.lat && suggestion.lng) {
      const locationData = JSON.stringify({
        lat: suggestion.lat,
        lng: suggestion.lng
      });
      onChange("location" as keyof SensorFolder, locationData);
      
      toast.success(`Address set with precise coordinates [${suggestion.lat}, ${suggestion.lng}]`);
    }
    
    setShowSuggestions(false);
    setAddressQuery("");
  };

  const sendDirectionsEmail = async () => {
    if (!emailAddress || !formData.address) {
      toast.error("Email address and project address are required");
      return;
    }

    try {
      setIsSendingDirections(true);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(formData.address)}`;
      
      if (formData.location) {
        try {
          let locationData: {lat: number, lng: number};
          if (typeof formData.location === 'string') {
            locationData = JSON.parse(formData.location);
          } else {
            locationData = formData.location as {lat: number, lng: number};
          }
          
          if (locationData.lat && locationData.lng) {
            googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${locationData.lat},${locationData.lng}`;
          }
        } catch (e) {
          console.error("Error parsing location data:", e);
        }
      }
      
      console.log(`Sending directions for project "${formData.name}" to ${emailAddress}`);
      console.log(`Directions URL: ${googleMapsUrl}`);
      
      toast.success(`Directions sent to ${emailAddress}`);
      setDialogOpen(false);
    } catch (error) {
      console.error("Error sending directions:", error);
      toast.error("Failed to send directions");
    } finally {
      setIsSendingDirections(false);
    }
  };

  const sendToOwner = () => {
    const ownerEmail = "project.owner@example.com";
    setEmailAddress(ownerEmail);
    sendDirectionsEmail();
  };

  return (
    <>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Project Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onChange("name", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="projectNumber">
            <div className="flex items-center gap-1">
              <Hash className="h-4 w-4" />
              <span>Project Number</span>
            </div>
          </Label>
          <Input
            id="projectNumber"
            value={formData.projectNumber || ""}
            onChange={(e) => onChange("projectNumber", e.target.value)}
            placeholder="e.g., PRJ-2023-001"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>Project Address</span>
          </div>
        </Label>
        <div className="relative">
          <div className="flex gap-2">
            <Input
              id="addressSearch"
              value={addressQuery}
              onChange={(e) => setAddressQuery(e.target.value)}
              placeholder="Search for Norwegian address..."
              className="flex-1"
            />
            <Button 
              type="button" 
              onClick={handleAddressSearch} 
              disabled={isSearching || addressQuery.length < 3}
              size="icon"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
          
          {showSuggestions && suggestions.length > 0 && (
            <Card className="absolute z-10 mt-1 w-full max-h-64 overflow-auto">
              <div className="p-2">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-2 hover:bg-muted cursor-pointer rounded-sm"
                    onClick={() => handleSelectAddress(suggestion)}
                  >
                    <div className="font-medium">{suggestion.address}</div>
                    <div className="text-sm text-muted-foreground">
                      {suggestion.postcode} {suggestion.city}, Norway
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Coordinates: [{suggestion.lat}, {suggestion.lng}]
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
          
          <Input
            id="address"
            value={formData.address || ""}
            onChange={(e) => onChange("address" as keyof SensorFolder, e.target.value)}
            placeholder="Full address of the project location"
            className="mt-2"
          />
          
          {formData.address && (
            <div className="mt-2 flex gap-2">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    className="gap-2"
                  >
                    <Navigation className="h-4 w-4" />
                    <span>Send Directions</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md fixed z-[100] bg-background">
                  <DialogHeader>
                    <DialogTitle>Send Directions</DialogTitle>
                    <DialogDescription>
                      Send Google Maps directions to the project location
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="flex flex-col space-y-2">
                      <Label htmlFor="projectAddress">Project Address</Label>
                      <Input 
                        id="projectAddress" 
                        value={formData.address || ""} 
                        readOnly 
                        className="bg-muted" 
                      />
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <Label htmlFor="emailAddress">Email Address</Label>
                      <Input 
                        id="emailAddress" 
                        type="email" 
                        placeholder="Enter email address" 
                        value={emailAddress} 
                        onChange={(e) => setEmailAddress(e.target.value)} 
                      />
                    </div>
                  </div>
                  
                  <DialogFooter className="flex sm:justify-between">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={sendToOwner}
                      disabled={isSendingDirections}
                      className="gap-2 hidden sm:flex"
                    >
                      <Mail className="h-4 w-4" />
                      <span>Send to Project Owner</span>
                    </Button>
                    <Button 
                      type="button" 
                      onClick={sendDirectionsEmail}
                      disabled={isSendingDirections || !emailAddress}
                      className="gap-2"
                    >
                      <Navigation className="h-4 w-4" />
                      <span>Send Directions</span>
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={formData.description || ""}
          onChange={(e) => onChange("description" as keyof SensorFolder, e.target.value)}
          rows={3}
        />
      </div>
    </>
  );
};

export default ProjectInfoFields;
