import SCStaffSibebar from "@/components/scstaff/ScsSidebar";
import Header from "@/components/Header";
import CustomerVinCard from "@/components/scstaff/ScsProfCard";
import { Label } from "@radix-ui/react-label";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mockCustomers, mockVIN, vehicleModels } from "@/lib/Mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
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

const CUSTOMERS_URL = "/api/customer/";
const VEHICLES_BY_PHONE_URL = "/api/vehicle/customer/";
const VEHICLE_CREATE_URL = "/api/vehicle/create";

export default function CustomerDetail() {
  const { id } = useParams();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const navigate = useNavigate();
  const [phone, setPhone] = useState();
  const [customer, setCustomer] = useState({});
  const [formData, setFormData] = useState({});
  const [vinList, setVinList] = useState([]);

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const response = await axiosPrivate.get(CUSTOMERS_URL);
        const cus = response.data.find((c) => c.customerId === parseInt(id));
        setPhone(cus.customerPhone);
        setCustomer(cus);
      } catch (error) {
        console.error("API Error: " + error.message);
      }
    }
    fetchCustomers();
  }, [id]);
  useEffect(() => {
    if (customer && Object.keys(customer).length > 0) {
      setFormData(customer);
    }
  }, [customer]);

  useEffect(() => {
    if (!phone) return;
    async function fetchVehicles() {
      try {
        const response = await axiosPrivate.get(VEHICLES_BY_PHONE_URL + phone);
        setVinList(response.data);
      } catch (error) {
        console.error("API Error: " + error.message);
      }
    }
    fetchVehicles();
  }, [phone]);

  // Form state
  const [formVinData, setFormVinData] = useState({
    vin: "",
    plate: "",
    type: "",
    color: "",
    model: "",
    customerPhone: "",
  });

  if (!customer) return <p>Customer not found</p>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddVIN = async (e) => {
    e.preventDefault();

    const newVehicle = {
      vin: formVinData.vin,
      plate: formVinData.plate,
      type: formVinData.type,
      color: formVinData.color,
      model: formVinData.model,
      customerPhone: phone,
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
    } catch (error) {
      console.error("API Error: " + error.message);
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
      customerPhone: phone,
    });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <SCStaffSibebar name={"Nam"} role={"SC Staff"} />
      <div className="lg:pl-64">
        <Header name={"Pham Nhut Nam"} email={"nam.admin@gmail.com"} />
        <div className="p-4 md:p-6 lg:p-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Profile Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Configure system preferences and integrations
              </p>
            </div>

            <div className="p-6">
              <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Customer Detail</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="font-medium">Name</label>
                    <Input
                      name="name"
                      value={formData.customerName}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="font-medium">Email</label>
                    <Input
                      name="email"
                      value={formData.customerEmail}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="font-medium">Phone</label>
                    <Input
                      name="phone"
                      value={formData.customerPhone}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="font-medium">Address</label>
                    <Input
                      name="address"
                      value={formData.customerAddress}
                      onChange={handleChange}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-between mt-6 mb-2">
                <h2 className="text-lg font-semibold">Customer VINs</h2>
                <Dialog
                  open={isAddDialogOpen}
                  onOpenChange={setIsAddDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Vehicle
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Add New Vehicle</DialogTitle>
                      <DialogDescription>
                        Registe VIN for Vehicle
                      </DialogDescription>
                    </DialogHeader>

                    {/* Dialog Add Vehicle */}
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
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1 grid gap-2">
                          <Label htmlFor="type">Vehicle Type</Label>
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
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem key="car" value="Car">
                                Car
                              </SelectItem>
                              <SelectItem key="bike" value="Bike">
                                Bike
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex-1 grid gap-2">
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
                        </div>

                        <div className="flex-1 grid gap-2">
                          <Label htmlFor="model">Model</Label>
                          <Select
                            value={formVinData.model}
                            onValueChange={(value) =>
                              setFormVinData({ ...formVinData, model: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select model" />
                            </SelectTrigger>
                            <SelectContent>
                              {vehicleModels.map((model) => (
                                <SelectItem key={model} value={model}>
                                  {model}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                      </div>
                    </div>
                    <DialogFooter>
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

              {/* VIN Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
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
