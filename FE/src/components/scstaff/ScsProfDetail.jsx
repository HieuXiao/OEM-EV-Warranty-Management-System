import SCStaffSibebar from "@/components/scstaff/ScsSidebar";
import Header from "@/components/Header";
import CustomerVinCard from "@/components/scstaff/ScsProfCard";
import { Label } from "@radix-ui/react-label";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { vehicleModels } from "@/lib/Mock-data";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Plus,
  ArrowLeft,
  Edit,
  Save,
  X,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import axiosPrivate from "@/api/axios";

const CUSTOMERS_URL = "/api/customers";
const VEHICLES_BY_ID_URL = "/api/vehicles/search/";
const VEHICLE_CREATE_URL = "/api/vehicles";

export default function CustomerDetail() {
  // ... (giữ nguyên các state và logic, chỉ thay đổi phần render)
  const { id } = useParams();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const navigate = useNavigate();
  const [formErrors, setFormErrors] = useState({});
  const [customer, setCustomer] = useState({});
  const [formData, setFormData] = useState({});
  const [vinList, setVinList] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editStatus, setEditStatus] = useState({
    loading: false,
    errors: {},
    success: false,
  });
  const [formVinData, setFormVinData] = useState({
    vin: "",
    plate: "",
    type: "",
    color: "",
    model: "",
    customerId: "",
  });

  // ... (giữ nguyên useEffect và các hàm xử lý)

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const response = await axiosPrivate.get(CUSTOMERS_URL);
        const cus = response.data.find((c) => c.customerId === parseInt(id));
        if (cus) {
          setCustomer(cus);
          setFormData(cus);
        } else {
          console.error("Customer not found");
          navigate(-1);
        }
      } catch (error) {
        console.error("API Error: " + error.message);
      }
    }
    fetchCustomers();
  }, [id, navigate]);

  useEffect(() => {
    async function fetchVehicles() {
      try {
        const response = await axiosPrivate.get(VEHICLES_BY_ID_URL + id);
        setVinList(response.data);
      } catch (error) {
        console.error("API Error: " + error.message);
      }
    }
    fetchVehicles();
  }, [id]);

  const handleEditClick = () => {
    setIsEditing(true);
    setEditStatus({ loading: false, errors: {}, success: false });
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setFormData(customer);
    setEditStatus({ loading: false, errors: {}, success: false });
  };

  const handleSaveClick = async () => {
    setEditStatus({ loading: true, errors: {}, success: false });
    if (!formData.customerEmail || !formData.customerPhone) {
      setEditStatus({
        loading: false,
        errors: {
          customerEmail: !formData.customerEmail ? "Email is required." : "",
          customerPhone: !formData.customerPhone ? "Phone is required." : "",
        },
        success: false,
      });
      return;
    }

    try {
      const UPDATE_URL = `${CUSTOMERS_URL}/${id}`;
      await axiosPrivate.put(UPDATE_URL, JSON.stringify(formData), {
        headers: { "Content-Type": "application/json" },
      });

      setIsEditing(false);
      setCustomer(formData);
      setEditStatus({ loading: false, errors: {}, success: true });

      setTimeout(
        () => setEditStatus((prev) => ({ ...prev, success: false })),
        2000
      );
    } catch (error) {
      console.error("Update Error:", error);
      const fieldErrors = {};

      if (error.response && error.response.status === 409) {
        const message = error.response.data?.message || "";
        if (message.toLowerCase().includes("phone")) {
          fieldErrors.customerPhone = "This phone number is already taken.";
        } else if (message.toLowerCase().includes("email")) {
          fieldErrors.customerEmail = "This email is already taken.";
        }
      }

      setEditStatus({ loading: false, errors: fieldErrors, success: false });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddVIN = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!formVinData.vin) {
      errors.vin = "VIN is required.";
    } else if (formVinData.vin.length !== 17) {
      errors.vin = "VIN must be 17 characters.";
    }
    if (!formVinData.plate) errors.plate = "Vehicle plate is required.";
    if (!formVinData.type) errors.type = "Vehicle type is required.";
    if (!formVinData.color) errors.color = "Color is required.";
    if (!formVinData.model) errors.model = "Model is required.";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const newVehicle = {
      vin: formVinData.vin,
      plate: formVinData.plate,
      type: formVinData.type,
      color: formVinData.color,
      model: formVinData.model,
      customerId: parseInt(id),
    };

    try {
      const response = await axiosPrivate.post(
        VEHICLE_CREATE_URL,
        JSON.stringify(newVehicle),
        { headers: { "Content-Type": "application/json" } }
      );

      setVinList([...vinList, response.data]);
      setIsAddDialogOpen(false);
      resetForm();
    } catch (vehicleError) {
      console.error("Vehicle Creation Error:", vehicleError);
      const fieldErrors = {};
      let apiErrorMessage = "Failed to create vehicle.";
      if (vehicleError.response) {
        const { status, data } = vehicleError.response;
        const message = data || "";

        if (status === 409) {
          if (message.toLowerCase().includes("vin")) {
            fieldErrors.vin = "This VIN is already registered.";
          } else if (message.toLowerCase().includes(":")) {
            fieldErrors.plate = "This Plate is already registered.";
          } else {
            apiErrorMessage = "Vehicle is a duplicate (VIN and Plate).";
          }
        } else {
          apiErrorMessage = message || apiErrorMessage;
        }
      } else if (vehicleError.request) {
        apiErrorMessage = "Network error while creating vehicle.";
      }
      setFormErrors({
        ...fieldErrors,
        api: `${apiErrorMessage}`.trim(),
      });
    }
  };

  const handleUpdateVIN = (updatedVin) => {
    setVinList((prev) =>
      prev.map((v) => (v.vin === updatedVin.vin ? updatedVin : v))
    );
  };

  const resetForm = () => {
    setFormVinData({
      vin: "",
      plate: "",
      type: "",
      color: "",
      model: "",
      customerId: parseInt(id),
    });
  };

  if (!customer) return <p>Customer not found</p>;

  return (
    <div className="min-h-screen bg-muted/30">
      <SCStaffSibebar name={"Nam"} role={"SC Staff"} />
      <div className="lg:pl-64">
        <Header name={"Pham Nhut Nam"} email={"nam.admin@gmail.com"} />
        <div className="p-4 md:p-6 lg:p-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Profile Management
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Configure system preferences and integrations
              </p>
            </div>

            <div className="p-0 sm:p-6">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>

              <Card>
                <CardHeader>
                  <CardTitle>Customer Detail</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <div>
                    <label className="font-medium text-sm">Name</label>
                    <Input
                      name="customerName"
                      value={formData.customerName || ""}
                      onChange={handleChange}
                      disabled={!isEditing || editStatus.loading}
                    />
                  </div>
                  <div>
                    <label className="font-medium text-sm">Email</label>
                    <Input
                      name="customerEmail"
                      value={formData.customerEmail || ""}
                      onChange={handleChange}
                      disabled={!isEditing || editStatus.loading}
                    />
                    {editStatus.errors.customerEmail && (
                      <p className="text-xs text-red-500 mt-1">
                        {editStatus.errors.customerEmail}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="font-medium text-sm">Phone</label>
                    <Input
                      name="customerPhone"
                      value={formData.customerPhone || ""}
                      onChange={handleChange}
                      disabled={!isEditing || editStatus.loading}
                    />
                    {editStatus.errors.customerPhone && (
                      <p className="text-xs text-red-500 mt-1">
                        {editStatus.errors.customerPhone}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="font-medium text-sm">Address</label>
                    <Input
                      name="customerAddress"
                      value={formData.customerAddress || ""}
                      onChange={handleChange}
                      disabled={!isEditing || editStatus.loading}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <div className="flex items-right gap-2">
                    {editStatus.success && !isEditing && (
                      <span className="text-sm text-green-500 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Saved!
                      </span>
                    )}

                    {!isEditing ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEditClick}
                        className="gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Update
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelClick}
                          disabled={editStatus.loading}
                          className="gap-2"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveClick}
                          disabled={editStatus.loading}
                          className="gap-1"
                        >
                          {editStatus.loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          Save
                        </Button>
                      </>
                    )}
                  </div>
                </CardFooter>
              </Card>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-6 mb-4 gap-4">
                <h2 className="text-lg font-semibold">Customer VINs</h2>
                <Dialog
                  open={isAddDialogOpen}
                  onOpenChange={(isOpen) => {
                    setIsAddDialogOpen(isOpen);
                    if (!isOpen) {
                      setFormErrors({});
                      resetForm();
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button className="gap-2 w-full sm:w-auto">
                      <Plus className="h-4 w-4" />
                      Add Vehicle
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                    <DialogHeader>
                      <DialogTitle>Add New Vehicle</DialogTitle>
                      <DialogDescription>
                        Registe VIN for Vehicle
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="vin">VIN</Label>
                        <Input
                          id="vin"
                          name="vin"
                          value={formVinData.vin}
                          onChange={(e) =>
                            setFormVinData({
                              ...formVinData,
                              vin: e.target.value,
                            })
                          }
                          placeholder="6HPJVKVA8N*******"
                        />
                        {formErrors.vin && (
                          <p className="text-sm text-red-500">
                            {formErrors.vin}
                          </p>
                        )}
                      </div>

                      {/* Responsive Grid for select fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="type">Type</Label>
                          <Select
                            value={formVinData.type}
                            onValueChange={(value) =>
                              setFormVinData({
                                ...formVinData,
                                type: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem key="car" value="Car">
                                Car
                              </SelectItem>
                              <SelectItem key="bike" value="Electric Motorbike">
                                Electric Motorbike
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          {formErrors.type && (
                            <p className="text-sm text-red-500">
                              {formErrors.type}
                            </p>
                          )}
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="color">Color</Label>
                          <Input
                            id="color"
                            name="color"
                            value={formVinData.color}
                            onChange={(e) =>
                              setFormVinData({
                                ...formVinData,
                                color: e.target.value,
                              })
                            }
                            placeholder="Red"
                          />
                          {formErrors.color && (
                            <p className="text-sm text-red-500">
                              {formErrors.color}
                            </p>
                          )}
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="model">Model</Label>
                          <Select
                            value={formVinData.model}
                            onValueChange={(value) =>
                              setFormVinData({ ...formVinData, model: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Model" />
                            </SelectTrigger>
                            <SelectContent>
                              {vehicleModels.map((model) => (
                                <SelectItem key={model} value={model}>
                                  {model}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {formErrors.model && (
                            <p className="text-sm text-red-500">
                              {formErrors.model}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="plate">Vehicle Plate</Label>
                        <Input
                          id="plate"
                          name="plate"
                          value={formVinData.plate}
                          onChange={(e) =>
                            setFormVinData({
                              ...formVinData,
                              plate: e.target.value,
                            })
                          }
                          placeholder="59X1-11111"
                        />
                        {formErrors.plate && (
                          <p className="text-sm text-red-500">
                            {formErrors.plate}
                          </p>
                        )}
                      </div>
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsAddDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleAddVIN}>Add Vehicle</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Responsive Grid for VIN Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {vinList.map((v) => (
                  <CustomerVinCard
                    key={v.vin}
                    vinData={v}
                    onUpdate={handleUpdateVIN}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
