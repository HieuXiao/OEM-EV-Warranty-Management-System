// FE/src/pages/EVMStaffWarehouse.jsx

import { useState, useEffect } from "react";
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
const PARTS_API_URL = "/api/parts";
const PARTS_UNDER_WARRANTY_API_URL = "/api/part-under-warranty-controller";

// === COMPONENT DEFINITION ===
export default function EVMStaffWarehouse() {
  const { auth } = useAuth();

  const [warehouses, setWarehouses] = useState([]);
  const [parts, setParts] = useState([]);
  const [partCatalog, setPartCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // === REFRESH STATE ===
  const [refreshKey, setRefreshKey] = useState(0);
  const refreshData = () => setRefreshKey((prev) => prev + 1);

  // === UI STATES ===
  const [showReceiveStockModal, setShowReceiveStockModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  
  const [warehouseToRedirect, setWarehouseToRedirect] = useState(null);

  // === DATA FETCHING ===
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [warehousesRes, partsRes, partCatalogRes] = await Promise.all([
          axios.get(WAREHOUSES_API_URL, {
            headers: { Authorization: `Bearer ${auth.token}` },
          }),
          axios.get(PARTS_API_URL, {
            headers: { Authorization: `Bearer ${auth.token}` },
          }),
          axios.get(PARTS_UNDER_WARRANTY_API_URL, {
            headers: { Authorization: `Bearer ${auth.token}` },
          }),
        ]);
        
        const newWarehouses = warehousesRes.data;
        const newParts = partsRes.data;
        
        setWarehouses(newWarehouses);
        setParts(newParts);
        setPartCatalog(partCatalogRes.data);

        const partsByWarehouseId = newParts.reduce((map, part) => {
            const whId = part.warehouse?.whId;
            if (whId) {
                if (!map[whId]) map[whId] = [];
                map[whId].push(part);
            }
            return map;
        }, {});
        
        const completeWarehouses = newWarehouses.map(warehouse => ({
            ...warehouse,
            parts: partsByWarehouseId[warehouse.whId] || [],
        }));

        if (warehouseToRedirect) {
            const targetWarehouse = completeWarehouses.find(wh => wh.whId === warehouseToRedirect); 
            if (targetWarehouse) {
                setSelectedWarehouse(targetWarehouse);
                setShowDetailModal(true); 
            }
            setWarehouseToRedirect(null);
        }
        else if (selectedWarehouse) {
            const updatedWarehouse = completeWarehouses.find(wh => wh.whId === selectedWarehouse.whId); 
            if (updatedWarehouse) {
                setSelectedWarehouse(updatedWarehouse); 
            } else {
                handleBackToWarehouseList();
            }
        }
        
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          "Failed to load warehouse data. Please check the API connection and token."
        );
        setWarehouses([]);
        setParts([]);
        setPartCatalog([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [auth.token, refreshKey, warehouseToRedirect]); 

  // === UI STATE MANAGEMENT ===

  const handleReceiveSuccess = (whIdFromModal = null) => {
    setShowReceiveStockModal(false);

    const targetWhId = whIdFromModal || selectedWarehouse?.whId;
    
    refreshData();

    if (targetWhId) {
        setWarehouseToRedirect(targetWhId);
    }
  };

  const handleWarehouseRowClick = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setShowDetailModal(true);
  };

  
  const handleBackToWarehouseList = () => {
    setSelectedWarehouse(null);
    setShowDetailModal(false);
  };

  // === RENDER FUNCTION ===
  return (
    <div className="min-h-screen bg-muted/30">
        <EVMStaffSideBar />
      {/* === MAIN CONTENT LAYOUT === */}
      <div className="lg:pl-64">
          <Header />
        <main className="p-4 md:p-6 lg:p-8">
          {showDetailModal && selectedWarehouse ? (
            // 💡 HIỂN THỊ TRANG CHI TIẾT
            <EvmWareDetail
              warehouse={selectedWarehouse}
              partCatalog={partCatalog}
              onBack={handleBackToWarehouseList}
              onReceiveSuccess={handleReceiveSuccess} 
            />
          ) : (
            // 💡 HIỂN THỊ TRANG DANH SÁCH (Mặc định)
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
              {/* Data Table (Đã thêm prop partCatalog) */}
              <EvmWareTable
                warehouses={warehouses}
                parts={parts}
                partCatalog={partCatalog}
                loading={loading}
                onRowClick={handleWarehouseRowClick}
              />
            </div>
          )}
        </main>
      </div>
      {/* === MODAL 1: Receive Stock (General) === */}
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
            partCatalog={partCatalog}
            partsInventory={parts}
            
            onSuccess={(whId) => handleReceiveSuccess(whId)} 
            onClose={() => setShowReceiveStockModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}