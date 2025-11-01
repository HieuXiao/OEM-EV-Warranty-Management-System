// === IMPORTS ===
import { useState, useEffect } from "react"
import AdminSidebar from "@/components/admin/AdminSidebar"
import Header from "@/components/Header"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import EvmWareTable from "@/components/evmstaff/EvmWareTable"
import EvmWareReceive from "@/components/evmstaff/EvmWareReceive"
import EvmWareDeta from "@/components/evmstaff/EvmWareDetail" // Import component "Deta"
import useAuth from "@/hook/useAuth"
import axios from "axios"

// === API ENDPOINTS ===
const WAREHOUSES_API_URL = "/api/warehouses"
const PARTS_API_URL = "/api/parts"
const PART_UNDER_WARRANTY_API_URL = "/api/part-under-warranty-controller"

// === COMPONENT DEFINITION ===
export default function EVMStaffWarehouse() {
  const { auth } = useAuth()

  // === DATA STATES ===
  const [warehouses, setWarehouses] = useState([])
  const [parts, setParts] = useState([]) // Đây là "Part Inventory"
  const [partsUnderWarranty, setPartsUnderWarranty] = useState([]) // Đây là "Part Catalog"
  const [loading, setLoading] = useState(true)

  // === REFRESH STATE ===
  const [refreshKey, setRefreshKey] = useState(0)
  const refreshData = () => setRefreshKey((prev) => prev + 1)

  // === UI STATES ===
  const [showReceiveStockModal, setShowReceiveStockModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false) // Đổi tên thành Deta
  const [selectedWarehouse, setSelectedWarehouse] = useState(null)

  // === DATA FETCHING (EFFECT) ===
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [warehousesRes, partsRes, partsUwRes] = await Promise.all([
          axios.get(WAREHOUSES_API_URL, {
            headers: { Authorization: `Bearer ${auth.token}` },
          }),
          axios.get(PARTS_API_URL, {
            headers: { Authorization: `Bearer ${auth.token}` },
          }),
          axios.get(PART_UNDER_WARRANTY_API_URL, {
            headers: { Authorization: `Bearer ${auth.token}` },
          }),
        ])
        setWarehouses(warehousesRes.data)
        setParts(partsRes.data)
        setPartsUnderWarranty(partsUwRes.data)
      } catch (err) {
        console.error("Error fetching data:", err)
        setWarehouses([])
        setParts([])
        setPartsUnderWarranty([])
      } finally {
        setLoading(false)
      }
    }

    if (auth.token) {
      fetchData()
    } else {
      setLoading(false)
      console.log("No auth token available, skipping data fetch.")
    }
  }, [auth.token, refreshKey])

  // === HANDLERS ===

  /**
   * Handles success from BOTH the main receive form AND the mini-receive form.
   * Closes all modals and refreshes all data.
   */
  const handleReceiveSuccess = () => {
    setShowReceiveStockModal(false)
    setShowDetailModal(false) // Đóng modal Deta
    refreshData()
  }

  /**
   * Handles clicking on a warehouse row in the main table.
   * Sets the selected warehouse and opens the detail modal.
   * @param {Object} warehouse - The warehouse object that was clicked.
   */
  const handleWarehouseRowClick = (warehouse) => {
    setSelectedWarehouse(warehouse)
    setShowDetailModal(true)
  }

  // === RENDER FUNCTION ===
  return (
    <div className="min-h-screen bg-muted/30">
      <AdminSidebar />

      {/* === MAIN CONTENT LAYOUT === */}
      <div className="lg:pl-64">
        <Header />
        <main className="p-4 md:p-6 lg:p-8">
          <div className="space-y-6">
            {/* Page Header & Action Button */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-foreground">Warehouse Management</h1>
              <Button onClick={() => setShowReceiveStockModal(true)} className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Receive Stock</span>
              </Button>
            </div>

            {/* Data Table */}
            <EvmWareTable
              warehouses={warehouses}
              parts={parts}
              loading={loading}
              onRowClick={handleWarehouseRowClick} // Truyền handler
            />
          </div>
        </main>
      </div>

      {/* === MODALS === */}

      {/* MODAL 1: Receive Stock (General) */}
      <Dialog open={showReceiveStockModal} onOpenChange={setShowReceiveStockModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Receive Stock</DialogTitle>
            <DialogDescription>Add new inventory for a part into a selected warehouse.</DialogDescription>
          </DialogHeader>
          <EvmWareReceive
            warehouses={warehouses}
            partCatalog={partsUnderWarranty}
            partsInventory={parts}
            onSuccess={handleReceiveSuccess}
            onClose={() => setShowReceiveStockModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* MODAL 2: Warehouse Deta (Detail) */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        {/* Make this modal larger to fit the table */}
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedWarehouse?.name}</DialogTitle>
            <DialogDescription>{selectedWarehouse?.location}</DialogDescription>
          </DialogHeader>
          {/* Render the detail component only if a warehouse is selected */}
          {selectedWarehouse && (
            <EvmWareDeta
              warehouse={selectedWarehouse}
              partCatalog={partsUnderWarranty}
              onClose={() => setShowDetailModal(false)}
              onReceiveSuccess={handleReceiveSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

