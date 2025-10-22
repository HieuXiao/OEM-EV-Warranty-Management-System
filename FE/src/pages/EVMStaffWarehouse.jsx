import { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import EVMStaffSideBar from "../components/evmstaff/EVMStaffSideBar";
import Header from "../components/Header";
import { mockWarehousesInventory } from "../lib/Mock-data";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import EVMStaffFormWarehouse from "../components/evmstaff/EVMStaffFormWarehouse";
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
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [showCreate, setShowCreate] = useState(false);

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
              <Button onClick={() => setShowCreate(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create
              </Button>
              <EVMStaffFormWarehouse
                open={showCreate}
                onOpenChange={setShowCreate}
                onCreate={(payload) => {
                  console.log("Warehouse create payload:", payload);
                  setShowCreate(false);
                }}
              />
            </div>

            {/* Warehouse Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No.</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead className="text-center">Location</TableHead>
                    <TableHead className="text-center">Date</TableHead>
                    <TableHead className="text-center">Price</TableHead>
                    <TableHead>Low Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((item, i) => (
                    <TableRow key={i} onClick={() => navigate(`${item.id}`)} className="group cursor-pointer hover:bg-blue-50 active:bg-blue-100">
                      <TableCell className="bg-transparent group-hover:bg-transparent group-active:bg-transparent">{i + 1}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="text-center">
                        {item.location}
                      </TableCell>
                      <TableCell className="text-center">
                        {getLatestUpdate(item).toLocaleString("vi-VN")}
                      </TableCell>
                      <TableCell className="text-center">
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
          </div>
        </main>
      </div>
    </div>
  );
}
