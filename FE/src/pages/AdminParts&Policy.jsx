// FE/src/pages/AdminParts&Policy.jsx

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
import PolicyEditModal from "@/components/admin/AdPoliEdit";
import CreatePartForm from "@/components/admin/AdPartCreate";
import CreatePolicyForm from "@/components/admin/AdPoliCreate";
import useAuth from "@/hook/useAuth";
import axios from "axios";

// ======================== API ENDPOINTS ========================
const PARTS_API_URL = "/api/part-under-warranty-controller";
const POLICIES_API_URL = "/api/policies";

/**
 * @component
 * @description Main administrative page for viewing and managing Parts and their associated Policies.
 */
export default function AdminPartsPolicy() {
  const { auth } = useAuth();

  // === DATA STATES ===
  const [parts, setParts] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // === UI STATE MANAGEMENT ===
  const [selectedPart, setSelectedPart] = useState(null);
  const [showCreatePart, setShowCreatePart] = useState(false);
  const [policyToEdit, setPolicyToEdit] = useState(null);
  const [showEditPolicy, setShowEditPolicy] = useState(false);
  // Stores the count of other active policies for validation during policy editing
  const [activePoliciesCount, setActivePoliciesCount] = useState(0);
  const [showCreatePolicy, setShowCreatePolicy] = useState(false);

  // ============= 1. DATA FETCHING FUNCTIONS =============

  /**
   * @function fetchPartsAndPolicies
   * @description Fetches the latest list of parts and policies from their respective APIs.
   * Uses useCallback to memoize the function.
   */
  const fetchPartsAndPolicies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${auth.token}` };

      const partsResponse = await axios.get(PARTS_API_URL, { headers });
      setParts(partsResponse.data);

      const policiesResponse = await axios.get(POLICIES_API_URL, { headers });
      setPolicies(policiesResponse.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(
        "Failed to load parts or policies data. Please check the API connection and token."
      );
      setParts([]);
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  }, [auth.token]);

  /**
   * Effect hook to run data fetching on component mount.
   */
  useEffect(() => {
    fetchPartsAndPolicies();
  }, [fetchPartsAndPolicies]);

  // ============= 2. NAVIGATION & UI HANDLERS =============

  /**
   * @function handlePartRowClick
   * @param {Object} part - The part object selected from the table.
   * @description Sets the selected part to view its details.
   */
  const handlePartRowClick = (part) => {
    setSelectedPart(part);
  };

  /**
   * @function handleBackToPartsList
   * @description Clears the selected part state to return to the list view.
   */
  const handleBackToPartsList = () => {
    setSelectedPart(null);
  };

  /**
   * @function handleAddPolicyClick
   * @param {string} partId - The ID of the part to which the new policy will be added.
   * @description Sets the selected part context and opens the Create Policy modal.
   */
  const handleAddPolicyClick = (partId) => {
    if (partId) {
      // Set the full part object for context if needed by the modal/handlers
      setSelectedPart(parts.find((p) => p.partId === partId));
    }
    setShowCreatePolicy(true);
  };

  // ============= 3. DATA MANIPULATION HANDLERS =============

  /**
   * @function handleAddPolicy
   * @param {Object} policyData - The data for the new policy to be created (isEnable: false by default).
   * @description Sends a POST request to create a new policy and refreshes the data.
   */
  const handleAddPolicy = async (policyData) => {
    try {
      await axios.post(POLICIES_API_URL, policyData, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      await fetchPartsAndPolicies();
      setShowCreatePolicy(false);
      alert("Policy created successfully! (Status: Inactive)");
    } catch (err) {
      console.error("Error creating policy:", err);
      alert("Failed to create policy. Check API response.");
      throw err;
    }
  };

  /**
   * @function handleAddPart
   * @param {Object} data - Contains partData and policyData for creation.
   * @description Handles the transactional creation of a new part followed by its initial policy.
   */
  const handleAddPart = async ({ partData, policyData }) => {
    let createdPart = null;
    try {
      // 1. Create Part
      const partResponse = await axios.post(PARTS_API_URL, partData, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      createdPart = partResponse.data;
      const newPartId = createdPart.partId;

      if (!newPartId)
        throw new Error("Part created successfully, but missing partId.");

      // 2. Create Initial Policy tied to the new Part
      const policyDataToSend = { ...policyData, partId: newPartId };
      await axios.post(POLICIES_API_URL, policyDataToSend, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      // 3. Refresh and return success
      await fetchPartsAndPolicies();
      setShowCreatePart(false);
      return { success: true };
    } catch (err) {
      console.error("Error in transaction (Part/Policy creation):", err);
      alert(
        "Transaction Failed: Creation failed. Check API response. " +
          (createdPart ? `(Part ID: ${createdPart.partId} created)` : "")
      );
      throw err;
    }
  };

  /**
   * @function handleUpdatePart
   * @param {Object} updatedPart - The part data with changes.
   * @description Sends a PUT request to update an existing part.
   */
  const handleUpdatePart = async (updatedPart) => {
    try {
      await axios.put(`${PARTS_API_URL}/${updatedPart.partId}`, updatedPart, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      await fetchPartsAndPolicies();
      setSelectedPart(updatedPart);
    } catch (error) {
      console.error("Failed to update part:", error);
      alert("Failed to update part.");
    }
  };

  /**
   * @function handlePolicyEditClick
   * @param {Object} policy - The policy object to be edited.
   * @description Sets the policy to edit and calculates the count of other active policies for validation.
   */
  const handlePolicyEditClick = (policy) => {
    const partIdToFilter = policy.partUnderWarranty?.partId || "";

    // Count active policies for the same part, excluding the current policy being edited
    const count = policies.filter(
      (p) =>
        p.partUnderWarranty?.partId === partIdToFilter &&
        p.isEnable &&
        p.policyId !== policy.policyId
    ).length;

    setActivePoliciesCount(count);
    setPolicyToEdit(policy);
    setShowEditPolicy(true);
  };

  /**
   * @function handleUpdatePolicy
   * @param {Object} updatedPolicy - The policy data with changes.
   * @description Sends a PUT request to update an existing policy and refreshes the data.
   */
  const handleUpdatePolicy = async (updatedPolicy) => {
    try {
      await axios.put(
        `${POLICIES_API_URL}/${updatedPolicy.policyId}`,
        updatedPolicy,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      await fetchPartsAndPolicies();

      setShowEditPolicy(false);
      setPolicyToEdit(null);
      if (selectedPart && selectedPart.partId === updatedPolicy.partId) {
        // Forced update to re-render detail page with potentially updated policy status
        setSelectedPart({ ...selectedPart });
      }
    } catch (error) {
      console.error("Failed to update policy:", error);
      alert("Failed to update policy.");
    }
  };

  // ============= 4. MAIN RENDER =============

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminSidebar />
      <div className="lg:pl-64">
        <Header />
        <div className="p-4 md:p-6 lg:p-8">
          <div className="space-y-6">
            {selectedPart ? (
              // 1. Display Detail Page
              <PartDetailPage
                part={selectedPart}
                onBack={handleBackToPartsList}
                onUpdate={handleUpdatePart}
                onDelete={null} // Placeholder for future delete logic
                partPolicies={policies.filter(
                  (p) => p.partUnderWarranty?.partId === selectedPart.partId
                )}
                onEditPolicy={handlePolicyEditClick}
                onAddPolicy={() => handleAddPolicyClick(selectedPart.partId)}
              />
            ) : (
              // 2. Display Parts List Table
              <>
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-3xl font-bold text-foreground">
                    Parts & Policies
                  </h1>
                  <Button
                    onClick={() => setShowCreatePart(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create New Part</span>
                  </Button>
                </div>

                {error && (
                  <p className="text-red-500 mb-4 p-4 border border-red-200 bg-red-50 rounded-md">
                    {error}
                  </p>
                )}

                <PartsTable
                  parts={parts}
                  onRowClick={handlePartRowClick}
                  loading={loading}
                />
              </>
            )}
          </div>
        </div>
        {/* === MODALS === */}
        {/* Policy Edit Modal */}
        {policyToEdit && (
          <PolicyEditModal
            policy={policyToEdit}
            open={showEditPolicy}
            onOpenChange={setShowEditPolicy}
            onSave={handleUpdatePolicy}
            activePoliciesCount={activePoliciesCount}
          />
        )}

        {/* Create Part Modal */}
        <Dialog open={showCreatePart} onOpenChange={setShowCreatePart}>
          <DialogContent className="max-w-4xl">
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

        {/* Create New Policy Modal */}
        <Dialog open={showCreatePolicy} onOpenChange={setShowCreatePolicy}>
          <DialogContent className="max-w-md">
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
  );
}
