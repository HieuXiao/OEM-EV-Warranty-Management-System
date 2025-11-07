"use client"

// FE/src/components/admin/AdPartTable.jsx

// ======================= IMPORTS =======================
import { useState, useMemo } from "react"
// UI Component Imports
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react"

// === CONSTANT: number of rows displayed per page ===
const ROWS_PER_PAGE = 6

/**
 * AdPartTable Component
 * Displays a paginated table of parts with a search feature.
 * @param {Object[]} parts - Array of part objects.
 * @param {function} onRowClick - Handler for when a table row is clicked.
 * @param {boolean} loading - Loading state.
 */
// === MAIN COMPONENT: PartsTable ===
export default function PartsTable({ parts, onRowClick, loading }) {
  // ================== STATE ==================
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = ROWS_PER_PAGE

  // ================== FILTERING & PAGINATION LOGIC ==================

  // Filter Logic
  const filteredParts = useMemo(() => {
    return parts.filter(
      (part) =>
        part.partId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.partBrand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [parts, searchTerm])

  // Pagination Calculation
  const totalPages = Math.ceil(filteredParts.length / rowsPerPage)

  const safeCurrentPage = Math.min(currentPage, totalPages || 1)

  const currentParts = filteredParts.slice((safeCurrentPage - 1) * rowsPerPage, safeCurrentPage * rowsPerPage)

  const displayParts = currentParts
  const hasResults = filteredParts.length > 0

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

  // ================== UI RENDERING ==================
  return (
    <Card className="pt-4 px-4 pb-4">
      <CardHeader>
        {/* === HEADER SECTION === */}
        <div className="flex flex-row items-center justify-between">
          {/* Left Block: Title and Description */}
          <div>
            <CardTitle>All Parts</CardTitle>
            <CardDescription>Click on a row to view details and policies.</CardDescription>
          </div>

          {/* Right Block: Search Box */}
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search parts..." value={searchTerm} onChange={handleSearchChange} className="pl-8" />
            </div>
          </div>
        </div>
      </CardHeader>

      {/* === TABLE CONTENT === */}
      <CardContent className="pt-0 px-4">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500 mr-2" />
            <span className="text-gray-600">Loading parts data...</span>
          </div>
        ) : (
          <>
            {/* User Table / No Results */}
            <div className="rounded-md border overflow-x-auto">
              {hasResults ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Part Number</TableHead>
                      <TableHead>Part Name</TableHead>
                      <TableHead>Part Brand</TableHead>
                      <TableHead>Vehicle Model</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Policy ID</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {displayParts.map((part) => (
                      <TableRow
                        key={part.partId}
                        onClick={() => onRowClick(part)}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-semibold text-xs text-gray-500">{part.partId}</TableCell>
                        <TableCell className="font-medium">{part.partName}</TableCell>
                        <TableCell>{part.partBrand}</TableCell>
                        <TableCell>{part.vehicleModel}</TableCell>
                        <TableCell>
                          <Badge variant={part.isEnable ? "default" : "secondary"}>
                            {part.isEnable ? "Enabled" : "Disabled"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{part.policyId || "N/A"}</TableCell>
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
                          <h3 className="text-xl font-semibold text-muted-foreground">No Parts Found</h3>
                          <p className="mt-2 text-sm text-gray-500">
                            Your search term "{searchTerm}" did not match any parts.
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
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Prev
                </Button>

                <span className="mx-2">
                  Page {safeCurrentPage} of {totalPages}
                </span>

                <Button variant="outline" size="sm" onClick={handleNextPage} disabled={safeCurrentPage === totalPages}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
