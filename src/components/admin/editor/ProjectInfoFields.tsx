
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SensorFolder } from "@/types/users";
import { Hash, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

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

  const searchNorwegianAddresses = async (query: string) => {
    if (!query || query.length < 3) return;
    
    try {
      setIsSearching(true);
      
      // Use OpenStreetMap's Nominatim API for geocoding (real API call)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)},Norway&addressdetails=1&limit=3`,
        {
          headers: {
            "Accept-Language": "en-US,en;q=0.9,nb;q=0.8",
            "User-Agent": "SensorTrackingAppDemo/1.0"  // Required by Nominatim ToS
          }
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch address data");
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const addressSuggestions: AddressSuggestion[] = data.map((item: any) => {
          // Extract relevant address parts
          const road = item.address.road || "";
          const houseNumber = item.address.house_number || "";
          const postcode = item.address.postcode || "";
          const city = item.address.city || item.address.town || item.address.village || "";
          
          return {
            address: `${road} ${houseNumber}`.trim(),
            postcode: postcode,
            city: city,
            lat: parseFloat(item.lat),  // Preserving full precision
            lng: parseFloat(item.lon)   // Preserving full precision
          };
        });
        
        setSuggestions(addressSuggestions);
        setShowSuggestions(true);
      } else {
        // Use static data as fallback or when API returns no results
        // This fallback maintains compatibility with the demo
        const mockAddresses: AddressSuggestion[] = [
          {
            address: "Klettvegen 57A",
            postcode: "7083",
            city: "Leinstrand",
            lat: 63.3253392684221,
            lng: 10.312003580149943
          },
          {
            address: "Klettvegen 59",
            postcode: "7083",
            city: "Leinstrand",
            lat: 63.32550,
            lng: 10.31220
          },
          {
            address: "Klettvegen 55",
            postcode: "7083", 
            city: "Leinstrand",
            lat: 63.32520,
            lng: 10.31180
          }
        ];
        
        setSuggestions(mockAddresses);
        setShowSuggestions(true);
        toast.warning("Using demo addresses - no exact match found");
      }
    } catch (error) {
      console.error("Error fetching address suggestions:", error);
      toast.error("Failed to fetch address data");
      
      // Fallback to static data in case of error
      const mockAddresses: AddressSuggestion[] = [
        {
          address: "Klettvegen 57A",
          postcode: "7083",
          city: "Leinstrand",
          lat: 63.3253392684221,
          lng: 10.312003580149943
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
    
    // If the API provides coordinates, we can store them as well
    if (suggestion.lat && suggestion.lng) {
      // Pass the location data with maximum precision
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
