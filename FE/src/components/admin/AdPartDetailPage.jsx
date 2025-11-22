// FE/src/components/admin/AdPartDetailPage.jsx

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Trash2, Edit, ArrowLeft, Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// === HELPER FUNCTIONS ===

/**
 * @function formatNumber
 * @param {number|string} num - The number value to format.
 * @returns {string} The formatted number string (e.g., "4,000,000").
 */
const formatNumber = (num) => {
  if (num === null || num === undefined || num === "") return "";
  // Ensure input is treated as a number before formatting
  const numberValue = Number(num);
  if (isNaN(numberValue)) return String(num);
  // Using "en-US" locale for comma separation
  return numberValue.toLocaleString("en-US");
};

/**
 * @component
 * @description Displays the detailed information for a single part, including policies, and allows for editing.
 * @param {Object} part - The part object to display/edit.
 * @param {function} onBack - Handler to return to the parts list.
 * @param {function} onUpdate - Handler to save part changes to the API.
 * @param {function} onDelete - Handler to delete the part.
 * @param {Object[]} partPolicies - Array of policies associated with the part.
 * @param {function} onEditPolicy - Handler to open the edit modal for a specific policy.
 * @param {function} onAddPolicy - Handler to open the create policy modal.
 */
export default function PartDetailPage({
  part,
  onBack,
  onUpdate,
  onDelete,
  partPolicies,
  onEditPolicy,
  onAddPolicy,
}) {
  // === STATE INITIALIZATION ===
  const [formData, setFormData] = useState({
    partId: part.partId,
    partName: part.partName,
    partBrand: part.partBrand,
    price: part.price,
    vehicleModel: part.vehicleModel,
    description: part.description,
    isEnable: part.isEnable,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  // State to hold the formatted price string for display purposes
  const [formattedPrice, setFormattedPrice] = useState("");

  // ============= 1. EFFECT HOOKS =============

  /**
   * Effect hook to reset state when the 'part' prop changes (e.g., navigating to a new detail page).
   */
  useEffect(() => {
    const initialPrice = part.price || 0;
    setFormData({
      partId: part.partId,
      partName: part.partName,
      partBrand: part.partBrand,
      price: initialPrice,
      vehicleModel: part.vehicleModel,
      description: part.description,
      isEnable: part.isEnable,
    });
    setFormattedPrice(formatNumber(initialPrice)); // Initialize formatted value
    setIsEditing(false);
    setHasChanges(false);
  }, [part]);

  // ============= 2. EVENT HANDLERS =============

  /**
   * @function handleChange
   * @param {string} field - The key of the field to update.
   * @param {*} value - The new value for the field.
   * @description Updates form data and flags that changes have been made by comparing with original part data.
   */
  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    // Check changes against the original part properties
    const isChanged =
      updated.partName !== part.partName ||
      updated.partBrand !== part.partBrand ||
      Number(updated.price) !== part.price ||
      updated.vehicleModel !== part.vehicleModel ||
      updated.description !== part.description ||
      updated.isEnable !== part.isEnable;

    setHasChanges(isChanged);
  };

  /**
   * @function handlePriceDisplayChange
   * @param {Object} e - Event object from the input field.
   * @description Handles input for the Price field, formats the display value (with commas),
   * and saves the raw numeric string to formData for correct API submission.
   */
  const handlePriceDisplayChange = (e) => {
    const inputStr = e.target.value;
    // Remove all non-numeric characters (except potentially a leading minus sign, though usually price is positive)
    const rawNumberStr = inputStr.replace(/[^0-9]/g, "");
    const numericValue = rawNumberStr ? parseInt(rawNumberStr, 10) : "";

    // Update formData (raw numeric string)
    handleChange("price", String(numericValue));
    // Update formatted state for display
    setFormattedPrice(formatNumber(numericValue));
  };

  /**
   * @function handleCancel
   * @description Exits edit mode and resets formData to the original part props.
   */
  const handleCancel = () => {
    setIsEditing(false);
    setHasChanges(false);
    // Reset form data to the original part data and formatted price
    setFormData({
      partId: part.partId,
      partName: part.partName,
      partBrand: part.partBrand,
      price: part.price,
      vehicleModel: part.vehicleModel,
      description: part.description,
      isEnable: part.isEnable,
    });
    setFormattedPrice(formatNumber(part.price));
  };

  /**
   * @function handleSave
   * @description Calls the parent onUpdate handler with current formData and exits edit mode.
   */
  const handleSave = () => {
    // Ensure price is submitted as a number
    const dataToSave = {
      ...formData,
      price: Number(formData.price),
    };

    onUpdate(dataToSave);
    setIsEditing(false);
    setHasChanges(false);
  };

  // ============= 3. RENDER FUNCTION =============

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      {/* --- HEADER & BACK BUTTON --- */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Parts List
          </Button>
          <h1 className="text-2xl font-bold">
            Part Details - {formData.partName}
          </h1>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg">Part & Status Information</CardTitle>
            {/* Edit/Save/Cancel Buttons */}
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={!hasChanges}>
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Part
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Part Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4">
              {/* Read-only fields */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Part ID</Label>
                <p className="text-sm font-semibold">{formData.partId}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Creator Admin
                </Label>
                <p className="text-sm font-semibold">
                  {part.admin?.fullName || part.admin?.accountId || "N/A"}
                </p>
              </div>
            </div>

            {/* Editable fields */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1 md:col-span-2">
                <Label className="text-xs">Part Name</Label>
                <Input
                  className="h-8 text-sm"
                  value={formData.partName}
                  onChange={(e) => handleChange("partName", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Part Brand</Label>
                <Input
                  className="h-8 text-sm"
                  value={formData.partBrand}
                  onChange={(e) => handleChange("partBrand", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Price (VND)</Label>
                <Input
                  className="h-8 text-sm"
                  type="text" // Use type text for custom formatting input
                  value={formattedPrice}
                  onChange={handlePriceDisplayChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label className="text-xs">Vehicle Model (Multi-select)</Label>
                <Input
                  className="h-8 text-sm"
                  value={formData.vehicleModel}
                  onChange={(e) => handleChange("vehicleModel", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label className="text-xs">Description</Label>
                <Input
                  className="h-8 text-sm"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* Status Section */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Label htmlFor="detail-isEnable" className="text-sm">
                Enabled Status
              </Label>
              <Switch
                id="detail-isEnable"
                checked={formData.isEnable}
                onCheckedChange={(checked) => handleChange("isEnable", checked)}
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>

        {/* Policies List */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              Part Policies ({partPolicies?.length || 0})
            </h3>
            <Button variant="outline" size="sm" onClick={onAddPolicy}>
              <Plus className="h-4 w-4 mr-2" />
              Add Policy
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {partPolicies && partPolicies.length > 0 ? (
              partPolicies.map((policy) => (
                <Card
                  key={policy.policyId}
                  className="shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardHeader className="flex flex-row items-start justify-between gap-0 p-3 pb-2">
                    <div>
                      <CardTitle className="text-sm font-semibold">
                        {policy.policyName}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        ID: {policy.policyId}
                      </p>
                    </div>
                    {/* Policy Edit Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onEditPolicy(policy)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-muted-foreground">Years:</p>
                        <p className="font-medium">{policy.availableYear}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Kilometers:</p>
                        <p className="font-medium">
                          {Number(policy.kilometer).toLocaleString("en-US")} km
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t">
                      <p className="text-muted-foreground">Status:</p>
                      <span
                        className={`text-xs font-semibold ${
                          policy.isEnable ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {policy.isEnable ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-sm text-muted-foreground md:col-span-2 lg:col-span-3">
                No warranty policies found.
              </p>
            )}
          </div>
        </div>

        <Separator />

        <div className="flex justify-start items-center">
          {/* Note: Delete button can be placed here if onDelete handler is implemented */}
        </div>
      </div>
    </div>
  );
}
