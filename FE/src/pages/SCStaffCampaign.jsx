// IMPORT FROM COMPONENT
import Header from "@/components/Header";
import SCStaffSibebar from "@/components/scstaff/SCStaffSidebar";
// import ScStaffOverview from "@/components/scstaff/ScStaffOverview";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

// IMPORT FROM LUCIDE-REACT
import { Search, Plus, MoreVertical, Edit, Trash2 } from "lucide-react";

// IMPORT FROM REACT
import { useState } from "react";

// IMPORT FROM LIB
import { mockCustomers } from "@/lib/Mock-data";

export default function SCStaffProfile() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [customers, setCustomers] = useState(mockCustomers);

  // Form state
  const [formDataCustomer, setFormDataCustomer] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const handleChangeCustomer = (e) => {
    const { name, value } = e.target;
    setFormDataCustomer({ ...formDataCustomer, [name]: value });
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCustomer = () => {
    const newCustomer = {
      id: formDataCustomer.id,
      name: formDataCustomer.name,
      email: formDataCustomer.email,
      phone: formDataCustomer.phone,
      address: formDataCustomer.address,
    };
    setCustomers([...customers, newCustomer]);
    setIsAddDialogOpen(false);
    resetFormCustomer();
  };

  const resetFormCustomer = () => {
    setFormDataCustomer({
      id: "",
      name: "",
      email: "",
      phone: "",
      address: "",
    });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar */}
      <SCStaffSibebar name={"Nam"} role={"SC Staff"} />
      {/* Main Content */}
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

            <Tabs defaultValue="overview" className="space-y-6">
              {/* === TabsTrigger === */}
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="list_campaign">List Campaign</TabsTrigger>
                <TabsTrigger value="calendar">Calender</TabsTrigger>
                <TabsTrigger value="campaign_status">
                  Campaign Status
                </TabsTrigger>
              </TabsList>

              {/* Customer */}
              <TabsContent value="customers" className="space-y-4">
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
                        <Dialog
                          open={isAddDialogOpen}
                          onOpenChange={setIsAddDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button className="gap-2">
                              <Plus className="h-4 w-4" />
                              Add Customer
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                              <DialogTitle>Add New Customer</DialogTitle>
                              <DialogDescription>
                                Create a new customer
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="id">ID</Label>
                                <Input
                                  id="id"
                                  name="id"
                                  value={formDataCustomer.id}
                                  onChange={handleChangeCustomer}
                                  placeholder=""
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="name">Customer Name</Label>
                                <Input
                                  id="name"
                                  name="name"
                                  value={formDataCustomer.name}
                                  onChange={handleChangeCustomer}
                                  placeholder="Nguyen Van A"
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="Email">Customer Email</Label>
                                <Input
                                  id="email"
                                  name="email"
                                  value={formDataCustomer.email}
                                  onChange={handleChangeCustomer}
                                  placeholder="abc@gmail.com"
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="phone">Customer Phone</Label>
                                <Input
                                  id="phone"
                                  name="phone"
                                  value={formDataCustomer.phone}
                                  onChange={handleChangeCustomer}
                                  placeholder="0987654321"
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="address">Address</Label>
                                <Input
                                  id="address"
                                  name="address"
                                  value={formDataCustomer.address}
                                  onChange={handleChangeCustomer}
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
                              <Button onClick={handleAddCustomer}>
                                Add Customer
                              </Button>
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
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
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
                                <p className="font-medium text-sm">
                                  {c.address}
                                </p>
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">
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
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
