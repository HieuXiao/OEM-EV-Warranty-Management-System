// FE/src/components/admin/AdUserDetail.jsx

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function AdminUserDetail({ open, onClose, user }) {
  if (!user) return null;

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
  } = user;

  const safe = (val) => val || "—";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/* CHỈNH SỬA: Responsive Modal */}
      <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-xl">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid gap-4">
            {/* CHỈNH SỬA: Stack on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label className="text-sm font-medium text-muted-foreground">
                  Account ID
                </Label>
                <Input
                  value={safe(accountId)}
                  readOnly
                  className="bg-muted/50"
                />
              </div>
              <div className="grid gap-1">
                <Label className="text-sm font-medium text-muted-foreground">
                  Username
                </Label>
                <Input
                  value={safe(username)}
                  readOnly
                  className="bg-muted/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label className="text-sm font-medium text-muted-foreground">
                  Full Name
                </Label>
                <Input value={safe(fullName)} readOnly />
              </div>
              <div className="grid gap-1">
                <Label className="text-sm font-medium text-muted-foreground">
                  Gender
                </Label>
                <Input value={gender ? "Male" : "Female"} readOnly />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label className="text-sm font-medium text-muted-foreground">
                  Email
                </Label>
                <Input value={safe(email)} readOnly />
              </div>
              <div className="grid gap-1">
                <Label className="text-sm font-medium text-muted-foreground">
                  Phone
                </Label>
                <Input value={safe(phone)} readOnly />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label className="text-sm font-medium text-muted-foreground">
                  Role
                </Label>
                <Input value={safe(roleName)} readOnly />
              </div>
              <div className="grid gap-1">
                <Label className="text-sm font-medium text-muted-foreground">
                  Status
                </Label>
                <div
                  className={`flex items-center h-10 px-3 rounded-md border ${
                    enabled
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-red-50 border-red-200 text-red-700"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full mr-2 ${
                      enabled ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></span>
                  {enabled ? "Active" : "Inactive"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {(roleName?.toLowerCase() === "sc_staff" ||
          roleName?.toLowerCase() === "sc_technician") && (
          <>
            <Separator className="my-2" />
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">
                Service Center Information
              </h3>
              {serviceCenter ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-1">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Center ID
                    </Label>
                    <Input value={safe(serviceCenter.centerId)} readOnly />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Center Name
                    </Label>
                    <Input value={safe(serviceCenter.centerName)} readOnly />
                  </div>
                  <div className="sm:col-span-2 grid gap-1">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Location
                    </Label>
                    <Input value={safe(serviceCenter.location)} readOnly />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No service center assigned.
                </p>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
