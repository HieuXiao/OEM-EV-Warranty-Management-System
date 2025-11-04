// FE/src/components/evmstaff/EvmWareDetail.jsx

// === IMPORTS ===
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
}
 from "@/components/ui/table";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowLeft,
} from "lucide-react";
import EvmWareDetailReceive from "./EvmWareDetaReceive";

// === CONSTANTS ===
const ROWS_PER_PAGE = 10;

// === HELPER FUNCTIONS ===
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

/**
 * EvmWareDetail Component
 * Renders the dedicated page for warehouse details and inventory.
 *
 * @param {Object} warehouse - The selected warehouse object.
 * @param {Object[]} partCatalog - The complete list of all parts.
 * @param {function} onBack - Function to return to the main warehouse list page.
 * @param {function} onReceiveSuccess - Function to call on successful stock update (refreshes data on parent).
 */
export default function EvmWareDetail({
  warehouse,
  partCatalog,
  onBack,
  onReceiveSuccess,
}) {
  // Kiểm tra xem warehouse có tồn tại không
  if (!warehouse) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>No warehouse selected or data is loading.</p>
        <Button onClick={onBack} className="mt-4" variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Button>
      </div>
    );
  }

  // === MAIN TABLE STATE ===
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // === MINI-MODAL STATE ===
  const [showMiniReceive, setShowMiniReceive] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);

  // === FILTERING & PAGINATION LOGIC ===
  const filteredParts = useMemo(() => {
    return (warehouse?.parts || []).filter(
      (part) =>
        part.namePart?.toLowerCase().includes(searchTerm.toLowerCase()) || // Thêm check null/undefined
        part.partNumber?.toLowerCase().includes(searchTerm.toLowerCase()) // Thêm check null/undefined
    );
  }, [warehouse, searchTerm]);

  const totalPages = Math.ceil(filteredParts.length / ROWS_PER_PAGE);
  const safeCurrentPage = Math.min(currentPage, totalPages || 1);
  const currentParts = filteredParts.slice(
    (safeCurrentPage - 1) * ROWS_PER_PAGE,
    safeCurrentPage * ROWS_PER_PAGE
  );

  // === MAIN TABLE HANDLERS ===
  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };
  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  // === MINI-MODAL HANDLERS ===
  const handleOpenMiniReceive = (part) => {
    setSelectedPart(part);
    setShowMiniReceive(true);
  };

  // Khi receive thành công, đóng mini-modal và gọi refresh data (từ EVMStaffWarehouse)
  const handleMiniReceiveSuccess = () => {
    setShowMiniReceive(false);
    // Hàm này gọi onReceiveSuccess() từ component cha để trigger load lại data
    onReceiveSuccess();
  };

  // === RENDER ===
  return (
    <div className="space-y-6">
      {/* --- Header Section --- */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            {warehouse.name} Details
          </h2>
          <p className="text-muted-foreground text-lg">{warehouse.location}</p>
        </div>
        <Button onClick={onBack} variant="outline" className="flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Button>
      </div>

      {/* --- Inventory Card --- */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-medium">
            Inventory - {filteredParts.length} Unique Parts
          </CardTitle>
          {/* --- Search Bar --- */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search parts..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="pl-10"
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="border rounded-lg max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Part Number</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Total Value</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {currentParts.length > 0 ? (
                  currentParts.map((part) => (
                    <TableRow key={part.partNumber}>
                      <TableCell className="font-medium">
                        {part.partNumber}
                      </TableCell>
                      <TableCell>{part.namePart}</TableCell>
                      <TableCell
                        className={`text-right ${
                          part.quantity < 50 ? "text-red-600 font-medium" : ""
                        }`}
                      >
                        {part.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(part.price)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(part.quantity * part.price)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          onClick={() => handleOpenMiniReceive(part)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Receive
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center h-24 text-muted-foreground"
                    >
                      No parts found in this warehouse
                      {searchTerm && " matching your search"}.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* --- Pagination --- */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={safeCurrentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
              </Button>
              <span className="mx-2">
                Page {safeCurrentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={safeCurrentPage === totalPages}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* --- Mini-Modal for Receiving Specific Part --- */}
      <Dialog open={showMiniReceive} onOpenChange={setShowMiniReceive}>
        <DialogContent className="max-w-md">
          {selectedPart && (
            <EvmWareDetailReceive
              part={selectedPart}
              warehouse={warehouse}
              partCatalog={partCatalog}
              onSuccess={handleMiniReceiveSuccess}
              onClose={() => setShowMiniReceive(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}