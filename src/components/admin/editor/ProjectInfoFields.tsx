
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SensorFolder } from "@/types/users";
import { Hash, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
      // This would typically be an API call to a Norwegian address lookup service
      // For demonstration, we're using a mock response
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock response with Norwegian addresses
      const mockAddresses: AddressSuggestion[] = [
        {
          address: `${query.charAt(0).toUpperCase() + query.slice(1)} 10`,
          postcode: "0150",
          city: "Oslo",
          lat: 59.9139,
          lng: 10.7522
        },
        {
          address: `${query.charAt(0).toUpperCase() + query.slice(1)} 25`,
          postcode: "0153",
          city: "Oslo",
          lat: 59.9111,
          lng: 10.7528
        },
        {
          address: `${query.charAt(0).toUpperCase() + query.slice(1)} 5`,
          postcode: "5020",
          city: "Bergen",
          lat: 60.3913,
          lng: 5.3221
        }
      ];
      
      setSuggestions(mockAddresses);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error fetching address suggestions:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddressSearch = () => {
    searchNorwegianAddresses(addressQuery);
  };

  const handleSelectAddress = (suggestion: AddressSuggestion) => {
    const fullAddress = `${suggestion.address}, ${suggestion.postcode} ${suggestion.city}, Norway`;
    onChange("address", fullAddress);
    
    // If the API provides coordinates, we can store them as well
    if (suggestion.lat && suggestion.lng) {
      onChange("location", JSON.stringify({ lat: suggestion.lat, lng: suggestion.lng }));
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
                  </div>
                ))}
              </div>
            </Card>
          )}
          
          <Input
            id="address"
            value={formData.address || ""}
            onChange={(e) => onChange("address", e.target.value)}
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
          onChange={(e) => onChange("description", e.target.value)}
          rows={3}
        />
      </div>
    </>
  );
};

export default ProjectInfoFields;
