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
  
  // 💡 STATE MỚI: Lưu ID kho hàng cần chuyển đến sau khi load lại data
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
        setWarehouses(newWarehouses);
        setParts(partsRes.data);
        setPartCatalog(partCatalogRes.data);

        // 💡 LOGIC: Sau khi fetch data mới, kiểm tra và cập nhật giao diện
        if (warehouseToRedirect) {
            // Trường hợp 1: Có yêu cầu chuyển hướng/cập nhật từ Receive Stock Modal
            const targetWarehouse = newWarehouses.find(wh => wh.whId === warehouseToRedirect);
            if (targetWarehouse) {
                setSelectedWarehouse(targetWarehouse);
                setShowDetailModal(true); // Đảm bảo hiển thị trang chi tiết
            }
            setWarehouseToRedirect(null); // Reset state sau khi xử lý
        } else if (selectedWarehouse) {
            // Trường hợp 2: Đang ở trang chi tiết, chỉ cần cập nhật data mới cho kho hàng đó
            const updatedWarehouse = newWarehouses.find(wh => wh.whId === selectedWarehouse.whId);
            if (updatedWarehouse) {
                // Cập nhật selectedWarehouse với dữ liệu mới nhất
                setSelectedWarehouse(updatedWarehouse); 
            } else {
                // Trường hợp kho hàng bị xóa
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
  }, [auth.token, refreshKey]); // Chỉ chạy khi token hoặc refreshKey thay đổi

  // === UI STATE MANAGEMENT ===

  // 💡 CẬP NHẬT: Xử lý thành công từ cả Modal lớn (EvmWareReceive) và Modal nhỏ (EvmWareDetailReceive)
  const handleReceiveSuccess = (whIdFromModal = null) => {
    // 1. Đóng Modal lớn nếu nó đang mở
    setShowReceiveStockModal(false);

    // 2. Xác định ID kho hàng cần chuyển hướng/cập nhật
    // Ưu tiên ID được trả về từ Modal lớn (vì nó không biết detail page đang mở hay không)
    // Sau đó là ID của kho hàng đang được chọn trên detail page
    const targetWhId = whIdFromModal || selectedWarehouse?.whId;
    
    // 3. Kích hoạt refresh data
    refreshData();

    // 4. Nếu có ID kho hàng, set state chuyển hướng (sẽ được xử lý trong useEffect sau khi data mới về)
    if (targetWhId) {
        setWarehouseToRedirect(targetWhId);
    }
  };

  // Xử lý click trên hàng: Chuyển sang trang chi tiết
  const handleWarehouseRowClick = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setShowDetailModal(true);
  };

  // Xử lý nút Back trên trang chi tiết: Quay lại trang danh sách
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
              onReceiveSuccess={handleReceiveSuccess} // Hàm này sẽ kích hoạt việc refresh và update selectedWarehouse
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
              {/* Data Table */}
              <EvmWareTable
                warehouses={warehouses}
                parts={parts}
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
            // 💡 CẬP NHẬT: Truyền whId của kho hàng vừa nhận vào hàm onSuccess
            onSuccess={(whId) => handleReceiveSuccess(whId)} 
            onClose={() => setShowReceiveStockModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}