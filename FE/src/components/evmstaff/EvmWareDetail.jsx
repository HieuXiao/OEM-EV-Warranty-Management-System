import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";
import EvmWareDetailReceive from "./EvmWareDetaReceive";
import EvmWareDetaRegister from "./EvmWareDetaRegister";

const ROWS_PER_PAGE = 10;
const LOW_STOCK_THRESHOLD = 50;

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export default function EvmWareDetail({
  warehouse,
  partCatalog,
  onBack,
  onReceiveSuccess,
}) {
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

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showMiniReceive, setShowMiniReceive] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);
  const [showRegisterPart, setShowRegisterPart] = useState(false);

  const processedParts = useMemo(() => {
    return (warehouse?.parts || []).map((part) => {
      const price = parseFloat(part.price) || 0;
      const quantity = part.quantity || 0;
      const totalValue = quantity * price;

      return {
        ...part,
        price,
        quantity,
        totalValue,
        isLow: quantity < LOW_STOCK_THRESHOLD,
      };
    });
  }, [warehouse]);

  const filteredParts = useMemo(() => {
    return processedParts.filter(
      (part) =>
        part.namePart?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.partNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [processedParts, searchTerm]);

  const totalPages = Math.ceil(filteredParts.length / ROWS_PER_PAGE);
  const safeCurrentPage = Math.min(currentPage, totalPages || 1);
  const currentParts = filteredParts.slice(
    (safeCurrentPage - 1) * ROWS_PER_PAGE,
    safeCurrentPage * ROWS_PER_PAGE
  );

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };
  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleOpenMiniReceive = (part) => {
    setSelectedPart(part);
    setShowMiniReceive(true);
  };

  const handleMiniReceiveSuccess = (whId = warehouse.whId) => {
    setShowMiniReceive(false);
    onReceiveSuccess(whId);
  };

  const handleRegisterSuccess = (whId = warehouse.whId) => {
    setShowRegisterPart(false);
    onReceiveSuccess(whId);
  };

  return (
    <div className="space-y-6">
      {/* Header Responsive */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            {warehouse.name} Details
          </h2>
          <p className="text-muted-foreground text-sm sm:text-lg">
            {warehouse.location}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={() => setShowRegisterPart(true)}
            className="flex items-center bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
          >
            <Plus className="h-4 w-4 mr-2" />
            Register New Part
          </Button>
        </div>
      </div>

      {/* Inventory Card */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
          <CardTitle className="text-lg sm:text-xl font-medium">
            Inventory - {filteredParts.length} Unique Parts
          </CardTitle>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search parts..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
        </CardHeader>

        <CardContent className="px-0 sm:px-6">
          {/* Table Wrapper for Horizontal Scroll */}
          <div className="border rounded-lg overflow-x-auto mx-4 sm:mx-0">
            <Table className="min-w-[800px]">
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Part Number</TableHead>
                  <TableHead>Name Part</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Total Value</TableHead>
                  <TableHead className="text-center">Is Low</TableHead>
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
                      <TableCell className="text-right">
                        {part.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(part.price)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(part.totalValue)}
                      </TableCell>
                      <TableCell className="text-center">
                        {part.isLow && (
                          <AlertTriangle className="h-5 w-5 text-red-500 mx-auto" />
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="border"
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={safeCurrentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
              </Button>
              <span className="text-sm text-muted-foreground">
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

      {/* Mini-Modal Receive */}
      <Dialog open={showMiniReceive} onOpenChange={setShowMiniReceive}>
        <DialogContent className="w-[95vw] sm:max-w-md p-6 rounded-xl">
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

      {/* Register Part Modal */}
      <Dialog open={showRegisterPart} onOpenChange={setShowRegisterPart}>
        <DialogContent className="w-[95vw] sm:max-w-xl p-6 rounded-xl max-h-[90vh] overflow-y-auto">
          <EvmWareDetaRegister
            warehouse={warehouse}
            partCatalog={partCatalog}
            onSuccess={handleRegisterSuccess}
            onClose={() => setShowRegisterPart(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
