import { useState, useEffect, useCallback } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
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
import PartsTable from "@/components/admin/AdPartTable";
import PartDetailPage from "@/components/admin/AdPartDetailPage";
import CreatePartForm from "@/components/admin/AdPartCreate";
import CreatePolicyForm from "@/components/admin/AdPoliCreate";
import useAuth from "@/hook/useAuth";
import axios from "axios";

const PARTS_API_URL = "/api/part-under-warranty-controller";
const POLICIES_API_URL = "/api/policies";

export default function AdminPartsPolicy() {
  const { auth } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleOpenMenu = () => setIsMobileMenuOpen(true);
  const handleCloseMenu = () => setIsMobileMenuOpen(false);

  const [parts, setParts] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreatePart, setShowCreatePart] = useState(false);
  const [showCreatePolicy, setShowCreatePolicy] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);

  // Fetch Data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [partsRes, policiesRes] = await Promise.all([
        axios.get(PARTS_API_URL, {
          headers: { Authorization: `Bearer ${auth.token}` },
        }),
        axios.get(POLICIES_API_URL, {
          headers: { Authorization: `Bearer ${auth.token}` },
        }),
      ]);
      setParts(partsRes.data);
      setPolicies(policiesRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [auth.token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers
  const handleAddPart = async (newPartData) => {
    try {
      // Gọi API tạo Part (giả lập hoặc thực tế)
      // await axios.post(...)
      setShowCreatePart(false);
      fetchData();
    } catch (error) {
      console.error("Create part failed", error);
    }
  };

  const handleAddPolicy = async (newPolicyData) => {
    try {
      await axios.post(POLICIES_API_URL, newPolicyData, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setShowCreatePolicy(false);
      fetchData();
    } catch (error) {
      console.error("Create policy failed", error);
    }
  };

  const handleBackToList = () => {
    setSelectedPart(null);
    fetchData(); // Refresh data khi quay lại
  };

  return (
    <div className="flex min-h-screen bg-muted/30 w-full overflow-hidden">
      <AdminSidebar isMobileOpen={isMobileMenuOpen} onClose={handleCloseMenu} />

      <div className="flex-1 flex flex-col lg:pl-64 transition-all duration-200 w-full max-w-full">
        <Header onMenuClick={handleOpenMenu} />

        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 w-full">
          <div className="space-y-6">
            {/* Header Section */}
            {!selectedPart && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    Parts & Policies
                  </h1>
                  <p className="text-muted-foreground">
                    Manage parts inventory and warranty policies.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button
                    onClick={() => setShowCreatePart(true)}
                    className="w-full sm:w-auto"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Part
                  </Button>
                  <Button
                    onClick={() => setShowCreatePolicy(true)}
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Policy
                  </Button>
                </div>
              </div>
            )}

            {/* Content */}
            {selectedPart ? (
              <PartDetailPage
                part={selectedPart}
                onBack={handleBackToList}
                policies={policies.filter(
                  (p) =>
                    p.partId === selectedPart.id ||
                    p.partId === selectedPart.partId
                )}
                onRefresh={fetchData}
                currentAccount={auth}
              />
            ) : (
              <PartsTable
                parts={parts}
                loading={loading}
                onRowClick={setSelectedPart}
              />
            )}

            {/* Create Part Modal */}
            <Dialog open={showCreatePart} onOpenChange={setShowCreatePart}>
              <DialogContent className="w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-xl">
                <DialogHeader>
                  <DialogTitle>Create New Part & Policy</DialogTitle>
                  <DialogDescription>
                    Define part information and its associated initial warranty
                    policy.
                  </DialogDescription>
                </DialogHeader>
                <CreatePartForm
                  onSubmit={handleAddPart}
                  onCancel={() => setShowCreatePart(false)}
                  currentAdminId={auth.accountId}
                  currentAdminName={auth.fullName || auth.accountId}
                />
              </DialogContent>
            </Dialog>

            {/* Create Policy Modal */}
            <Dialog open={showCreatePolicy} onOpenChange={setShowCreatePolicy}>
              <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-xl">
                <DialogHeader>
                  <DialogTitle>Add New Policy</DialogTitle>
                  <DialogDescription>
                    Create a new warranty policy for the selected part.
                  </DialogDescription>
                </DialogHeader>
                <CreatePolicyForm
                  initialPartId={selectedPart?.partId}
                  onSubmit={handleAddPolicy}
                  onCancel={() => setShowCreatePolicy(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
