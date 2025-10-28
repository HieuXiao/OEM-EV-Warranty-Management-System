// FE/src/pages/AdminParts&Policy.jsx

import { useState, useEffect } from "react";
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
import PartDetailModal from "@/components/admin/AdPartDetail";
import CreatePartForm from "@/components/admin/AdPartCreate";
import useAuth from "@/hook/useAuth";
import axios from "axios";

// ======================== API ENDPOINTS ========================
const PARTS_API_URL = "/api/part-under-warranty-controller";
const POLICIES_API_URL = "/api/policies";

export default function AdminPartsPolicy() {
  const { auth } = useAuth();

  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [policies, setPolicies] = useState([
    {
      id: "1",
      policyId: "P001",
      policyName: "Standard Warranty",
      availableYear: 2,
      kilometer: 50000,
      enabled: true,
      partId: "1",
    },
    {
      id: "2",
      policyId: "P002",
      policyName: "Extended Warranty",
      availableYear: 3,
      kilometer: 100000,
      enabled: true,
      partId: "2",
    },
  ]);

  // === FETCH PARTS FROM API ===
  // This effect runs once on mount to load all parts from the backend API.
  // It sets loading states, handles authentication via token, and updates UI accordingly.
  useEffect(() => {
    const fetchParts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(PARTS_API_URL, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        setParts(response.data);
      } catch (err) {
        console.error("Error fetching parts:", err);
        setError(
          "Failed to load parts data. Please check the API connection and token."
        );
        setParts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchParts();
  }, [auth.token]);

  // === UI STATE MANAGEMENT ===
  // These states control which modals or detail views are open, and which part is selected.
  const [selectedPart, setSelectedPart] = useState(null);
  const [showPartDetail, setShowPartDetail] = useState(false);
  const [showCreatePart, setShowCreatePart] = useState(false);
  const [editingPart, setEditingPart] = useState(null);

  // === HANDLE ROW CLICK ===
  // When a row is clicked in the table, open the detail modal for that part.
  const handlePartRowClick = (part) => {
    setSelectedPart(part);
    setEditingPart(null);
    setShowPartDetail(true);
  };

  // === HANDLE ADD PART (CREATE PART + POLICY TRANSACTION) ===
  const handleAddPart = async ({ partData, policyData }) => {
    let createdPart = null;

    try {
      console.log("Creating Part:", partData);
      const partResponse = await axios.post(PARTS_API_URL, partData, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      createdPart = partResponse.data;
      const newPartId = createdPart.partId;

      if (!newPartId) {
        throw new Error(
          "Part created successfully, but missing partId for policy creation."
        );
      }

      const policyDataToSend = {
        ...policyData,
        partId: newPartId,
      };
      console.log("Creating Policy:", policyDataToSend);
      const policyResponse = await axios.post(
        POLICIES_API_URL,
        policyDataToSend,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      const createdPolicy = policyResponse.data;

      // === Update UI states ===
      setParts([...parts, createdPart]);
      setPolicies([
        ...policies,
        {
          ...createdPolicy,
          id: String(policies.length + 1),
        },
      ]);
      setShowCreatePart(false);

      return { createdPart, createdPolicy };
    } catch (err) {
      console.error("Error in transaction (Part/Policy creation):", err);
      let errorMessage =
        "Creation failed. Please check the network and API response.";

      // Warn admin if part was created but policy failed.
      if (createdPart) {
        errorMessage +=
          "\nNote: Part was created, but Policy failed. Manual cleanup for Part ID: " +
          createdPart.partId +
          " may be required.";
      }

      alert("Transaction Failed: " + errorMessage);
      throw err;
    }
  };

  // === HANDLE UPDATE PART ===
  // Updates part data in the local state when changes are made in the detail modal.
  const handleUpdatePart = (updatedPart) => {
    setParts(
      parts.map((p) => (p.partId === updatedPart.partId ? updatedPart : p))
    );
    setSelectedPart(updatedPart);
  };

  // === HANDLE DELETE PART ===
  // Removes a part from the list when deleted.
  const handleDeletePart = (partId) => {
    setParts(parts.filter((p) => p.partId !== partId));
    setShowPartDetail(false);
  };

  // === MAIN RENDER ===
  return (
    <div className="min-h-screen bg-muted/30">
      <AdminSidebar />

      {/* === MAIN CONTENT === */}
      <div className="lg:pl-64">
        <Header />
        <div className="p-4 md:p-6 lg:p-8">
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-foreground">
              Parts & Policies
              </h1>
              <Button
                onClick={() => setShowCreatePart(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create New Part</span>
              </Button>
            </div>
            <PartsTable
              parts={parts}
              onRowClick={handlePartRowClick}
              loading={loading} // ĐÃ THÊM: Truyền loading prop
            />
          </div>
        </div>
      </div>

      {/* === PART DETAIL MODAL === */}
      <PartDetailModal
        part={selectedPart}
        open={showPartDetail}
        onOpenChange={setShowPartDetail}
        onUpdate={handleUpdatePart}
        onDelete={handleDeletePart}
        partPolicies={policies.filter((p) => p.partId === selectedPart?.partId)}
      />

      {/* === CREATE PART MODAL === */}
      <Dialog open={showCreatePart} onOpenChange={setShowCreatePart}>
        <DialogContent className="max-w-3xl">
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
    </div>
  );
}
