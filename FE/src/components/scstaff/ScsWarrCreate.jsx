import { useEffect, useReducer } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import axiosPrivate from "@/api/axios"
import useAuth from "@/hook/useAuth"

const API = {
  CLAIMS: "/api/warranty-claims",
  CUSTOMERS: "/api/customers",
  VEHICLES: "/api/vehicles",
  ACCOUNTS: "/api/accounts/",
  CAMPAIGNS: "/api/campaigns/all",
  APPOINTMENTS: "/api/service-appointments",
}

const initialState = {
  loading: false,
  customerPhone: "",
  customerName: "",
  vehicles: [],
  selectedVin: "",
  vehicleModel: "",
  technicians: [],
  selectedTechnician: "",
  description: "",
  claimId: "",
  allCampaigns: [],
  campaigns: [],
  selectedCampaign: "",
  campaignFound: false,
  isCampaignChecked: false,
  manualVinMode: false,
  vinUnderWarranty: false,
  loadingVehicles: false,
  loadingTechnicians: false,
}

function reducer(state, action) {
  switch (action.type) {
    case "RESET_FORM":
      return { ...initialState }
    case "SET_FIELD":
      return { ...state, [action.field]: action.value }
    case "SET_MULTIPLE":
      return { ...state, ...action.payload }
    case "SET_LOADING":
      return { ...state, loading: action.value }
    case "SET_LOADING_VEHICLES":
      return { ...state, loadingVehicles: action.value }
    case "SET_LOADING_TECHNICIANS":
      return { ...state, loadingTechnicians: action.value }
    default:
      return state
  }
}

export default function ScsWarrCreate({ isOpen, onOpenChange, onClaimCreated }) {
  const { auth } = useAuth()
  const currentUser = auth

  const [state, dispatch] = useReducer(reducer, initialState)
  const {
    loading,
    customerPhone,
    customerName,
    vehicles,
    selectedVin,
    vehicleModel,
    technicians,
    selectedTechnician,
    description,
    claimId,
    allCampaigns,
    campaigns,
    selectedCampaign,
    campaignFound,
    isCampaignChecked,
    manualVinMode,
    vinUnderWarranty,
    loadingVehicles,
    loadingTechnicians,
  } = state

  useEffect(() => {
    if (isOpen) {
      dispatch({ type: "RESET_FORM" })
      fetchTechnicians()
      fetchCampaigns()
      generateClaimId()
    }
  }, [isOpen])

  const generateClaimId = async () => {
    const dateStr = new Date().toISOString().split("T")[0]
    try {
      const accountRes = await axiosPrivate.get(`${API.ACCOUNTS}${currentUser.accountId}`)
      const centerId = accountRes?.data?.serviceCenter?.centerId || "000"

      let nextSerial = "001"
      try {
        const res = await axiosPrivate.get(API.CLAIMS)
        const claims = Array.isArray(res.data) ? res.data : []
        const sameDay = claims.filter((c) => c.claimId?.includes(`WC-${centerId}-${dateStr}`))
        nextSerial = (sameDay.length + 1).toString().padStart(3, "0")
      } catch {}

      const newId = `WC-${centerId}-${dateStr}-${nextSerial}`
      dispatch({ type: "SET_FIELD", field: "claimId", value: newId })
    } catch (err) {
      console.error("Error generating claimId:", err)
      dispatch({ type: "SET_FIELD", field: "claimId", value: `WC-000-${dateStr}-001` })
    }
  }

  const fetchTechnicians = async () => {
    try {
      dispatch({ type: "SET_LOADING_TECHNICIANS", value: true })
      const accountDetailRes = await axiosPrivate.get(`${API.ACCOUNTS}${currentUser.accountId}`)
      const currentCenterId = accountDetailRes.data?.serviceCenter?.centerId
      if (!currentCenterId) return dispatch({ type: "SET_MULTIPLE", payload: { technicians: [] } })

      const res = await axiosPrivate.get(API.ACCOUNTS)
      const list = Array.isArray(res.data) ? res.data : []
      const techs = list.filter(
        (a) => a.roleName === "SC_TECHNICIAN" && a.enabled && String(a.serviceCenter?.centerId) === String(currentCenterId)
      )
      dispatch({ type: "SET_MULTIPLE", payload: { technicians: techs } })
    } catch (e) {
      console.error("Error fetching technicians:", e)
      dispatch({ type: "SET_MULTIPLE", payload: { technicians: [] } })
    } finally {
      dispatch({ type: "SET_LOADING_TECHNICIANS", value: false })
    }
  }

  const fetchCampaigns = async () => {
    try {
      const res = await axiosPrivate.get(API.CAMPAIGNS)
      dispatch({ type: "SET_FIELD", field: "allCampaigns", value: Array.isArray(res.data) ? res.data : [] })
    } catch (err) {
      console.error("Error fetching campaigns:", err)
      dispatch({ type: "SET_FIELD", field: "allCampaigns", value: [] })
    }
  }

  // Fetch customer & vehicles when phone changes
  useEffect(() => {
    if (!customerPhone) {
      dispatch({ type: "SET_MULTIPLE", payload: { customerName: "", vehicles: [], selectedVin: "", vehicleModel: "", manualVinMode: false } })
      return
    }

    const fetchData = async () => {
      try {
        dispatch({ type: "SET_LOADING_VEHICLES", value: true })
        const customersRes = await axiosPrivate.get(API.CUSTOMERS)
        const customers = Array.isArray(customersRes.data) ? customersRes.data : []
        const foundCustomer = customers.find((c) => String(c.customerPhone).trim() === String(customerPhone).trim())

        if (foundCustomer) {
          const vehiclesRes = await axiosPrivate.get(API.VEHICLES)
          const allVehicles = Array.isArray(vehiclesRes.data) ? vehiclesRes.data : []
          const relatedVehicles = allVehicles.filter((v) => v.customer?.customerId === foundCustomer.customerId)

          dispatch({
            type: "SET_MULTIPLE",
            payload: {
              customerName: foundCustomer.customerName || "",
              vehicles: relatedVehicles,
              manualVinMode: relatedVehicles.length === 0,
            },
          })
        } else {
          dispatch({ type: "SET_MULTIPLE", payload: { customerName: "", vehicles: [], manualVinMode: false } })
        }
      } catch (err) {
        console.error("Error fetching customer/vehicle data:", err)
        dispatch({ type: "SET_MULTIPLE", payload: { customerName: "", vehicles: [], manualVinMode: false } })
      } finally {
        dispatch({ type: "SET_LOADING_VEHICLES", value: false })
      }
    }
    fetchData()
  }, [customerPhone])

  // Update vehicleModel + campaigns when selectedVin changes
  useEffect(() => {
  if (!selectedVin) {
    dispatch({
      type: "SET_MULTIPLE",
      payload: { vehicleModel: "", campaignFound: false, selectedCampaign: "", isCampaignChecked: false },
    });
    return;
  }

  const selectedVehicle = manualVinMode ? null : vehicles.find((v) => v.vin === selectedVin);
  const model = manualVinMode ? state.vehicleModel : selectedVehicle?.model || "";

  const today = new Date();
  const matchedCampaigns = allCampaigns.filter((c) => {

    const modelMatch = Array.isArray(c.model) && c.model.includes(model);

    const start = new Date(c.startDate);
    const end = new Date(c.endDate);
    const dateMatch = today >= start && today <= end;
    return modelMatch && dateMatch;
  });

  dispatch({
    type: "SET_MULTIPLE",
    payload: {
      vehicleModel: model,
      campaigns: matchedCampaigns,
      campaignFound: matchedCampaigns.length > 0,
      selectedCampaign: matchedCampaigns.length > 0 ? matchedCampaigns[0].campaignId.toString() : "",
      isCampaignChecked: matchedCampaigns.length > 0,
    },
  });
}, [selectedVin, vehicles, allCampaigns, manualVinMode]);

  // Check VIN under warranty
  useEffect(() => {
    if (!selectedVin) return dispatch({ type: "SET_FIELD", field: "vinUnderWarranty", value: false })

    const checkVinWarranty = async () => {
      try {
        const claimRes = await axiosPrivate.get(API.CLAIMS)
        const claims = Array.isArray(claimRes.data) ? claimRes.data : []
        const related = claims.filter((c) => c.vin === selectedVin).sort((a, b) => new Date(b.claimDate) - new Date(a.claimDate))
        const underWarranty = related.length > 0 && related[0].status && related[0].status !== "DONE"
        dispatch({ type: "SET_FIELD", field: "vinUnderWarranty", value: underWarranty })
      } catch (err) {
        console.error("Error checking VIN warranty:", err)
        dispatch({ type: "SET_FIELD", field: "vinUnderWarranty", value: false })
      }
    }
    checkVinWarranty()
  }, [selectedVin])

  // Auto-create appointment
  useEffect(() => {
    const checkAndCreateAppointment = async () => {
      if (!isCampaignChecked || !selectedCampaign || !selectedVin) return
      try {
        const res = await axiosPrivate.get(API.APPOINTMENTS)
        const appointments = Array.isArray(res.data) ? res.data : []
        const last = appointments.filter((a) => a.vehicle?.vin === selectedVin).sort((a, b) => new Date(b.date) - new Date(a.date))[0]
        if (!last || last.status === "COMPLETED") {
          await axiosPrivate.post(API.APPOINTMENTS, {
            vin: selectedVin,
            campaignId: Number(selectedCampaign),
            date: new Date().toISOString(),
            description: "Auto-created from warranty claim",
          })
        }
      } catch (err) {
        console.error("Error creating appointment:", err)
      }
    }
    checkAndCreateAppointment()
  }, [isCampaignChecked, selectedCampaign, selectedVin])

  const handleSubmitNewClaim = async (e) => {
    e.preventDefault()
    if (!selectedVin) return alert("Please select or enter a vehicle VIN.")
    if (!technicians.length) return alert("No technicians available.")
    if (!selectedTechnician) return alert("Please assign a technician.")
    if (!description) return alert("Please enter a description.")

    try {
      dispatch({ type: "SET_LOADING", value: true })
      const finalClaimId = claimId || (await generateClaimId())
      const payload = {
        claimId: finalClaimId,
        vin: selectedVin,
        scStaffId: currentUser.accountId?.toUpperCase(),
        scTechnicianId: selectedTechnician.toUpperCase(),
        claimDate: new Date().toISOString().split("T")[0],
        description,
        campaignIds: isCampaignChecked && selectedCampaign ? [Number(selectedCampaign)] : null,
      }

      await axiosPrivate.post(API.CLAIMS, payload)
      dispatch({ type: "RESET_FORM" })
      onOpenChange(false)
      onClaimCreated?.()
    } catch (err) {
      console.error("Error creating claim:", err)
    } finally {
      dispatch({ type: "SET_LOADING", value: false })
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
                onChange={(e) => dispatch({ type: "SET_FIELD", field: "customerPhone", value: e.target.value })}
                required
                className="h-10"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Customer Name</label>
              <Input placeholder="Auto-filled" value={customerName} disabled className="bg-muted h-10" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Vehicle Plate *</label>
              {manualVinMode ? (
                <Input
                  placeholder="Enter VIN manually"
                  value={selectedVin}
                  onChange={(e) => dispatch({ type: "SET_FIELD", field: "selectedVin", value: e.target.value })}
                  className="h-10"
                />
              ) : (
                <Select value={selectedVin} onValueChange={(v) => dispatch({ type: "SET_FIELD", field: "selectedVin", value: v })} required>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder={loadingVehicles ? "Loading..." : "Select vehicle"} />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((v) => (
                      <SelectItem key={v.vin} value={v.vin}>
                        {v.plate || v.vin}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Vehicle Model</label>
              <Input placeholder="Auto-filled" value={vehicleModel} disabled className="bg-muted h-10" />
            </div>

            <div className="col-span-2 space-y-1">
              <label className="text-sm font-medium">Assign to Technician *</label>
              {technicians.length > 0 ? (
                <Select value={selectedTechnician} onValueChange={(v) => dispatch({ type: "SET_FIELD", field: "selectedTechnician", value: v })} required>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder={loadingTechnicians ? "Loading..." : "Select technician"} />
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
                <p className="text-sm italic text-red-500">No technician available in your service center.</p>
              )}
            </div>

            <div className="col-span-2 space-y-2 border-t pt-3">
              <label className="text-sm font-medium">Campaign (if available)</label>
              {campaignFound ? (
                <div className="flex items-center justify-between gap-3">
                  <Select
                    value={selectedCampaign}
                    onValueChange={(v) => dispatch({ type: "SET_FIELD", field: "selectedCampaign", value: v })}
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
                      onCheckedChange={(checked) => dispatch({ type: "SET_FIELD", field: "isCampaignChecked", value: checked })}
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
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "description", value: e.target.value })}
              required
            />
          </div>

          {vinUnderWarranty && (
            <p className="text-xs text-red-500 italic mt-1">
              This vehicle is currently under warranty.
            </p>
          )}

          <div className="flex justify-end gap-3 sticky bottom-0 bg-white py-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              className={`bg-black hover:bg-gray-800 text-white ${vinUnderWarranty ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={loading || vinUnderWarranty}
            >
              {loading ? "Creating..." : "Create Claim"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
