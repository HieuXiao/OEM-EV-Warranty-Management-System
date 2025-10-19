import { Button } from "@/components/ui/button";
import { Search, Plus, MoreVertical, Edit, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mock_warranty_data } from "@/lib/Mock-data";
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

export default function WarrantyTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [warranties, setWarranties] = useState(mock_warranty_data);
  const [editingWarranty, setEditingWarranty] = useState(null);
//   const [editingCustomer, setEditingCustomer] = useState(null);
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    id: "",
    vehiclePlate: "",
    name: "",
    phone: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const filteredWarranties = warranties.filter(
    (w) =>
      w.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    const newWarranty = {
      id: formData.id,
      scstaff: formData.scs,
      phone: formData.phone,
      name: formData.name,
      vehiclePlate: formData.plate,
      vehicleModel: formData.model,
      technician: formData.Technician,
      previousCount: FormData.count,
      description: FormData.desciption
    };
    setWarranties([...warranties, newWarranty]);
    setIsAddDialogOpen(false);
    resetForm();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Title */}
            <div>
              <CardTitle>List Warranty</CardTitle>
            </div>

            {/* Search bar + Add Button */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Search bar */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search Warratity..."
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
                    Add Warranty
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add New Warranty</DialogTitle>
                    <DialogDescription>Create a new Warranty</DialogDescription>
                  </DialogHeader>

                  {/* Dialog Add Customer */}
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="id">ID</Label>
                      <Input
                        id="id"
                        name="id"
                        value={formData.id}
                        onChange={handleChange}
                        placeholder=""
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="name">Customer Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Nguyen Van A"
                      />
                    </div>
                    {/* <div className="grid gap-2">
                      <Label htmlFor="Email">Customer Email</Label>
                      <Input
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="abc@gmail.com"
                      />
                    </div> */}
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Customer Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="0987654321"
                      />
                    </div>
                    {/* <div className="grid gap-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder=""
                      />
                    </div> */}
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAdd}>Add Warranty</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        {/* Customer Table */}
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Vehicle Plate</TableHead>
                  <TableHead>Vehicel Model</TableHead>
                  <TableHead>Assign to Technician</TableHead>
                  <TableHead>Previous Warranty Count</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              {/* Customer data */}
              <TableBody>
                {filteredCustomers.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <p className="font-medium text-sm">{c.id}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-sm">{c.name}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-sm">{c.email}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-sm">{c.phone}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-sm">{c.address}</p>
                    </TableCell>

                    <TableCell className="text-middle">
                      <div className="flex sm:flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/scstaff/profiles/${c.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                          Detail
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
