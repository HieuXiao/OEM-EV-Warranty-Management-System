// FE/src/components/admin/AdUserDetail.jsx

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Trash2, Pencil } from "lucide-react" 

/**
 * AdminUserDetail Component
 * Displays a non-editable dialog with the detailed information of a selected user.
 *
 * @param {boolean} open - Controls the visibility of the dialog.
 * @param {function} onClose - Handler to close the dialog.
 * @param {Object} user - The currently selected user object.
 * @param {function} onToggleStatus - Handler to toggle user status (passed to actions).
 * @param {function} onEdit - Handler to open the edit dialog (passed to actions).
 */

export default function AdminUserDetail({ open, onClose, user, onToggleStatus, onEdit }) {
  // If no user is selected, return null to prevent rendering errors.
  if (!user) return null

  // Destructure user properties for cleaner access
  const {
    accountId,
    username,
    fullName,
    gender,
    email,
    phone,
    roleName,
    enabled,
    serviceCenter,
  } = user

  /**
   * Utility function to display a default placeholder if the value is null, undefined, or empty.
   * @param {*} val - The value to check.
   * @returns {string} The original value or a placeholder.
   */
  const safe = (val) => (val === null || val === undefined || val === "" ? "--" : val)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">User Details</DialogTitle>
          <DialogDescription>View user's comprehensive profile and account status</DialogDescription>
        </DialogHeader>

        {/* ===== Account Information Section ===== */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg mt-2">Account Information</h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Account ID (Required field for identification) */}
            <div className="grid gap-1">
              <label className="text-sm font-medium">Account ID</label>
              <Input value={safe(accountId)} readOnly />
            </div>

            {/* Username */}
            <div className="grid gap-1">
              <label className="text-sm font-medium">Username</label>
              <Input value={safe(username)} readOnly />
            </div>

            {/* Full Name */}
            <div className="grid gap-1">
              <label className="text-sm font-medium">Full Name</label>
              <Input value={safe(fullName)} readOnly />
            </div>

            {/* Gender */}
            <div className="grid gap-1">
              <label className="text-sm font-medium">Gender</label>
              <Input 
                value={gender === true ? "Male" : gender === false ? "Female" : "--"} 
                readOnly 
              />
            </div>

            {/* Email */}
            <div className="grid gap-1">
              <label className="text-sm font-medium">Email</label>
              <Input value={safe(email)} readOnly />
            </div>

            {/* Phone */}
            <div className="grid gap-1">
              <label className="text-sm font-medium">Phone</label>
              <Input value={safe(phone)} readOnly />
            </div>

            {/* Role */}
            <div className="grid gap-1">
              <label className="text-sm font-medium">Role</label>
              <Input value={safe(roleName)} readOnly />
            </div>

            {/* Status */}
            <div className="grid gap-1">
              <label className="text-sm font-medium">Status</label>
              <Input value={enabled ? "Enabled" : "Disabled"} readOnly />
            </div>
            
          </div>
        </div>

        <Separator className="my-4" />

        {/* ===== Service Center Information Section ===== */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Service Center Information</h3>
          {serviceCenter ? (
            <div className="grid grid-cols-2 gap-4">
              {/* Center ID */}
              <div className="grid gap-1">
                <label className="text-sm font-medium">Center ID</label>
                <Input value={safe(serviceCenter.centerId)} readOnly />
              </div>

              {/* Center Name */}
              <div className="grid gap-1">
                <label className="text-sm font-medium">Center Name</label>
                <Input value={safe(serviceCenter.centerName)} readOnly />
              </div>

              {/* Location (Spans two columns) */}
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
