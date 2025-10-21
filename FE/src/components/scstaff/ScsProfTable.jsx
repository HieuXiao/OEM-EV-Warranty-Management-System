import { Button } from "@/components/ui/button";
import { Search, Plus, MoreVertical, Edit, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockCustomers } from "@/lib/Mock-data";
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

export default function CustomersTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [customers, setCustomers] = useState(mockCustomers);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    const newCustomer = {
      id: formData.id,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
    };
    setCustomers([...customers, newCustomer]);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditCustomer = () => {
    if (!editingCustomer) return;
    setCustomers(
      customers.map((c) =>
        c.id === editingCustomer.id
          ? {
              ...c,
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              address: formData.address,
            }
          : c
      )
    );
    setEditingCustomer(null);
    resetForm();
  };

  const openEditCustomerDialog = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
    });
  };

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      email: "",
      phone: "",
      address: "",
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Title */}
            <div>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>
                Customer detatails and contact information
              </CardDescription>
            </div>

            {/* Search box + Add Button */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Search box */}
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
                    Add Customer
                  </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add New Customer</DialogTitle>
                    <DialogDescription>Create a new customer</DialogDescription>
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
                    <div className="grid gap-2">
                      <Label htmlFor="Email">Customer Email</Label>
                      <Input
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="abc@gmail.com"
                      />
                    </div>
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
                    <div className="grid gap-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder=""
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
                    <Button onClick={handleAdd}>Add Customer</Button>
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
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
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
