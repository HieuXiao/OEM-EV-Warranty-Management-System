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

// ======================== API ENDPOINTS ========================
const WAREHOUSES_API_URL = "/api/warehouses";
const PARTS_API_URL = "/api/parts";

export default function EVMStaffWarehouse() {
  const { auth } = useAuth();

  const [warehouses, setWarehouses] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // === FETCH WAREHOUSES AND PARTS FROM API ===
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
  }, [auth.token]);

  // === UI STATE MANAGEMENT ===
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [showWarehouseDetail, setShowWarehouseDetail] = useState(false);
  const [showCreateWarehouse, setShowCreateWarehouse] = useState(false);

  // === HANDLE ROW CLICK ===
  const handleWarehouseRowClick = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setShowWarehouseDetail(true);
  };

  // === MAIN RENDER ===
  return (
    <div className="min-h-screen bg-muted/30">
      <EVMStaffSideBar />

      {/* === MAIN CONTENT === */}
      <div className="lg:pl-64">
        <Header />
        <div className="p-4 md:p-6 lg:p-8">
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-foreground">
                Warehouse Management
              </h1>
              <Button
                onClick={() => setShowCreateWarehouse(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Receive Stock</span>
              </Button>
            </div>
            <EvmWareTable
              warehouses={warehouses}
              parts={parts}
              onRowClick={handleWarehouseRowClick}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* === CREATE WAREHOUSE MODAL === */}
      <Dialog open={showCreateWarehouse} onOpenChange={setShowCreateWarehouse}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create New Warehouse</DialogTitle>
            <DialogDescription>
              Add a new warehouse to manage your inventory.
            </DialogDescription>
          </DialogHeader>
          {/* TODO: Add CreateWarehouseForm component here */}
        </DialogContent>
      </Dialog>
    </div>
  );
}
