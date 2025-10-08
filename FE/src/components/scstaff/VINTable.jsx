import { Button } from "@/components/ui/button";
import { Search, Plus, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { mockVIN, vehicleModels } from "@/lib/Mock-data";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";

export default function VINTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [vins, setVins] = useState(mockVIN);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const filteredVINs = vins.filter(
    (v) =>
      v.vin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Form state
  const [formData, setFormData] = useState({
    vin: "",
    vehicleType: "",
    model: "",
    plate: "",
    customerName: "",
  });

  const handleAdd = () => {
    const newVIN = {
      vin: formData.vin,
      vehicleType: formData.vehicleType,
      model: formData.model,
      plate: formData.plate,
      customerName: formData.customerName,
    };
    setVins([...vins, newVIN]);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditVehicle = () => {
    if (!editingVehicle) return;
    setVins(
      vins.map((v) =>
        v.vin === editingVehicle.vin
          ? {
              ...v,
              plate: formData.plate,
              customerName: formData.customerName,
            }
          : v
      )
    );
    setEditingVehicle(null);
    resetForm();
  };

  const openEditDialog = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      plate: vehicle.plate,
      customerName: vehicle.customerName,
    });
  };

  const handleDelete = (vin) => {
    setVins(vins.filter((v) => v.vin !== vin));
  };

  const resetForm = () => {
    setFormData({
      vin: "",
      vehicleType: "",
      model: "",
      plate: "",
      customerName: "",
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Title */}
            <div>
              <CardTitle>Vehicle Information</CardTitle>
              <CardDescription>Vehicles detatails</CardDescription>
            </div>

            {/* Search bar + Add Button */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Search bar */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search Customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>

              {/* Add button */}
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                        value={formData.vin}
                        onChange={handleChange}
                        placeholder="VN-BIKE-0003"
                      />
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1 grid gap-2">
                        <Label htmlFor="type">Vehicle Type</Label>
                        <Select
                          value={formData.vehicleType}
                          onValueChange={(value) =>
                            setFormData({ ...formData, vehicleType: value })
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
                          value={formData.model}
                          onValueChange={(value) =>
                            setFormData({ ...formData, model: value })
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
                        value={formData.plate}
                        onChange={handleChange}
                        placeholder="59X1-11111"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="customerName">Customer Name</Label>
                      <Input
                        id="customerName"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleChange}
                        placeholder="Le Van K"
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
                    <Button onClick={handleAdd}>Add Vehicle</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        {/* Vehicle Table */}
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>VIN</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Plate</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVINs.map((v) => (
                  <TableRow key={v.vin}>
                    <TableCell>
                      <p className="font-medium text-sm">{v.vin}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-sm">{v.vehicleType}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-sm">{v.model}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-sm">{v.plate}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-sm">{v.customerName}</p>
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(v)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(v.vin)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingVehicle}
        onOpenChange={(open) => !open && setEditingVehicle(null)}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
            <DialogDescription>Update vehicle information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-plate">Vehicle Plate</Label>
              <Input
                id="plate"
                name="plate"
                value={formData.plate}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-customerName">Customer Name</Label>
              <Input
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingVehicle(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditVehicle}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
