import { useState } from "react";
import { Search, Filter, Plus } from "lucide-react";
import EVMStaffSideBar from "../components/evmstaff/EVMStaffSideBar";
import Header from "../components/Header";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import EVMStaffFormNewPart from "../components/evmstaff/EVMStaffFormNewPart";
import { mockPartsInventory } from "../lib/Mock-data";

export default function EVMStaffProductPart() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBranch, setFilterBranch] = useState("all");
  const [showNewPartDialog, setShowNewPartDialog] = useState(false);
  const [parts, setParts] = useState(mockPartsInventory);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleOpenMenu = () => setIsMobileMenuOpen(true);
  const handleCloseMenu = () => setIsMobileMenuOpen(false);

  const filteredParts = parts.filter((part) => {
    const matchesSearch =
      part.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.serial.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch =
      filterBranch === "all" || part.branch === filterBranch;
    return matchesSearch && matchesBranch;
  });

  // Tính toán dữ liệu hiển thị theo trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredParts.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredParts.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleSaveNewPart = (newPart) => {
    setParts([
      ...parts,
      {
        id: String(parts.length + 1),
        ...newPart,
        stock: 0,
        remain: 0,
        location: "Pending Assignment",
        vehicleModels: newPart.vehicleType.split(",").map((v) => v.trim()),
      },
    ]);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="flex h-screen bg-background">
      <EVMStaffSideBar
        isMobileOpen={isMobileMenuOpen}
        onClose={handleCloseMenu}
      />
      <div className="flex-1 flex flex-col ml-64">
        <Header onMenuClick={handleOpenMenu} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Products & Parts</h1>
            </div>

            {/* Search and Filter */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-md"
                />
              </div>
              <Button onClick={() => setShowNewPartDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Parts
              </Button>
            </div>

            {/* Parts Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serial</TableHead>
                    <TableHead>Part Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((part) => (
                    <TableRow
                      key={part.id}
                      onClick={() => navigate(`${part.id}`)}
                      className="group cursor-pointer hover:bg-blue-50 active:bg-blue-100"
                    >
                      <TableCell className="font-medium bg-transparent group-hover:bg-transparent group-active:bg-transparent">
                        {part.serial}
                      </TableCell>
                      <TableCell>{part.partName}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {part.description}
                      </TableCell>
                      <TableCell>{formatCurrency(part.price)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {filteredParts.length > itemsPerPage && (
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
            )}
          </div>
        </main>
      </div>

      <EVMStaffFormNewPart
        open={showNewPartDialog}
        onOpenChange={setShowNewPartDialog}
        onSave={handleSaveNewPart}
      />
    </div>
  );
}
