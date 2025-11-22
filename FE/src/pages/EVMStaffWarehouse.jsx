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

const WAREHOUSES_API_URL = "/api/warehouses";
const PARTS_CATALOG_API_URL = "/api/part-under-warranty-controller";

export default function EVMStaffWarehouse() {
  const { auth } = useAuth();

  const [warehouses, setWarehouses] = useState([]);
  const [partCatalog, setPartCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleOpenMenu = () => setIsMobileMenuOpen(true);
  const handleCloseMenu = () => setIsMobileMenuOpen(false);

  const [refreshKey, setRefreshKey] = useState(0);
  const refreshData = () => setRefreshKey((prev) => prev + 1);

  const [showReceiveStockModal, setShowReceiveStockModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedWarehouseDetail, setSelectedWarehouseDetail] = useState(null);
  const [warehouseToRedirect, setWarehouseToRedirect] = useState(null);

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

  useEffect(() => {
    const fetchBaseData = async () => {
      try {
        setLoading(true);
        setError(null);

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
  }, [auth.token]);

  useEffect(() => {
    if (refreshKey === 0 && !warehouseToRedirect) return;

    const handleRefreshLogic = async () => {
      setLoading(true);
      try {
        if (refreshKey > 0) {
          const warehousesRes = await axios.get(WAREHOUSES_API_URL, {
            headers: { Authorization: `Bearer ${auth.token}` },
          });
          setWarehouses(warehousesRes.data);
        }

        if (warehouseToRedirect) {
          const targetWhId = warehouseToRedirect;
          setWarehouseToRedirect(null);
          const updatedDetail = await fetchWarehouseDetail(targetWhId);
          setSelectedWarehouseDetail(updatedDetail);
          setShowDetailModal(true);
        } else if (selectedWarehouseDetail && showDetailModal) {
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
  ]);

  const handleReceiveSuccess = (whIdFromModal = null) => {
    setShowReceiveStockModal(false);
    const targetWhId = whIdFromModal || selectedWarehouseDetail?.whId;
    refreshData();
    if (targetWhId) {
      setWarehouseToRedirect(targetWhId);
    }
  };

  const handleWarehouseRowClick = async (warehouse) => {
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

  const handleBackToWarehouseList = () => {
    setSelectedWarehouseDetail(null);
    setShowDetailModal(false);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <EVMStaffSideBar
        isMobileOpen={isMobileMenuOpen}
        onClose={handleCloseMenu}
      />
      <div className="lg:pl-64 transition-all duration-200">
        <Header onMenuClick={handleOpenMenu} />
        <main className="p-4 md:p-6 lg:p-8">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {showDetailModal && selectedWarehouseDetail ? (
            <EvmWareDetail
              warehouse={selectedWarehouseDetail}
              partCatalog={partCatalog}
              onBack={handleBackToWarehouseList}
              onReceiveSuccess={handleReceiveSuccess}
            />
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Warehouse Management
                </h1>
                <Button
                  onClick={() => setShowReceiveStockModal(true)}
                  className="flex items-center space-x-2 w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4" />
                  <span>Receive Stock</span>
                </Button>
              </div>

              <EvmWareTable
                warehouses={warehouses}
                loading={loading}
                onRowClick={handleWarehouseRowClick}
              />
            </div>
          )}
        </main>
      </div>

      {/* Main Receive Stock Modal - Responsive */}
      <Dialog
        open={showReceiveStockModal}
        onOpenChange={setShowReceiveStockModal}
      >
        <DialogContent className="w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle>Receive Stock</DialogTitle>
            <DialogDescription>
              Record new parts received into a warehouse.
            </DialogDescription>
          </DialogHeader>

          <EvmWareReceive
            warehouses={warehouses}
            partCatalog={partCatalog}
            partsInventory={partCatalog}
            onSuccess={(whId) => handleReceiveSuccess(whId)}
            onClose={() => setShowReceiveStockModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
