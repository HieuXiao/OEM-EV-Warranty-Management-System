import SCStaffSibebar from "@/components/scstaff/ScsSidebar";
import Header from "@/components/Header";
import CustomerVinCard from "@/components/scstaff/ScsProfCustCard";
import { Label } from "@radix-ui/react-label";
import { useState } from "react";
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

export default function CustomerDetail() {
  const { id } = useParams();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const navigate = useNavigate();

  const customer = mockCustomers.find((c) => c.id === id);
  const [formData, setFormData] = useState(customer || {});
  const [vinList, setVinList] = useState(
    mockVIN.filter((v) => v.customerName === customer?.name)
  );

  // Form state
  const [formVinData, setFormVinData] = useState({
    vin: "",
    vehicleType: "",
    model: "",
    plate: "",
    customerName: customer.name,
  });

  if (!customer) return <p>Customer not found</p>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddVIN = () => {
    const newVIN = {
      vin: formVinData.vin,
      type: formVinData.type,
      model: formVinData.model,
      plate: formVinData.plate,
      customerName: formVinData.customerName,
    };
    setVinList([...vinList, newVIN]);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleUpdateVIN = (updatedVin) => {
    setVinList((prev) =>
      prev.map((v) => (v.vin === updatedVin.vin ? updatedVin : v))
    );
  };

  const handleDeleteVIN = (vin) => {
    setVinList((prev) => prev.filter((v) => v.vin !== vin));
  };

  const resetForm = () => {
    setFormData({
      vin: "",
      type: "",
      model: "",
      plate: "",
      customerName: customer.name,
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
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="font-medium">Email</label>
                    <Input
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="font-medium">Phone</label>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="font-medium">Address</label>
                    <Input
                      name="address"
                      value={formData.address}
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
                          placeholder="VN-BIKE-0003"
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
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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
