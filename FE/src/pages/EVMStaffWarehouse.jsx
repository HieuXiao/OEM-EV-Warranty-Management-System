// FE/src/pages/EVMStaffWarehouse.jsx

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import EvmWareTable from "@/components/evmstaff/EvmWareTable";
import useAuth from "@/hook/useAuth";
import axios from "axios";
import EVMStaffSideBar from "@/components/evmstaff/EVMStaffSideBar";
import EvmWareReceive from "@/components/evmstaff/EvmWareReceive";
import EvmWareDetail from "@/components/evmstaff/EvmWareDetail";

// ======================== API ENDPOINTS ========================
const WAREHOUSES_API_URL = "/api/warehouses";
// Re-include Catalog API for EvmWareReceive modal (list of parts that can be received)
const PARTS_CATALOG_API_URL = "/api/part-under-warranty-controller";

// === COMPONENT DEFINITION ===
export default function EVMStaffWarehouse() {
  const { auth } = useAuth();

  // === DATA STATES ===
  const [warehouses, setWarehouses] = useState([]);
  const [partCatalog, setPartCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // === REFRESH STATE ===
  const [refreshKey, setRefreshKey] = useState(0);
  const refreshData = () => setRefreshKey((prev) => prev + 1);

  // === UI STATES ===
  const [showReceiveStockModal, setShowReceiveStockModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedWarehouseDetail, setSelectedWarehouseDetail] = useState(null);
  const [warehouseToRedirect, setWarehouseToRedirect] = useState(null);

  // ----------------------------------------------------
  // 1. DATA FETCHING FUNCTIONS
  // ----------------------------------------------------

  /**
   * Fetches the detailed information for a specific warehouse by ID.
   * @param {number} whId - The ID of the warehouse.
   */
  const fetchWarehouseDetail = useCallback(
    async (whId) => {
      try {
        const response = await axios.get(`${WAREHOUSES_API_URL}/${whId}`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        return response.data;
      } catch (err) {
        console.error(`Error fetching warehouse detail for ID ${whId}:`, err);
        throw new Error("Failed to load warehouse details.");
      }
    },
    [auth.token]
  );

  /**
   * Fetches list data (Warehouses and Part Catalog) on component mount or refresh.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch Warehouse List and Part Catalog (for receive modal)
        const [warehousesRes, partCatalogRes] = await Promise.all([
          axios.get(WAREHOUSES_API_URL, {
            headers: { Authorization: `Bearer ${auth.token}` },
          }),
          axios.get(PARTS_CATALOG_API_URL, {
            headers: { Authorization: `Bearer ${auth.token}` },
          }),
        ]);

        setWarehouses(warehousesRes.data);
        setPartCatalog(partCatalogRes.data);

        // Handle Redirect/Update Detail after refresh
        if (warehouseToRedirect) {
          const targetWhId = warehouseToRedirect;
          setWarehouseToRedirect(null);
          const updatedDetail = await fetchWarehouseDetail(targetWhId);
          setSelectedWarehouseDetail(updatedDetail);
          setShowDetailModal(true);
        } else if (selectedWarehouseDetail) {
          const updatedDetail = await fetchWarehouseDetail(
            selectedWarehouseDetail.whId
          );
          setSelectedWarehouseDetail(updatedDetail);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          "Failed to load warehouse data. Please check the API connection and token."
        );
        setWarehouses([]);
        setPartCatalog([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [
    auth.token,
    refreshKey,
    warehouseToRedirect,
    selectedWarehouseDetail,
    fetchWarehouseDetail,
  ]);

  // ----------------------------------------------------
  // 2. UI HANDLERS
  // ----------------------------------------------------

  /**
   * Handles successful stock reception and triggers data refresh/detail view redirect.
   * @param {number} whIdFromModal - The ID of the warehouse that received stock.
   */
  const handleReceiveSuccess = (whIdFromModal = null) => {
    setShowReceiveStockModal(false);

    const targetWhId = whIdFromModal || selectedWarehouseDetail?.whId;

    refreshData();

    if (targetWhId) {
      // Set to trigger detail fetch after list refresh
      setWarehouseToRedirect(targetWhId);
    }
  };

  /**
   * Handles click on a warehouse row to show details.
   * @param {object} warehouse - The selected warehouse object (from /api/warehouses).
   */
  const handleWarehouseRowClick = async (warehouse) => {
    // Call detail API to get the exact part list for detail page
    try {
      setLoading(true);
      const detail = await fetchWarehouseDetail(warehouse.whId);
      setSelectedWarehouseDetail(detail);
      setShowDetailModal(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clears detail view and returns to the warehouse list.
   */
  const handleBackToWarehouseList = () => {
    setSelectedWarehouseDetail(null);
    setShowDetailModal(false);
  };

  // ----------------------------------------------------
  // 3. RENDER FUNCTION
  // ----------------------------------------------------

  return (
    <div className="min-h-screen bg-muted/30">
      <EVMStaffSideBar />
      {/* === MAIN CONTENT LAYOUT === */}
      <div className="lg:pl-64">
        <Header />
        <main className="p-4 md:p-6 lg:p-8">
          {showDetailModal && selectedWarehouseDetail ? (
            // RENDER DETAIL VIEW
            <EvmWareDetail
              warehouse={selectedWarehouseDetail}
              partCatalog={partCatalog} // Pass catalog if needed for part-related operations in detail
              onBack={handleBackToWarehouseList}
              onReceiveSuccess={handleReceiveSuccess}
            />
          ) : (
            // RENDER LIST VIEW
            <div className="space-y-6">
              {/* Page Header & Action Button */}
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-foreground">
                  Warehouse Management
                </h1>
                <Button
                  onClick={() => setShowReceiveStockModal(true)}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Receive Stock</span>
                </Button>
              </div>

              {/* Data Table */}
              <EvmWareTable
                warehouses={warehouses}
                loading={loading}
                onRowClick={handleWarehouseRowClick}
              />
            </div>
          )}
        </main>
      </div>
      {/* === MODAL: Receive Stock === */}
      <Dialog
        open={showReceiveStockModal}
        onOpenChange={setShowReceiveStockModal}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Receive Stock</DialogTitle>
            <DialogDescription>
              Record new parts received into a warehouse.
            </DialogDescription>
          </DialogHeader>

          <EvmWareReceive
            warehouses={warehouses}
            // Pass Part Catalog so the modal can list parts available for reception
            partCatalog={partCatalog}
            // If EvmWareReceive uses 'partsInventory', it should be satisfied by partCatalog here
            partsInventory={partCatalog}
            onSuccess={(whId) => handleReceiveSuccess(whId)}
            onClose={() => setShowReceiveStockModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
