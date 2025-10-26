// FE/src/components/admin/AdUserDetail.jsx

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Trash2, Pencil } from "lucide-react"

export default function AdminUserDetail({ open, onClose, user, onToggleStatus, onEdit }) {
  if (!user) return null

  const {
    accountId,
    username,
    fullName,
    gender,
    email,
    phone,
    token,
    roleName,
    enabled,
    serviceCenter,
  } = user

  const safe = (val) => (val === null || val === undefined || val === "" ? "--" : val)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">User Details</DialogTitle>
          <DialogDescription>View and manage user information</DialogDescription>
        </DialogHeader>

        {/* ===== Account Information ===== */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg mt-2">Account Information</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1">
              <label className="text-sm font-medium">Account ID</label>
              <Input value={safe(accountId)} readOnly />
            </div>

            <div className="grid gap-1">
              <label className="text-sm font-medium">Username</label>
              <Input value={safe(username)} readOnly />
            </div>

            <div className="grid gap-1">
              <label className="text-sm font-medium">Full Name</label>
              <Input value={safe(fullName)} readOnly />
            </div>

            <div className="grid gap-1">
              <label className="text-sm font-medium">Gender</label>
              <Input value={gender === true ? "Male" : gender === false ? "Female" : "--"} readOnly />
            </div>

            <div className="grid gap-1">
              <label className="text-sm font-medium">Email</label>
              <Input value={safe(email)} readOnly />
            </div>

            <div className="grid gap-1">
              <label className="text-sm font-medium">Phone</label>
              <Input value={safe(phone)} readOnly />
            </div>

            <div className="grid gap-1">
              <label className="text-sm font-medium">Role</label>
              <Input value={safe(roleName)} readOnly />
            </div>

            <div className="grid gap-1">
              <label className="text-sm font-medium">Status</label>
              <Input value={enabled ? "Enabled" : "Disabled"} readOnly />
            </div>
            
          </div>
        </div>

        <Separator className="my-4" />

        {/* ===== Service Center Information ===== */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Service Center Information</h3>
          {serviceCenter ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <label className="text-sm font-medium">Center ID</label>
                <Input value={safe(serviceCenter.centerId)} readOnly />
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-medium">Center Name</label>
                <Input value={safe(serviceCenter.centerName)} readOnly />
              </div>

              <div className="col-span-2 grid gap-1">
                <label className="text-sm font-medium">Location</label>
                <Input value={safe(serviceCenter.location)} readOnly />
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No service center assigned.</p>
          )}
        </div>

      </DialogContent>
    </Dialog>
  )
}
