"use client"

// FE/src/pages/AdminParts&Policy.jsx

import { useState, useEffect, useCallback } from "react"
import AdminSidebar from "@/components/admin/AdminSidebar"
import Header from "@/components/Header"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import PartsTable from "@/components/admin/AdPartTable"
import PartDetailPage from "@/components/admin/AdPartDetailPage" // Component trang chi tiết mới
import PolicyEditModal from "@/components/admin/AdPoliEdit"
import CreatePartForm from "@/components/admin/AdPartCreate"
import useAuth from "@/hook/useAuth"
import axios from "axios"

// ======================== API ENDPOINTS ========================
const PARTS_API_URL = "/api/part-under-warranty-controller"
const POLICIES_API_URL = "/api/policies"

export default function AdminPartsPolicy() {
  const { auth } = useAuth()

  const [parts, setParts] = useState([])
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // === UI STATE MANAGEMENT ===
  const [selectedPart, setSelectedPart] = useState(null)
  const [showCreatePart, setShowCreatePart] = useState(false)
  const [policyToEdit, setPolicyToEdit] = useState(null)
  const [showEditPolicy, setShowEditPolicy] = useState(false)
  const [activePoliciesCount, setActivePoliciesCount] = useState(0)

  // 🟢 HÀM TẢI DỮ LIỆU TỪ API
  const fetchPartsAndPolicies = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const headers = { Authorization: `Bearer ${auth.token}` }

      const partsResponse = await axios.get(PARTS_API_URL, { headers })
      setParts(partsResponse.data)

      const policiesResponse = await axios.get(POLICIES_API_URL, { headers })
      setPolicies(policiesResponse.data)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError("Failed to load parts or policies data. Please check the API connection and token.")
      setParts([])
      setPolicies([])
    } finally {
      setLoading(false)
    }
  }, [auth.token])

  useEffect(() => {
    fetchPartsAndPolicies()
  }, [fetchPartsAndPolicies])

  // 🟢 XỬ LÝ CHUYỂN ĐỔI TRANG
  const handlePartRowClick = (part) => {
    setSelectedPart(part)
  }

  const handleBackToPartsList = () => {
    setSelectedPart(null)
  }

  // === Các hàm CRUD API (đã được sửa đổi để gọi fetchPartsAndPolicies) ===
  const handleAddPart = async ({ partData, policyData }) => {
    let createdPart = null
    try {
      const partResponse = await axios.post(PARTS_API_URL, partData, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      createdPart = partResponse.data
      const newPartId = createdPart.partId

      if (!newPartId) throw new Error("Part created successfully, but missing partId.")

      const policyDataToSend = { ...policyData, partId: newPartId }
      await axios.post(POLICIES_API_URL, policyDataToSend, { headers: { Authorization: `Bearer ${auth.token}` } })

      await fetchPartsAndPolicies()
      setShowCreatePart(false)
      return { success: true }
    } catch (err) {
      console.error("Error in transaction (Part/Policy creation):", err)
      alert(
        "Transaction Failed: Creation failed. Check API response. " +
          (createdPart ? `(Part ID: ${createdPart.partId} created)` : ""),
      )
      throw err
    }
  }

  const handleUpdatePart = async (updatedPart) => {
    try {
      await axios.put(`${PARTS_API_URL}/${updatedPart.partId}`, updatedPart, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      await fetchPartsAndPolicies()
      setSelectedPart(updatedPart)
    } catch (error) {
      console.error("Failed to update part:", error)
      alert("Cập nhật phụ tùng thất bại.")
    }
  }

  const handleDeletePart = async (partId) => {
    if (!window.confirm("Are you sure you want to delete this part?")) return
    try {
      await axios.delete(`${PARTS_API_URL}/${partId}`, { headers: { Authorization: `Bearer ${auth.token}` } })
      await fetchPartsAndPolicies()
      handleBackToPartsList()
    } catch (error) {
      console.error("Failed to delete part:", error)
      alert("Xóa phụ tùng thất bại.")
    }
  }

  const handlePolicyEditClick = (policy) => {
    const count = policies.filter(
      (p) => p.partId === policy.partId && p.enabled && p.policyId !== policy.policyId,
    ).length

    setActivePoliciesCount(count)
    setPolicyToEdit(policy)
    setShowEditPolicy(true)
  }

  const handleUpdatePolicy = async (updatedPolicy) => {
    try {
      await axios.put(`${POLICIES_API_URL}/${updatedPolicy.policyId}`, updatedPolicy, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      await fetchPartsAndPolicies()

      setShowEditPolicy(false)
      setPolicyToEdit(null)
      if (selectedPart && selectedPart.partId === updatedPolicy.partId) {
        setSelectedPart({ ...selectedPart })
      }
    } catch (error) {
      console.error("Failed to update policy:", error)
      alert("Cập nhật chính sách thất bại.")
    }
  }

  // === MAIN RENDER ===
  return (
    <div className="min-h-screen bg-muted/30">
      <AdminSidebar />
      <div className="lg:pl-64">
        <Header />
        <div className="p-4 md:p-6 lg:p-8">
          <div className="space-y-6">
            {selectedPart ? (
              // 🟢 1. HIỂN THỊ TRANG CHI TIẾT
              <PartDetailPage
                part={selectedPart}
                onBack={handleBackToPartsList} // Truyền hàm Back
                onUpdate={handleUpdatePart}
                onDelete={handleDeletePart}
                partPolicies={policies.filter((p) => p.partId === selectedPart.partId)}
                onEditPolicy={handlePolicyEditClick}
              />
            ) : (
              // 🟢 2. HIỂN THỊ BẢNG DANH SÁCH
              <>
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-3xl font-bold text-foreground">Parts & Policies</h1>
                  <Button onClick={() => setShowCreatePart(true)} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Create New Part</span>
                  </Button>
                </div>
                {error && <p className="text-red-500 mb-4 p-4 border border-red-200 bg-red-50 rounded-md">{error}</p>}
                <PartsTable parts={parts} onRowClick={handlePartRowClick} loading={loading} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* === MODALS (Không can thiệp vào chuyển trang) === */}
      {policyToEdit && (
        <PolicyEditModal
          policy={policyToEdit}
          open={showEditPolicy}
          onOpenChange={setShowEditPolicy}
          onSave={handleUpdatePolicy}
          activePoliciesCount={activePoliciesCount}
        />
      )}

      <Dialog open={showCreatePart} onOpenChange={setShowCreatePart}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create New Part & Policy</DialogTitle>
            <DialogDescription>Define part information and its associated initial warranty policy.</DialogDescription>
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
  )
}
