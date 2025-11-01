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
import EvmWareDeta from "@/components/evmstaff/EvmWareDeta";
// ======================== API ENDPOINTS ========================
const WAREHOUSES_API_URL = "/api/warehouses";
const PARTS_API_URL = "/api/parts";

// === COMPONENT DEFINITION ===
export default function EVMStaffWarehouse() {
  const { auth } = useAuth();

  const [warehouses, setWarehouses] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // === REFRESH STATE ===
  const [refreshKey, setRefreshKey] = useState(0);
  const refreshData = () => setRefreshKey((prev) => prev + 1);

  // === UI STATES ===
  const [showReceiveStockModal, setShowReceiveStockModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);

  // === DATA FETCHING ===
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [warehousesRes, partsRes] = await Promise.all([
          axios.get(WAREHOUSES_API_URL, {
            headers: { Authorization: `Bearer ${auth.token}` },
          }),
          axios.get(PARTS_API_URL, {
            headers: { Authorization: `Bearer ${auth.token}` },
          }),
        ]);
        setWarehouses(warehousesRes.data);
        setParts(partsRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          "Failed to load warehouse data. Please check the API connection and token."
        );
        setWarehouses([]);
        setParts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [auth.token, refreshKey]); 

  // === UI STATE MANAGEMENT ===
  const handleReceiveSuccess = () => {
    refreshData();
    setShowReceiveStockModal(false);
    setShowDetailModal(false);
  };

  const handleWarehouseRowClick = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setShowDetailModal(true);
  };

  // === RENDER FUNCTION ===
  return (
    <div className="min-h-screen bg-muted/30">
      <EVMStaffSideBar />

      {/* === MAIN CONTENT LAYOUT === */}
      <div className="lg:pl-64">
        <Header />
        <main className="p-4 md:p-6 lg:p-8">
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
              parts={parts}
              loading={loading}
              onRowClick={handleWarehouseRowClick}
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
            <DialogDescription>
              Record new parts received into a warehouse.
            </DialogDescription>
          </DialogHeader>
          <EvmWareReceive
            warehouses={warehouses}
            partCatalog={parts} 
            partsInventory={parts}
            onSuccess={handleReceiveSuccess}
            onClose={() => setShowReceiveStockModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* MODAL 2: Warehouse Detail */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedWarehouse?.name}</DialogTitle>
            <DialogDescription>{selectedWarehouse?.location}</DialogDescription>
          </DialogHeader>
          {selectedWarehouse && (
            <EvmWareDeta
              warehouse={selectedWarehouse}
              partCatalog={parts} 
              onClose={() => setShowDetailModal(false)}
              onReceiveSuccess={handleReceiveSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}