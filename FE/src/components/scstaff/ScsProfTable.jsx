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

const CUSTOMERS_URL = "/api/customers";
const VEHICLE_CREATE_URL = "/api/vehicles";
const ACCOUNT_URL = "/api/accounts/current";

export default function CustomersTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSC, setCurrentSC] = useState(null);
  const [formErrors, setFormErrors] = useState({});
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

  useEffect(() => {
    async function fetchCurrentSC() {
      try {
        const response = await axiosPrivate.get(ACCOUNT_URL);
        setCurrentSC(response.data.serviceCenter.centerId);
      } catch (error) {
        console.error("API Error: " + error.message);
      }
    }
    fetchCurrentSC();
  }, []);

  // Tính toán dữ liệu hiển thị theo trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCustomers.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages =
    Math.ceil(filteredCustomers.length / itemsPerPage) === 0
      ? 1
      : Math.ceil(filteredCustomers.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setFormErrors({});

    // --- 1. BẮT LỖI INPUT (FRONT-END) ---
    const errors = {};

    // Kiểm tra Customer
    if (!formData.customerName) errors.customerName = "Name is required.";
    if (!formData.customerAddress)
      errors.customerAddress = "Address is required.";
    if (!formData.customerEmail) {
      errors.customerEmail = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      errors.customerEmail = "Email is invalid.";
    }
    if (!formData.customerPhone) {
      errors.customerPhone = "Phone is required.";
    } else if (!/^\d{10}$/.test(formData.customerPhone)) {
      // Giả sử SĐT 10 số
      errors.customerPhone = "Phone must be 10 digits.";
    }

    // Kiểm tra Vehicle
    if (!formVinData.vin) {
      errors.vin = "VIN is required.";
    } else if (formVinData.vin.length !== 17) {
      errors.vin = "VIN must be 17 characters.";
    }
    if (!formVinData.plate) errors.plate = "Vehicle plate is required.";
    if (!formVinData.type) errors.type = "Vehicle type is required.";
    if (!formVinData.color) errors.color = "Color is required.";
    if (!formVinData.model) errors.model = "Model is required.";

    // Nếu có bất kỳ lỗi nào, cập nhật state và dừng lại
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const newCustomer = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        customerAddress: formData.customerAddress,
      };

      let createdCustomer = null;

      const customerResponse = await axiosPrivate.post(
        CUSTOMERS_URL,
        newCustomer,
        { headers: { "Content-Type": "application/json" } }
      );

      createdCustomer = customerResponse.data;

      const customerSCResponse = await axiosPrivate.post(
        `${CUSTOMERS_URL}/${createdCustomer.customerId}/assign-service-center/${currentSC}`
      );

      try {
        const newVehicle = {
          vin: formVinData.vin,
          plate: formVinData.plate,
          type: formVinData.type,
          color: formVinData.color,
          model: formVinData.model,
          customerId: createdCustomer.customerId,
        };

        // --- BƯỚC 2: TẠO VEHICLE ---
        await axiosPrivate.post(VEHICLE_CREATE_URL, newVehicle, {
          headers: { "Content-Type": "application/json" },
        });

        // === THÀNH CÔNG (Cả 2 đều OK) ===
        setCustomers([...customers, createdCustomer]);
        resetForm();
        setIsAddDialogOpen(false);
        navigate(`/scstaff/profiles/${createdCustomer.customerId}`);
      } catch (vehicleError) {
        console.error("Vehicle Creation Error:", vehicleError);
        const fieldErrors = {}; // Lỗi cụ thể cho VIN/Plate
        let apiErrorMessage = "Failed to create vehicle."; // Lỗi chung

        // --- BƯỚC 3: ROLLBACK (Xóa Customer đã tạo) ---
        let rollbackMessage = "Rolling back customer creation...";

        try {
          await axiosPrivate.delete(
            CUSTOMERS_URL + `/${createdCustomer.customerId}`
          );
          rollbackMessage = "Customer creation was successfully rolled back.";
        } catch (deleteError) {
          console.error("Rollback Error:", deleteError);
          setFormErrors({
            api: "Critical error: Failed to add vehicle, AND failed to roll back customer. Please contact support.",
          });
          return; // Dừng ngay lập tức
        }
        // --- Phân tích lỗi Vehicle SAU KHI rollback ---
        if (vehicleError.response) {
          const { status, data } = vehicleError.response;
          const message = data || ""; // Lấy message từ backend

          if (status === 409) {
            // Conflict
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

        // Gộp lỗi (lỗi field + lỗi api) và hiển thị
        setFormErrors({
          ...fieldErrors,
          api: `${apiErrorMessage} ${rollbackMessage}`.trim(),
        });
      }
    } catch (customerError) {
      // === LỖI BƯỚC 1 (Tạo Customer thất bại) ===
      console.error("Customer Creation Error:", customerError);
      const fieldErrors = {}; // Lỗi cụ thể cho Phone/Email
      let apiErrorMessage = "Failed to add customer."; // Lỗi chung

      if (customerError.response) {
        const { status, data } = customerError.response;
        const message = data?.message || ""; // Lấy message từ backend

        if (status === 409) {
          // Conflict
          if (message.toLowerCase().includes("phone")) {
            fieldErrors.customerPhone =
              "This Phone number is already registered.";
          } else if (message.toLowerCase().includes("email")) {
            fieldErrors.customerEmail = "This Email is already registered.";
          } else {
            apiErrorMessage =
              "Customer with this Email or Phone already exists.";
          }
        } else if (status === 400) {
          apiErrorMessage = message || "Invalid data. Please check all fields.";
        } else {
          apiErrorMessage = message || apiErrorMessage;
        }
      } else if (customerError.request) {
        apiErrorMessage = "Network error. Please check your connection.";
      }

      // Gộp lỗi (lỗi field + lỗi api nếu có) và hiển thị
      setFormErrors({
        ...fieldErrors,
        // Chỉ hiển thị lỗi api nếu không có lỗi field cụ thể
        ...(Object.keys(fieldErrors).length === 0 && { api: apiErrorMessage }),
      });
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
      <Card className="pt-4 px-2 sm:px-4 pb-4">
        <CardHeader className="px-2 sm:px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Title */}
            <div>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>
                Customer detatails and contact information
              </CardDescription>
            </div>

            {/* Search box + Add Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
              {/* Search box */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search Customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-full"
                />
              </div>

              {/* Add button */}
              <Dialog
                open={isAddDialogOpen}
                onOpenChange={(isOpen) => {
                  setIsAddDialogOpen(isOpen);
                  if (!isOpen) {
                    setFormErrors({}); // Xóa lỗi khi đóng
                    resetForm(); // Reset form khi đóng
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button className="gap-2 w-full sm:w-auto">
                    <Plus className="h-4 w-4" />
                    Add Customer
                  </Button>
                </DialogTrigger>

                {/* Mobile-friendly Dialog */}
                <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
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
                      {/* HIỂN THỊ LỖI */}
                      {formErrors.customerName && (
                        <p className="text-sm text-red-500">
                          {formErrors.customerName}
                        </p>
                      )}
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
                      {/* HIỂN THỊ LỖI */}
                      {formErrors.customerEmail && (
                        <p className="text-sm text-red-500">
                          {formErrors.customerEmail}
                        </p>
                      )}
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
                      {/* HIỂN THỊ LỖI */}
                      {formErrors.customerPhone && (
                        <p className="text-sm text-red-500">
                          {formErrors.customerPhone}
                        </p>
                      )}
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
                      {/* HIỂN THỊ LỖI */}
                      {formErrors.customerAddress && (
                        <p className="text-sm text-red-500">
                          {formErrors.customerAddress}
                        </p>
                      )}
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
                      {/* HIỂN THỊ LỖI */}
                      {formErrors.vin && (
                        <p className="text-sm text-red-500">{formErrors.vin}</p>
                      )}
                    </div>

                    {/* Chuyển flex thành grid cho mobile */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="grid gap-2">
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
                            <SelectItem key="bike" value="Electric Motorbike">
                              Electric Motorbike
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {/* HIỂN THỊ LỖI */}
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
                        {/* HIỂN THỊ LỖI */}
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
                        {/* HIỂN THỊ LỖI */}
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
                      {/* HIỂN THỊ LỖI */}
                      {formErrors.plate && (
                        <p className="text-sm text-red-500">
                          {formErrors.plate}
                        </p>
                      )}
                    </div>
                  </div>
                  {formErrors.api && (
                    <p className="text-sm text-red-500 text-center">
                      {formErrors.api}
                    </p>
                  )}
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
        <CardContent className="pt-0 px-0 sm:px-4">
          {/* Thêm overflow-x-auto để cuộn ngang bảng trên mobile */}
          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">No.</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-center w-[100px]">
                    Actions
                  </TableHead>
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

                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/scstaff/profiles/${c.customerId}`)
                          }
                        >
                          <Eye className="h-4 w-4 mr-2" />
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
          <div className="flex items-center justify-center gap-2 mt-4">
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
