import { useState } from "react";
import { Search, Filter, Plus, AlertTriangle } from "lucide-react";
import EVMStaffSideBar from "../components/evmstaff/EVMStaffSideBar";
import Header from "../components/Header";
import { mockWarehousesInventory } from "../lib/Mock-data";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";

export default function EVMStaffSupplyChain() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const user = {
    name: "Mage Team",
    email: "evmstaff@evwarranty.com",
    role: "EVM Staff",
    image: "/diverse-professional-team.png",
  };

  const filteredWarehouseInventory = mockWarehousesInventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Tính toán dữ liệu hiển thị theo trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredWarehouseInventory.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(
    filteredWarehouseInventory.length / itemsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const getAlertBadge = (alert) => {
    const variants = {
      normal: "bg-green-500",
      low: "bg-yellow-500",
      critical: "bg-red-500",
    };
    return (
      <Badge className={variants[alert]}>
        {alert === "critical" && <AlertTriangle className="h-3 w-3 mr-1" />}
        {alert.toUpperCase()}
      </Badge>
    );
  };

  // Check Last Update
  const getLatestUpdate = (warehouse) =>
    warehouse.parts.reduce(
      (latest, part) =>
        new Date(part.lastUpdate) > latest ? new Date(part.lastUpdate) : latest,
      new Date(0)
    );

  // Set format
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Sum value inventory
  const calculateWarehouseValue = (parts) =>
    parts.reduce((sum, part) => sum + part.total * part.unitPrice, 0);

  // Get low stock
  const getLowStockAlert = (warehouse) => {
    const lowStock = warehouse.parts.filter((part) => part.total <= 10);
    return lowStock.length
      ? lowStock.map((p) => p.partName).join(", ")
      : "None";
  };

  return (
    <div className="flex h-screen bg-background">
      <EVMStaffSideBar image={user.image} name={user.name} role={user.role} />
      <div className="flex-1 flex flex-col ml-64">
        <Header name={user.name} email={user.email} image={user.image} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Warehouse</h1>
            </div>

            {/* Search and Filter */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create
              </Button>
            </div>

            {/* Supply Chain Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No.</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Low Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell>
                        {getLatestUpdate(item).toLocaleString("vi-VN")}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(calculateWarehouseValue(item.parts))}
                      </TableCell>
                      <TableCell
                        className={
                          getLowStockAlert(item) !== "None"
                            ? "text-red-600 font-semibold"
                            : "text-gray-800"
                        }
                      >
                        {getLowStockAlert(item)}
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
                Previous
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
                Next
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
