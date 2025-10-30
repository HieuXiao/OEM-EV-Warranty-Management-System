// FE/src/components/evmstaff/EvmWareTable.jsx

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react"

// === CONSTANT: number of rows displayed per page ===
const ROWS_PER_PAGE = 5

/**
 * EvmWareTable Component
 * Displays a paginated table of warehouses with a search feature.
 * @param {Object[]} warehouses - Array of warehouse objects.
 * @param {Object[]} parts - Array of part objects.
 * @param {function} onRowClick - Handler for when a table row is clicked.
 * @param {boolean} loading - Loading state.
 */
export default function EvmWareTable({ warehouses, parts, onRowClick, loading }) {
  // ================== STATE ==================
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = ROWS_PER_PAGE

  // ================== FILTERING & PAGINATION LOGIC ==================

  // Group parts by warehouse
  const warehousesWithParts = useMemo(() => {
    return warehouses.map((warehouse) => ({
      ...warehouse,
      parts: parts.filter((part) => part.warehouse?.whId === warehouse.whId),
    }))
  }, [warehouses, parts])

  // Filter Logic
  const filteredWarehouses = useMemo(() => {
    return warehousesWithParts.filter(
      (warehouse) =>
        warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        warehouse.location.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [warehousesWithParts, searchTerm])

  // Pagination Calculation
  const totalPages = Math.ceil(filteredWarehouses.length / rowsPerPage)
  const safeCurrentPage = Math.min(currentPage, totalPages || 1)
  const currentWarehouses = filteredWarehouses.slice((safeCurrentPage - 1) * rowsPerPage, safeCurrentPage * rowsPerPage)

  const displayWarehouses = currentWarehouses
  const hasResults = filteredWarehouses.length > 0

  // ================== HANDLERS ==================

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  // ================== UTILITY FUNCTIONS ==================

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  // Calculate warehouse inventory value
  const calculateWarehouseValue = (warehouseParts = []) =>
    warehouseParts.reduce((sum, part) => sum + part.quantity * part.price, 0)

  // Get low stock alert
  const getLowStockAlert = (warehouse) => {
    return warehouse.lowPart && warehouse.lowPart.length > 0 ? warehouse.lowPart.join(", ") : "None"
  }

  // Get latest update from parts
  const getLatestUpdate = (warehouseParts = []) => {
    if (warehouseParts.length === 0) return new Date(0)
    return new Date()
  }

  // ================== UI RENDERING ==================
  return (
    <Card className="pt-4 px-4 pb-4">
      <CardHeader>
        {/* === HEADER SECTION === */}
        <div className="flex flex-row items-center justify-between">
          {/* Left Block: Title and Description */}
          <div>
            <CardTitle>All Warehouses</CardTitle>
            <CardDescription>Click on a row to view warehouse details and inventory.</CardDescription>
          </div>

          {/* Right Block: Search Box */}
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

      {/* === TABLE CONTENT === */}
      <CardContent className="pt-0 px-4">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500 mr-2" />
            <span className="text-gray-600">Loading warehouse data...</span>
          </div>
        ) : (
          <>
            {/* Warehouse Table / No Results */}
            <div className="rounded-md border overflow-x-auto">
              {hasResults ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No.</TableHead>
                      <TableHead>Warehouse Name</TableHead>
                      <TableHead className="text-center">Location</TableHead>
                      <TableHead className="text-center">Last Updated</TableHead>
                      <TableHead className="text-center">Inventory Value</TableHead>
                      <TableHead>Low Stock Alert</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {displayWarehouses.map((warehouse, i) => (
                      <TableRow
                        key={warehouse.whId}
                        onClick={() => onRowClick(warehouse)}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-semibold text-xs text-gray-500">
                          {(safeCurrentPage - 1) * rowsPerPage + i + 1}
                        </TableCell>
                        <TableCell className="font-medium">{warehouse.name}</TableCell>
                        <TableCell className="text-center">{warehouse.location}</TableCell>
                        <TableCell className="text-center text-sm text-gray-600">
                          {getLatestUpdate(warehouse.parts).toLocaleString("vi-VN")}
                        </TableCell>
                        <TableCell className="text-center font-semibold">
                          {formatCurrency(calculateWarehouseValue(warehouse.parts))}
                        </TableCell>
                        <TableCell
                          className={
                            getLowStockAlert(warehouse) !== "None" ? "text-red-600 font-semibold" : "text-gray-800"
                          }
                        >
                          {getLowStockAlert(warehouse)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                /* === NO RESULTS MESSAGE === */
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500">
                        <div className="p-10 text-center">
                          <h3 className="text-xl font-semibold text-muted-foreground">No Warehouses Found</h3>
                          <p className="mt-2 text-sm text-gray-500">
                            Your search term "{searchTerm}" did not match any warehouses.
                          </p>
                          <Button variant="link" onClick={() => setSearchTerm("")} className="mt-2">
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
                <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={safeCurrentPage === 1}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                </Button>

                <span className="mx-2">
                  Page {safeCurrentPage} of {totalPages}
                </span>

                <Button variant="outline" size="sm" onClick={handleNextPage} disabled={safeCurrentPage === totalPages}>
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
