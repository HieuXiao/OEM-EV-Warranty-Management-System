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
import { Plus, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import EvmWareTable from "@/components/evmstaff/EvmWareTable";
import useAuth from "@/hook/useAuth";
import axios from "axios";
import EVMStaffSideBar from "@/components/evmstaff/EVMStaffSideBar";
import EvmWareReceive from "@/components/evmstaff/EvmWareReceive";
import EvmWareDetail from "@/components/evmstaff/EvmWareDetail";

// ======================== API ENDPOINTS ========================
const WAREHOUSES_API_URL = "/api/warehouses";
// API for fetching the master list of parts (Part Catalog)
const PARTS_CATALOG_API_URL = "/api/part-under-warranty-controller";

// === COMPONENT DEFINITION ===
export default function EVMStaffWarehouse() {
  const { auth } = useAuth(); // === DATA STATES ===

  const [warehouses, setWarehouses] = useState([]);
  const [partCatalog, setPartCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // === REFRESH STATE === // Key used to force a refetch of data
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleOpenMenu = () => setIsMobileMenuOpen(true);
  const handleCloseMenu = () => setIsMobileMenuOpen(false);

  const [refreshKey, setRefreshKey] = useState(0);
  const refreshData = () => setRefreshKey((prev) => prev + 1); // === UI STATES ===

  const [showReceiveStockModal, setShowReceiveStockModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false); // Holds detailed data for the currently selected warehouse (from /warehouses/{id})
  const [selectedWarehouseDetail, setSelectedWarehouseDetail] = useState(null); // Stores the ID to trigger detail fetching after a stock operation success
  const [warehouseToRedirect, setWarehouseToRedirect] = useState(null); // ============= 1. DATA FETCHING FUNCTION (Detail) =============
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

  // ============= 2. EFFECT: FETCH BASE DATA (MOUNT/TOKEN CHANGE ONLY) =============
  // Fetches the main list of warehouses and the part catalog on component mount or token change.
  useEffect(() => {
    const fetchBaseData = async () => {
      try {
        setLoading(true);
        setError(null); // Fetch primary data lists concurrently

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
      } catch (err) {
        console.error("Error fetching base data:", err);
        setError(
          "Failed to load base warehouse data. Please check the API connection and token."
        );
        setWarehouses([]);
        setPartCatalog([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBaseData();
  }, [auth.token]); // Dependency is only the token

  // ============= 3. EFFECT: REFRESH & REDIRECT LOGIC =============
  // Handles data refetching upon successful stock operations or detail view update requests.
  useEffect(() => {
    // Exit if there's no refresh request and no pending redirect request.
    if (refreshKey === 0 && !warehouseToRedirect) return;

    const handleRefreshLogic = async () => {
      setLoading(true);
      try {
        // 1. Update the warehouse list (warehouses) if refreshKey changed
        if (refreshKey > 0) {
          const warehousesRes = await axios.get(WAREHOUSES_API_URL, {
            headers: { Authorization: `Bearer ${auth.token}` },
          });
          setWarehouses(warehousesRes.data);
        }

        // 2. --- Handle Redirect/Update Detail after refresh ---
        if (warehouseToRedirect) {
          // Case A: Stock operation completed; redirect/re-open detail view.
          const targetWhId = warehouseToRedirect;
          setWarehouseToRedirect(null); // Clear redirect state
          const updatedDetail = await fetchWarehouseDetail(targetWhId);
          setSelectedWarehouseDetail(updatedDetail);
          setShowDetailModal(true);
        } else if (selectedWarehouseDetail && showDetailModal) {
          // Case B: Currently viewing detail (modal open) & refreshKey changed, update detail data.
          const updatedDetail = await fetchWarehouseDetail(
            selectedWarehouseDetail.whId
          );
          setSelectedWarehouseDetail(updatedDetail);
        }
      } catch (err) {
        console.error("Error during refresh/redirect:", err);
        setError(err.message || "Failed to refresh data after operation.");
      } finally {
        setLoading(false);
      }
    };

    // Only run refresh logic if refreshKey > 0 or a redirect is pending
    if (refreshKey > 0 || warehouseToRedirect) {
      handleRefreshLogic();
    }
  }, [
    auth.token,
    refreshKey,
    warehouseToRedirect,
    selectedWarehouseDetail,
    showDetailModal,
    fetchWarehouseDetail,
  ]); // ============= 4. UI HANDLERS =============
  /**
   * Handles successful stock operation (Receive/Register) from any modal.
   * Triggers data refresh and sets up redirect back to the detail view.
   * @param {number} whIdFromModal - The ID of the warehouse that was modified.
   */

  const handleReceiveSuccess = (whIdFromModal = null) => {
    // Closes main receive modal (if open)
    setShowReceiveStockModal(false);

    const targetWhId = whIdFromModal || selectedWarehouseDetail?.whId;

    refreshData(); // Triggers re-fetch of warehouse lists

    if (targetWhId) {
      // Set to trigger detail fetch in useEffect after lists are updated
      setWarehouseToRedirect(targetWhId);
    }
  };
  /**
   * Handles click on a warehouse row to load and display details.
   * @param {object} warehouse - The selected warehouse object (summary data).
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
   * IMPORTANT: Do not call refreshData() here to prevent unnecessary base data refetch.
   */

  const handleBackToWarehouseList = () => {
    setSelectedWarehouseDetail(null);
    setShowDetailModal(false);
  }; // ============= 5. RENDER FUNCTION =============

  return (
    <div className="min-h-screen bg-muted/30">
           {" "}
      <EVMStaffSideBar
        isMobileOpen={isMobileMenuOpen}
        onClose={handleCloseMenu}
      />
            {/* === MAIN CONTENT LAYOUT === */}     
      <div className="lg:pl-64">
                <Header onMenuClick={handleOpenMenu} />       
        <main className="p-4 md:p-6 lg:p-8">
                    {/* Global Error Display */}         
          {error && (
            <Alert variant="destructive" className="mb-4">
                            <AlertTriangle className="h-4 w-4" />             
              <AlertDescription>{error}</AlertDescription>           
            </Alert>
          )}
                   
          {showDetailModal && selectedWarehouseDetail ? (
            // RENDER DETAIL VIEW
            <EvmWareDetail
              warehouse={selectedWarehouseDetail}
              partCatalog={partCatalog} // Pass catalog for consistency and register modal
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
            {/* === MODAL: Receive Stock (General) === */}     
      <Dialog
        open={showReceiveStockModal}
        onOpenChange={setShowReceiveStockModal}
      >
               
        <DialogContent className="w-full max-w-4xl sm:max-w-4xl md:max-w-4xl">
                   
          <DialogHeader>
                        <DialogTitle>Receive Stock</DialogTitle>           
            <DialogDescription>
                            Record new parts received into a warehouse.        
                 
            </DialogDescription>
                     
          </DialogHeader>
                   
          <EvmWareReceive
            warehouses={warehouses}
            partCatalog={partCatalog}
            partsInventory={partCatalog} // Use catalog as source for parts to receive
            onSuccess={(whId) => handleReceiveSuccess(whId)}
            onClose={() => setShowReceiveStockModal(false)}
          />
                 
        </DialogContent>
             
      </Dialog>
         
    </div>
  );
}
