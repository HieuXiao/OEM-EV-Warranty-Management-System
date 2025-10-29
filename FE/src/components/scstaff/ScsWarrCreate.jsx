import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import axiosPrivate from "@/api/axios"
import useAuth from "@/hook/useAuth"

const API_ENDPOINTS = {
  CLAIMS: "/api/warranty-claims",
  CUSTOMERS: "/api/customers",
  VEHICLES: "/api/vehicles",
  ACCOUNTS: "/api/accounts/",
  CAMPAIGNS: "/api/campaigns/all",
}

export default function ScsWarrCreate({ isOpen, onOpenChange, onClaimCreated }) {
  const { auth } = useAuth()
  const currentUser = auth

  const [loading, setLoading] = useState(false)
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [vehicles, setVehicles] = useState([])
  const [selectedVin, setSelectedVin] = useState("")
  const [vehicleModel, setVehicleModel] = useState("")
  const [technicians, setTechnicians] = useState([])
  const [selectedTechnician, setSelectedTechnician] = useState("")
  const [description, setDescription] = useState("")
  const [claimId, setClaimId] = useState("")
  const [loadingVehicles, setLoadingVehicles] = useState(false)
  const [loadingTechnicians, setLoadingTechnicians] = useState(false)
  const [campaigns, setCampaigns] = useState([])
  const [selectedCampaign, setSelectedCampaign] = useState("")
  const [campaignFound, setCampaignFound] = useState(false)
  const [isCampaignChecked, setIsCampaignChecked] = useState(false)

  useEffect(() => {
    if (isOpen) {
      resetForm()
      fetchTechnicians()
      fetchCampaigns()
      generateClaimId()
    }
  }, [isOpen])

  const resetForm = () => {
    setCustomerPhone("")
    setCustomerName("")
    setVehicles([])
    setSelectedVin("")
    setVehicleModel("")
    setSelectedTechnician("")
    setDescription("")
    setClaimId("")
    setSelectedCampaign("")
    setCampaignFound(false)
    setIsCampaignChecked(false)
  }

  const generateClaimId = async () => {
    const dateStr = new Date().toISOString().split("T")[0]
    const centerId = currentUser?.serviceCenter?.centerId || "NA"
    try {
      const res = await axiosPrivate.get(API_ENDPOINTS.CLAIMS)
      const claims = Array.isArray(res.data) ? res.data : []
      const sameDay = claims.filter((c) => c.claimId?.includes(`WC-${centerId}-${dateStr}`))
      const nextSerial = (sameDay.length + 1).toString().padStart(3, "0")
      const newId = `WC-${centerId}-${dateStr}-${nextSerial}`
      setClaimId(newId)
      return newId
    } catch (err) {
      console.error("Error generating claimId:", err)
      const fallback = `WC-${centerId}-${dateStr}-001`
      setClaimId(fallback)
      return fallback
    }
  }

  const fetchTechnicians = async () => {
    try {
      setLoadingTechnicians(true)
      // 🔹 Lấy account hiện tại đầy đủ
      const accountDetailRes = await axiosPrivate.get(`${API_ENDPOINTS.ACCOUNTS}${currentUser.accountId}`)
      const fullAccount = accountDetailRes.data
      const currentCenterId = fullAccount?.serviceCenter?.centerId

      if (!currentCenterId) {
        console.warn("⚠️ Current user has no service center info.")
        setTechnicians([])
        return
      }

      // 🔹 Lấy tất cả accounts
      const res = await axiosPrivate.get(API_ENDPOINTS.ACCOUNTS)
      const list = Array.isArray(res.data) ? res.data : []

      const techs = list.filter(
        (a) =>
          a.roleName === "SC_TECHNICIAN" &&
          a.enabled &&
          String(a.serviceCenter?.centerId) === String(currentCenterId)
      )

      console.log("✅ Filtered technicians:", techs)
      setTechnicians(techs)
    } catch (e) {
      console.error("Error fetching technicians:", e)
      setTechnicians([])
    } finally {
      setLoadingTechnicians(false)
    }
  }

  const fetchCampaigns = async () => {
    try {
      const res = await axiosPrivate.get(API_ENDPOINTS.CAMPAIGNS)
      setCampaigns(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error("Error fetching campaigns:", err)
      setCampaigns([])
    }
  }

  useEffect(() => {
    if (!customerPhone) {
      setCustomerName("")
      setVehicles([])
      setSelectedVin("")
      setVehicleModel("")
      return
    }

    const fetchData = async () => {
      try {
        setLoadingVehicles(true)
        const customersRes = await axiosPrivate.get(API_ENDPOINTS.CUSTOMERS)
        const customers = Array.isArray(customersRes.data) ? customersRes.data : []
        const foundCustomer = customers.find((c) => c.customerPhone === customerPhone)

        if (foundCustomer) {
          setCustomerName(foundCustomer.customerName)
          const vehiclesRes = await axiosPrivate.get(API_ENDPOINTS.VEHICLES)
          const allVehicles = Array.isArray(vehiclesRes.data) ? vehiclesRes.data : []
          const related = allVehicles.filter((v) => v.customer?.customerId === foundCustomer.customerId)
          setVehicles(related)
        } else {
          setCustomerName("")
          setVehicles([])
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setCustomerName("")
        setVehicles([])
      } finally {
        setLoadingVehicles(false)
      }
    }

    fetchData()
  }, [customerPhone])

  useEffect(() => {
    if (selectedVin) {
      const selected = vehicles.find((v) => v.vin === selectedVin)
      setVehicleModel(selected ? selected.model : "")

      if (selected?.model) {
        const matched = campaigns.find((c) => c.model.includes(selected.model))
        setCampaignFound(!!matched)
        setSelectedCampaign(matched ? matched.campaignId.toString() : "")
        setIsCampaignChecked(!!matched)
      } else {
        setCampaignFound(false)
        setSelectedCampaign("")
        setIsCampaignChecked(false)
      }
    } else {
      setVehicleModel("")
      setCampaignFound(false)
      setSelectedCampaign("")
      setIsCampaignChecked(false)
    }
  }, [selectedVin, vehicles, campaigns])

  const handleSubmitNewClaim = async (e) => {
    e.preventDefault()
    if (!selectedVin) return alert("Please select a vehicle VIN.")
    if (!technicians.length) return alert("No technicians available in this service center.")
    if (!selectedTechnician) return alert("Please assign a technician.")
    if (!description) return alert("Please enter a description.")

    try {
      setLoading(true)
      const finalClaimId = claimId || (await generateClaimId())

      // ✅ Payload chỉ chứa campaign được tick
      const payload = {
        claimId: finalClaimId,
        vin: selectedVin,
        scStaffId: currentUser.accountId?.toUpperCase(),
        scTechnicianId: selectedTechnician.toUpperCase(),
        claimDate: new Date().toISOString().split("T")[0],
        description,
        campaignIds:
          isCampaignChecked && selectedCampaign ? [Number(selectedCampaign)] : [],
      }

      console.log("📦 Creating warranty claim payload:", payload)

      await axiosPrivate.post(API_ENDPOINTS.CLAIMS, payload)

      // ✅ Nếu có campaign thì tạo appointment
      if (isCampaignChecked && selectedCampaign) {
        try {
          await axiosPrivate.post("/api/service-appointments", {
            vin: selectedVin,
            campaignId: Number(selectedCampaign),
            date: new Date().toISOString(),
            description: null,
          })
          console.log("✅ Service appointment created successfully.")
        } catch (err) {
          console.error("Error creating service appointment:", err)
        }
      }

      resetForm()
      onOpenChange(false)
      onClaimCreated?.()
      window.location.reload()
    } catch (err) {
      console.error("Error creating claim:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Create New Warranty Claim</DialogTitle>
          <p className="text-sm text-muted-foreground">Fill in the details below</p>
        </DialogHeader>

        <form onSubmit={handleSubmitNewClaim} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <label className="text-sm font-medium">Claim ID</label>
              <Input value={claimId} readOnly className="bg-muted h-10" />
            </div>

            <div className="col-span-2 space-y-1">
              <label className="text-sm font-medium">Created By (SC Staff)</label>
              <Input value={currentUser.fullName} disabled className="bg-muted h-10" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Customer Phone *</label>
              <Input
                placeholder="Enter customer phone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
                className="h-10"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Customer Name</label>
              <Input placeholder="Auto-filled" value={customerName} disabled className="bg-muted h-10" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Vehicle VIN *</label>
              <Select value={selectedVin} onValueChange={setSelectedVin} required>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={loadingVehicles ? "Loading..." : "Select vehicle"} />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((v) => (
                    <SelectItem key={v.vin} value={v.vin}>
                      {v.vin}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Vehicle Model</label>
              <Input placeholder="Auto-filled" value={vehicleModel} disabled className="bg-muted h-10" />
            </div>

            {/* Technician */}
            <div className="col-span-2 space-y-1">
              <label className="text-sm font-medium">Assign to Technician *</label>
              {technicians.length > 0 ? (
                <Select value={selectedTechnician} onValueChange={setSelectedTechnician} required>
                  <SelectTrigger className="h-10">
                    <SelectValue
                      placeholder={loadingTechnicians ? "Loading..." : "Select technician"}
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    {technicians.map((t) => (
                      <SelectItem key={t.accountId} value={t.accountId}>
                        {t.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm italic text-red-500">
                  ⚠ No technician available in your service center.
                </p>
              )}
            </div>

            {/* Campaign */}
            <div className="col-span-2 space-y-2 border-t pt-3">
              <label className="text-sm font-medium">Campaign (if available)</label>
              {campaignFound ? (
                <div className="flex items-center justify-between gap-3">
                  <Select
                    value={selectedCampaign}
                    onValueChange={setSelectedCampaign}
                    disabled={!isCampaignChecked}
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Select campaign" />
                    </SelectTrigger>
                    <SelectContent>
                      {campaigns.map((c) => (
                        <SelectItem key={c.campaignId} value={c.campaignId.toString()}>
                          {c.campaignName} ({c.startDate} → {c.endDate})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={isCampaignChecked}
                      onCheckedChange={(checked) => setIsCampaignChecked(checked)}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-sm italic text-muted-foreground">Not found campaigns</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Issue Description *</label>
            <textarea
              className="w-full min-h-[100px] px-3 py-2 text-sm border rounded-md resize-none"
              placeholder="Describe the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-3 sticky bottom-0 bg-white py-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-black hover:bg-gray-800 text-white" disabled={loading}>
              {loading ? "Creating..." : "Create Claim"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
