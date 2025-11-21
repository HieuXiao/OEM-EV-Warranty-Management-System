import { Button } from "@/components/ui/button";
import { Search, Plus, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { mockAttachParts, vehicleModels } from "@/lib/Mock-data";
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

export default function PartAttachTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [parts, setParts] = useState(mockAttachParts);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const filteredAttachPart = parts.filter(
    (p) =>
      p.partName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.partSerial.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.vin.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Form state
  const [formData, setFormData] = useState({
    partSerial: "",
    partName: "",
    vin: "",
    model: "",
    price: null,
    year: null,
    condition: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAdd = () => {
    const newPart = {
      partSerial: formData.partSerial,
      partName: formData.partName,
      vin: formData.vin,
      model: formData.model,
      price: formData.price,
      year: formData.year,
      condition: formData.condition,
    };
    setParts([...parts, newPart]);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!editingVehicle) return;
    setParts(
      parts.map((p) =>
        p.partSerial === editingVehicle.partSerial
          ? {
              ...p,
              vin: formData.vin,
              model: formData.model,
              price: formData.price,
              year: formData.year,
            }
          : p
      )
    );
    setEditingVehicle(null);
    resetForm();
  };

  const openEditDialog = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      vin: vehicle.vin,
      model: vehicle.model,
      price: vehicle.price,
      year: vehicle.year,
    });
  };

  const handleDelete = (partSerial) => {
    setParts(parts.filter((p) => p.partSerial !== partSerial));
  };

  const resetForm = () => {
    setFormData({
      partSerial: "",
      partName: "",
      vin: "",
      model: "",
      price: null,
      year: null,
      condition: "",
    });
  };

  return (
    <>
      <Card className="pt-4 px-2 sm:px-4 pb-4">
        <CardHeader className="px-2 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Title */}
            <div>
              <CardTitle>Part Attach</CardTitle>
              <CardDescription>Part attach to vehicle</CardDescription>
            </div>

            {/* Search bar + Add Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              {/* Search bar */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-full"
                />
              </div>

              {/* Add button */}
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 w-full sm:w-auto">
                    <Plus className="h-4 w-4" />
                    Add Part
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                  <DialogHeader>
                    <DialogTitle>Attach Part to Vehicle</DialogTitle>
                    <DialogDescription>
                      Add new part information
                    </DialogDescription>
                  </DialogHeader>

                  {/* Dialog Attach Part */}
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="serial">Part Serial</Label>
                      <Input
                        id="serial"
                        name="partSerial"
                        value={formData.partSerial}
                        onChange={handleChange}
                        placeholder="INF-VF9-002"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="name">Part Name</Label>
                      <Input
                        id="name"
                        name="partName"
                        value={formData.partName}
                        onChange={handleChange}
                        placeholder="Battery Module 87.7kWh"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="vin">VIN</Label>
                      <Input
                        id="vin"
                        name="vin"
                        value={formData.vin}
                        onChange={handleChange}
                        placeholder="VN-CAR-0005"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        type="number"
                        name="price"
                        value={formData.price ?? ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            price: e.target.value
                              ? Number(e.target.value)
                              : null,
                          })
                        }
                        placeholder="5.000.000"
                      />
                    </div>

                    {/* Chuyển flex thành grid cho mobile */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
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
                      <div className="grid gap-2">
                        <Label htmlFor="year">Year</Label>
                        <Input
                          type="number"
                          placeholder="2025"
                          value={formData.year ?? ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              year: e.target.value
                                ? Number(e.target.value)
                                : null,
                            })
                          }
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
                      <Button onClick={handleAdd}>Add Part</Button>
                    </DialogFooter>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        {/* Part Attach Table */}
        <CardContent className="pt-0 px-0 sm:px-4">
          {/* Thêm cuộn ngang cho bảng */}
          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Part Serial</TableHead>
                  <TableHead>Part Name</TableHead>
                  <TableHead>VIN</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              {/* Part Attach data */}
              <TableBody>
                {filteredAttachPart.map((p) => (
                  <TableRow key={p.partSerial}>
                    <TableCell>
                      <p className="font-medium text-sm">{p.partSerial}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-sm">{p.partName}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-sm">{p.vin}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-sm">{p.model}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-sm">
                        {p.price.toLocaleString("vi-VN")} VND
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-sm">{p.year}</p>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(p)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(p.partSerial)}
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
        <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
            <DialogDescription>Update vehicle information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-vin">VIN</Label>
              <Input
                id="vin"
                name="vin"
                value={formData.vin}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-price">Price</Label>
              <Input
                id="price"
                type="number"
                name="price"
                value={formData.price ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </div>

            {/* Responsive Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-model">Model</Label>
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
              <div className="grid gap-2">
                <Label htmlFor="edit-year">Year</Label>
                <Input
                  type="number"
                  value={formData.year ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      year: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingVehicle(null)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
