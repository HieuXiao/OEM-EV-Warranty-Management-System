// FE/src/pages/AdminParts&Policy.jsx

import { useState } from "react"
import AdminSidebar from "@/components/admin/AdminSidebar"
import Header from "@/components/Header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import PartsTable from "@/components/admin/AdPartTable"
import PartDetailModal from "@/components/admin/AdPartDetail"
import CreatePartForm from "@/components/admin/AdPartCreate"
import PoliciesTable from "@/components/admin/AdPoliTable"
import CreatePolicyForm from "@/components/admin/AdPoliCreate"

export default function AdminPartsPolicy() {
  const [parts, setParts] = useState([
    {
      id: "1",
      partName: "Engine Oil Filter",
      partBranch: "VinFast",
      price: 150000,
      vehicleModel: "VF8",
      description: "Original engine oil filter for VF8",
      policyId: "P001",
      policyName: "Standard Warranty",
      availableTime: "24 months",
    },
    {
      id: "2",
      partName: "Air Filter",
      partBranch: "VinFast",
      price: 200000,
      vehicleModel: "VF9",
      description: "Original air filter for VF9",
      policyId: "P002",
      policyName: "Extended Warranty",
      availableTime: "36 months",
    },
  ])

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
  ])

  const [selectedPart, setSelectedPart] = useState(null)
  const [selectedPolicy, setSelectedPolicy] = useState(null)
  const [showPartDetail, setShowPartDetail] = useState(false)
  const [showCreatePart, setShowCreatePart] = useState(false)
  const [showCreatePolicy, setShowCreatePolicy] = useState(false)
  const [editingPart, setEditingPart] = useState(null)

  const handlePartRowClick = (part) => {
    setSelectedPart(part)
    setEditingPart(null)
    setShowPartDetail(true)
  }

  const handleAddPart = (newPart) => {
    const part = {
      ...newPart,
      id: String(parts.length + 1),
    }
    setParts([...parts, part])
    setShowCreatePart(false)
  }

  const handleUpdatePart = (updatedPart) => {
    setParts(parts.map((p) => (p.id === updatedPart.id ? updatedPart : p)))
    setSelectedPart(updatedPart)
  }

  const handleDeletePart = (partId) => {
    setParts(parts.filter((p) => p.id !== partId))
    setShowPartDetail(false)
  }

  const handleAddPolicy = (newPolicy) => {
    const policy = {
      ...newPolicy,
      id: String(policies.length + 1),
    }
    setPolicies([...policies, policy])
    setShowCreatePolicy(false)
  }

  const handleTogglePolicy = (policyId) => {
    setPolicies(
      policies.map((p) =>
        p.id === policyId ? { ...p, enabled: !p.enabled } : p
      )
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminSidebar />
      {/* Main Content */}
      <div className="lg:pl-64">
        <Header />
        <div className="p-4 md:p-6 lg:p-8">
          <div className="space-y-6">

            {/* Tabs */}
            <Tabs defaultValue="parts" className="space-y-6">
              <TabsList>
                <TabsTrigger value="parts">Parts</TabsTrigger>
                <TabsTrigger value="policies">Policies</TabsTrigger>
              </TabsList>

              {/* Parts Tab */}
              <TabsContent value="parts" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Parts</h2>
                  <Button onClick={() => setShowCreatePart(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Part
                  </Button>
                </div>
                <PartsTable parts={parts} onRowClick={handlePartRowClick} />
              </TabsContent>

              {/* Policies Tab */}
              <TabsContent value="policies" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Policies</h2>
                  <Button onClick={() => setShowCreatePolicy(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Policy
                  </Button>
                </div>
                <PoliciesTable
                  policies={policies}
                  parts={parts}
                  onToggle={handleTogglePolicy}
                  onSelectPolicy={setSelectedPolicy}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Part Detail Modal */}
      <PartDetailModal
        part={selectedPart}
        open={showPartDetail}
        onOpenChange={setShowPartDetail}
        onUpdate={handleUpdatePart}
        onDelete={handleDeletePart}
      />

      {/* Create Part Modal */}
      <Dialog open={showCreatePart} onOpenChange={setShowCreatePart}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Part</DialogTitle>
            <DialogDescription>Add a new warranty part with policy information</DialogDescription>
          </DialogHeader>
          <CreatePartForm onSubmit={handleAddPart} onCancel={() => setShowCreatePart(false)} />
        </DialogContent>
      </Dialog>

      {/* Create Policy Modal */}
      <Dialog open={showCreatePolicy} onOpenChange={setShowCreatePolicy}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Policy</DialogTitle>
            <DialogDescription>Create a new warranty policy for a part</DialogDescription>
          </DialogHeader>
          <CreatePolicyForm
            parts={parts}
            policies={policies}
            onSubmit={handleAddPolicy}
            onCancel={() => setShowCreatePolicy(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
