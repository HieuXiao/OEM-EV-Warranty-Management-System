// === IMPORTS ===
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Search, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import EvmWareDetailReceive from "./EvmWareDetaReceive" // FIX: Import đúng form mini

// === CONSTANTS ===
const ROWS_PER_PAGE = 10

// === HELPER FUNCTIONS ===
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount)
}

/**
 * EvmWareDetail Component
 * Renders the content for the warehouse detail modal.
 *
 * @param {Object} warehouse - The selected warehouse object (contains name, location, and its parts array).
 * @param {Object[]} partCatalog - The complete list of all parts (for finding part details).
 * @param {function} onClose - Function to close this detail modal.
 * @param {function} onReceiveSuccess - Function to call on successful stock update (closes all modals & refreshes).
 */
export default function EvmWareDetail({ warehouse, partCatalog, onClose, onReceiveSuccess }) {
  // === MAIN TABLE STATE ===
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  // === MINI-MODAL STATE ===
  const [showMiniReceive, setShowMiniReceive] = useState(false)
  const [selectedPart, setSelectedPart] = useState(null)

  // === FILTERING & PAGINATION LOGIC ===
  const filteredParts = useMemo(() => {
    // warehouse.parts is the inventory *only* for this warehouse
    return (warehouse?.parts || []).filter(
      (part) =>
        part.namePart.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.partNumber.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [warehouse, searchTerm])

  const totalPages = Math.ceil(filteredParts.length / ROWS_PER_PAGE)
  const safeCurrentPage = Math.min(currentPage, totalPages || 1)
  const currentParts = filteredParts.slice(
    (safeCurrentPage - 1) * ROWS_PER_PAGE,
    safeCurrentPage * ROWS_PER_PAGE
  )

  // === MAIN TABLE HANDLERS ===
  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }
  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  // === MINI-MODAL HANDLERS ===
  /**
   * Opens the mini-modal to receive a specific part.
   * @param {Object} part - The part selected from the table row.
   */
  const handleOpenMiniReceive = (part) => {
    setSelectedPart(part)
    setShowMiniReceive(true)
  }

  // === RENDER ===
  return (
    <>
      {/* --- Main Detail View --- */}
      <div className="space-y-4">
        {/* --- Search Bar --- */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search parts in this warehouse..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1) // Reset to first page on search
            }}
            className="pl-10"
          />
        </div>

        {/* --- Parts Table --- */}
        <div className="border rounded-lg max-h-[50vh] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/50 z-10">
              <TableRow>
                <TableHead>Part Number</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
                <TableHead className="text-center">Receive</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentParts.length > 0 ? (
                currentParts.map((part) => (
                  <TableRow key={part.partNumber}>
                    <TableCell className="font-medium">{part.partNumber}</TableCell>
                    <TableCell>{part.namePart}</TableCell>
                    <TableCell className={`text-right ${part.quantity < 50 ? "text-red-600 font-medium" : ""}`}>
                      {part.quantity}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(part.price)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(part.quantity * part.price)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button size="sm" variant="outline" onClick={() => handleOpenMiniReceive(part)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Receive
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                    No parts found in this warehouse {searchTerm && "matching your search"}.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* --- Pagination --- */}
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
      </div>

      {/* --- Mini-Modal for Receiving Stock --- */}
      <Dialog open={showMiniReceive} onOpenChange={setShowMiniReceive}>
        <DialogContent className="max-w-md">
          {/* FIX: Render đúng component EvmWareDetailReceive */}
          {selectedPart && (
            <EvmWareDetailReceive
              part={selectedPart}
              warehouse={warehouse}
              partCatalog={partCatalog}
              onSuccess={onReceiveSuccess}
              onClose={() => setShowMiniReceive(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

