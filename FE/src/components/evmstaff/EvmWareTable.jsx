// FE/src/components/evmstaff/EvmWareTable.jsx

import { useState, useMemo } from "react";
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
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

// === CONSTANTS ===
const ROWS_PER_PAGE = 5;
const MAX_LOW_STOCK_DISPLAY = 3;

export default function EvmWareTable({ warehouses, onRowClick, loading }) {
  // ================== STATE ==================
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = ROWS_PER_PAGE;

  // ----------------------------------------------------
  // 1. DATA PROCESSING (Filtering & Pagination)
  // ----------------------------------------------------

  /**
   * Pre-process warehouses data to include derived properties like numParts.
   */
  const warehousesForDisplay = useMemo(() => {
    return warehouses.map((warehouse) => ({
      ...warehouse,
      // Calculate number of distinct part models in the warehouse
      numParts: warehouse.parts?.length || 0,
    }));
  }, [warehouses]);

  /**
   * Filter the list of warehouses based on the search term.
   */
  const filteredWarehouses = useMemo(() => {
    return warehousesForDisplay.filter(
      (warehouse) =>
        warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        warehouse.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [warehousesForDisplay, searchTerm]);

  /**
   * Apply pagination to the filtered list.
   */
  const totalPages = Math.ceil(filteredWarehouses.length / rowsPerPage);
  const safeCurrentPage = Math.min(currentPage, totalPages || 1);
  const displayWarehouses = filteredWarehouses.slice(
    (safeCurrentPage - 1) * rowsPerPage,
    safeCurrentPage * rowsPerPage
  );

  const hasResults = filteredWarehouses.length > 0;

  // ----------------------------------------------------
  // 2. HANDLERS (Search & Pagination)
  // ----------------------------------------------------

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // ----------------------------------------------------
  // 3. UTILITY FUNCTIONS
  // ----------------------------------------------------

  /**
   * Formats a number as Vietnamese currency (VND).
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  /**
   * Calculates the total monetary value of all parts in a warehouse.
   * Assumes part object has 'price' and 'quantity'.
   */
  const calculateWarehouseValue = (warehouseParts = []) =>
    warehouseParts.reduce((sum, part) => {
      const partPrice = parseFloat(part.price) || 0;
      const partQuantity = part.quantity || 0;

      return sum + partQuantity * partPrice;
    }, 0);

  /**
   * Prepares the low stock alert string for display.
   */
  const getLowStockAlert = (warehouse) => {
    const lowParts = warehouse.lowPart || []; // Array of part names/strings from API
    const totalLowParts = lowParts.length;

    if (totalLowParts === 0) {
      return {
        display: "None",
        remainingCount: 0,
        isAlert: false,
      };
    }

    const partsToDisplay = lowParts.slice(0, MAX_LOW_STOCK_DISPLAY);
    let displayString = partsToDisplay.join(", ");
    let remainingCount = 0;

    if (totalLowParts > MAX_LOW_STOCK_DISPLAY) {
      remainingCount = totalLowParts - MAX_LOW_STOCK_DISPLAY;
      displayString += `...`;
    }

    return {
      display: displayString,
      remainingCount: remainingCount,
      isAlert: true,
    };
  };

  // ----------------------------------------------------
  // 4. RENDER FUNCTION
  // ----------------------------------------------------

  return (
    <Card className="pt-4 px-4 pb-4">
      <CardHeader>
        {/* === HEADER SECTION: Title and Search === */}
        <div className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All Warehouses</CardTitle>
            <CardDescription>
              Click on a row to view warehouse details and inventory.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search warehouses..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-8"
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 px-4">
        {loading ? (
          /* === Loading State === */
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500 mr-2" />
            <span className="text-gray-600">Loading warehouse data...</span>
          </div>
        ) : (
          <>
            {/* === Warehouse Table / No Results === */}
            <div className="rounded-md border overflow-x-auto">
              {hasResults ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Warehouse Name</TableHead>
                      <TableHead className="text-center">Location</TableHead>
                      <TableHead className="text-center">
                        Part Models Number
                      </TableHead>
                      <TableHead className="text-right">Total Value</TableHead>
                      <TableHead>Low Stock Alert</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {displayWarehouses.map((warehouse) => {
                      const lowStockInfo = getLowStockAlert(warehouse);
                      return (
                        <TableRow
                          key={warehouse.whId}
                          onClick={() => onRowClick(warehouse)}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                        >
                          <TableCell className="font-semibold text-xs text-gray-500">
                            {warehouse.whId}
                          </TableCell>
                          <TableCell className="font-medium">
                            {warehouse.name}
                          </TableCell>
                          <TableCell className="text-center">
                            {warehouse.location}
                          </TableCell>
                          <TableCell className="text-center font-bold text-blue-600">
                            {warehouse.numParts}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(
                              calculateWarehouseValue(warehouse.parts)
                            )}
                          </TableCell>
                          <TableCell
                            className={
                              lowStockInfo.isAlert
                                ? "text-red-600 font-semibold"
                                : "text-gray-800"
                            }
                          >
                            <div className="flex justify-between items-center min-w-[150px]">
                              <span className="truncate">
                                {lowStockInfo.display}
                              </span>
                              {lowStockInfo.remainingCount > 0 && (
                                <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-700 whitespace-nowrap flex-shrink-0">
                                  +{lowStockInfo.remainingCount}
                                </span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                /* === No Results Message === */
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-gray-500"
                      >
                        <div className="p-10 text-center">
                          <h3 className="text-xl font-semibold text-muted-foreground">
                            No Warehouses Found
                          </h3>
                          <p className="mt-2 text-sm text-gray-500">
                            Your search term "{searchTerm}" did not match any
                            warehouses.
                          </p>
                          <Button
                            variant="link"
                            onClick={() => setSearchTerm("")}
                            className="mt-2"
                          >
                            Clear Search
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </div>

            {/* === PAGINATION CONTROLS === */}
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
