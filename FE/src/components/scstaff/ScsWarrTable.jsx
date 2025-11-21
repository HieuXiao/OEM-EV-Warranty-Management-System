import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mock_warranty_data, vehicleModels, mockUsers } from "@/lib/Mock-data";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function WarrantiesTable({ onSelectWarranty }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [warranties, setWarranties] = useState(mock_warranty_data);
  const [newClaimTechnician, setNewClaimTechnician] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const scTechnicians = mockUsers.filter(
    (user) => user.role === "sc_technician"
  );

  const [currentUser] = useState({
    name: "Tran Thi B",
    role: "SC Staff",
    serviceCenter: "SC Hanoi Central",
  });

  const [formData, setFormData] = useState({
    customer: "",
    phone: "",
    vehiclePlate: "",
    vehicleModel: "",
    previousCount: "",
    description: "",
  });

  const resetForm = () => {
    setFormData({
      customer: "",
      phone: "",
      vehiclePlate: "",
      vehicleModel: "",
      previousCount: "",
      description: "",
    });
    setNewClaimTechnician("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitNewClaim = (e) => {
    e.preventDefault();

    const newWarranty = {
      warrantyId: `WR-${warranties.length + 1}`,
      customer: formData.customer,
      phone: formData.phone,
      vehiclePlate: formData.vehiclePlate,
      vehicleModel: formData.vehicleModel,
      description: formData.description,
      technician: newClaimTechnician,
      status: "Requested",
      createdBy: currentUser.name,
    };

    setWarranties([...warranties, newWarranty]);
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const filteredWarranties = warranties.filter((w) => {
    const q = searchQuery.toLowerCase();
    return (
      w.vehiclePlate?.toLowerCase().includes(q) ||
      w.customer?.toLowerCase().includes(q) ||
      w.phone?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredWarranties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedWarranties = filteredWarranties.slice(startIndex, endIndex);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleRowClick = (warranty) => {
    onSelectWarranty(warranty);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle>Warranty Requests</CardTitle>
            <CardDescription>Manage all warranty cases submitted</CardDescription>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search warranty..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-8"
              />
            </div>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-black hover:bg-gray-800 text-white">
                  <Plus className="h-4 w-4 mr-1" /> Create
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl">Create New Warranty Claim</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmitNewClaim} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <label className="text-sm font-medium">Created By (SC Staff)</label>
                      <Input value={currentUser.name} disabled className="bg-muted" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Customer Phone</label>
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="e.g., 0901234567"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Customer Name</label>
                      <Input
                        name="customer"
                        value={formData.customer}
                        onChange={handleChange}
                        placeholder="Enter customer name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Vehicle Plate</label>
                      <Input
                        name="vehiclePlate"
                        value={formData.vehiclePlate}
                        onChange={handleChange}
                        placeholder="e.g., 30A-12345"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Vehicle Model</label>
                      <Select
                        value={formData.vehicleModel}
                        onValueChange={(val) =>
                          setFormData((p) => ({ ...p, vehicleModel: val }))
                        }
                        required
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select vehicle model" />
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

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Assign to Technician</label>
                      <Select
                        value={newClaimTechnician}
                        onValueChange={setNewClaimTechnician}
                        required
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a technician" />
                        </SelectTrigger>
                        <SelectContent>
                          {scTechnicians.map((tech) => (
                            <SelectItem key={tech.id} value={tech.name}>
                              {tech.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Previous Warranty Count</label>
                      <Input
                        name="previousCount"
                        value={formData.previousCount}
                        onChange={handleChange}
                        placeholder="e.g., 01;02;10,.."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Issue Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                      placeholder="Describe the issue in detail..."
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-black hover:bg-gray-800 text-white">
                      Create Claim
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Vehicle Plate</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredWarranties.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                    No warranty claims found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedWarranties.map((w) => (
                  <TableRow
                    key={w.warrantyId}
                    className="hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => handleRowClick(w)}
                  >
                    <TableCell>{w.warrantyId}</TableCell>
                    <TableCell>{w.customer}</TableCell>
                    <TableCell>{w.phone}</TableCell>
                    <TableCell>{w.vehiclePlate}</TableCell>
                    <TableCell>{w.description}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {w.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {filteredWarranties.length > itemsPerPage && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <span className="text-sm font-medium text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
