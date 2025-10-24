import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import axiosPrivate from "@/api/axios"

export default function ScsWarrCreate({ isOpen, onOpenChange, currentUser, onClaimCreated }) {
  const [loading, setLoading] = useState(false)
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [vehicles, setVehicles] = useState([])
  const [selectedVin, setSelectedVin] = useState("")
  const [vehicleModel, setVehicleModel] = useState("")
  const [scTechnicianId, setScTechnicianId] = useState("")
  const [description, setDescription] = useState("")
  const [loadingVehicles, setLoadingVehicles] = useState(false)

  useEffect(() => {
    if (customerPhone.length >= 10) {
      const fetchVehicles = async () => {
        try {
          setLoadingVehicles(true)
          const response = await axiosPrivate.get(`/api/vehicle/customer/${customerPhone}`)
          const data = response.data
          setVehicles(Array.isArray(data) ? data : [])

          if (data && data.length > 0 && data[0].customer) {
            setCustomerName(data[0].customer.customerName)
          }
        } catch (error) {
          console.error("Error fetching vehicles:", error)
        } finally {
          setLoadingVehicles(false)
        }
      }

      fetchVehicles()
    } else {
      setVehicles([])
      setCustomerName("")
      setSelectedVin("")
      setVehicleModel("")
    }
  }, [customerPhone])

  useEffect(() => {
    if (selectedVin) {
      const selected = vehicles.find((v) => v.vin === selectedVin)
      if (selected) {
        setVehicleModel(selected.model)
      }
    }
  }, [selectedVin, vehicles])

  const handleSubmitNewClaim = async (e) => {
    e.preventDefault()

    if (!selectedVin || !scTechnicianId || !description) {
      return
    }

    try {
      setLoading(true)
      await axiosPrivate.post("/api/warranty_claims/create", {
        vin: selectedVin,
        scStaffId: currentUser.id.toUpperCase(),
        scTechnicianId: scTechnicianId.toUpperCase(),
        policyId: 1,
        description,
        evmDescription: "deciding",
      })

      setCustomerPhone("")
      setCustomerName("")
      setVehicles([])
      setSelectedVin("")
      setVehicleModel("")
      setScTechnicianId("")
      setDescription("")

      onOpenChange(false)
      onClaimCreated?.()
    } catch (error) {
      console.error("Error creating claim:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Warranty Claim</DialogTitle>
          <p className="text-sm text-muted-foreground">Fill in the details to create a new warranty claim</p>
        </DialogHeader>

        <form onSubmit={handleSubmitNewClaim} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium">Created By (SC Staff)</label>
              <Input value={currentUser.name} disabled className="bg-muted" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Customer Phone *</label>
              <Input
                placeholder="e.g., 0901234567"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Customer Name</label>
              <Input placeholder="Auto-filled from phone" value={customerName} disabled className="bg-muted" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Vehicle VIN *</label>
              <Select value={selectedVin} onValueChange={setSelectedVin} required>
                <SelectTrigger className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md">
                  <SelectValue placeholder={loadingVehicles ? "Loading vehicles..." : "Select vehicle"} />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.vin} value={vehicle.vin}>
                      {vehicle.vin} - {vehicle.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Vehicle Model</label>
              <Input placeholder="Auto-filled from VIN" value={vehicleModel} disabled className="bg-muted" />
            </div>

            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium">Assign to Technician *</label>
              <Input
                placeholder="Enter technician ID"
                value={scTechnicianId}
                onChange={(e) => setScTechnicianId(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Issue Description *</label>
            <textarea
              className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background"
              placeholder="Describe the issue in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-3 justify-end">
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
