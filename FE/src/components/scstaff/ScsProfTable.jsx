import { Button } from "@/components/ui/button";
import { Search, Plus, ChevronRight, ChevronLeft, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { vehicleModels } from "@/lib/Mock-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
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
import axiosPrivate from "@/api/axios";

const CUSTOMERS_URL = "/api/customer/";
const CUSTOMER_CREATE_URL = "/api/customer/create";
const VEHICLE_CREATE_URL = "/api/vehicle/create";

export default function CustomersTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [errro, setError] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
  });

  const [formVinData, setFormVinData] = useState({
    vin: "",
    plate: "",
    type: "",
    color: "",
    model: "",
    customerPhone: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customerPhone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Tính toán dữ liệu hiển thị theo trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCustomers.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const newCustomer = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        customerAddress: formData.customerAddress,
      };

      const newVehicle = {
        vin: formVinData.vin,
        plate: formVinData.plate,
        type: formVinData.type,
        color: formVinData.color,
        model: formVinData.model,
        customerPhone: formData.customerPhone,
      };

      axiosPrivate
        .post(CUSTOMER_CREATE_URL, newCustomer, {
          headers: { "Content-Type": "application/json" },
        })
        .then((res) => {
          const createdCustomer = res.data;
          setCustomers([...customers, createdCustomer]);
          return axiosPrivate
            .post(VEHICLE_CREATE_URL, newVehicle, {
              headers: { "Content-Type": "application/json" },
            })
            .then(() => createdCustomer);
        })
        .then((createCustomer) => {
          resetForm();
          setIsAddDialogOpen(false);
          navigate(`/scstaff/profiles/${createCustomer.customerId}`);
        })
        .catch((error) => console.error("API Error:", error.message));
    } catch (error) {
      if (error.response?.status === 409) {
        setError("Customer already exists (duplicate email or phone)");
      } else {
        console.error("API Error:", error);
        setError("Failed to add customer. Please try again.");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerAddress: "",
    });

    setFormVinData({
      vin: "",
      plate: "",
      type: "",
      color: "",
      model: "",
      customerPhone: "",
    });
  };

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const response = await axiosPrivate.get(CUSTOMERS_URL);
        setCustomers(response.data);
      } catch (err) {
        console.error("API Error: " + err.message);
      }
    }
    fetchCustomers();
  }, []);

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

                <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Customer</DialogTitle>
                    <DialogDescription>Create a new customer</DialogDescription>
                  </DialogHeader>

                  {/* Dialog Add Customer */}
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Customer Name</Label>
                      <Input
                        id="name"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleChange}
                        placeholder="Nguyen Van A"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="Email">Customer Email</Label>
                      <Input
                        id="email"
                        name="customerEmail"
                        value={formData.customerEmail}
                        onChange={handleChange}
                        placeholder="abc@gmail.com"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Customer Phone</Label>
                      <Input
                        id="phone"
                        name="customerPhone"
                        value={formData.customerPhone}
                        onChange={handleChange}
                        placeholder="0987654321"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        name="customerAddress"
                        value={formData.customerAddress}
                        onChange={handleChange}
                        placeholder=""
                      />
                    </div>
                    <Separator />
                  </div>

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
                  <TableHead>No.</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              {/* Customer data */}
              <TableBody>
                {currentItems.map((c, i) => (
                  <TableRow key={c.customerId}>
                    <TableCell>
                      <p className="font-medium text-sm">{i + 1}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-sm">{c.customerName}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-sm">{c.customerEmail}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-sm">{c.customerPhone}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-sm">{c.customerAddress}</p>
                    </TableCell>

                    <TableCell className="text-middle">
                      <div className="flex sm:flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/scstaff/profiles/${c.customerId}`)
                          }
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
          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-5" />
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
