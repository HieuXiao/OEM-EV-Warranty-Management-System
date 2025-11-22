// FE/src/components/admin/AdUserEdit.jsx

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useEffect } from "react";

export default function AdUserEdit({
  open,
  onClose,
  formData,
  onChange,
  onSubmit,
  user,
  setFormData,
}) {
  useEffect(() => {
    if (user) {
      setFormData({
        id: user.accountId,
        username: user.username,
        fullname: user.fullName,
        gender: user.gender ? "male" : "female",
        email: user.email,
        phone: user.phone || "",
      });
    }
  }, [user]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/* CHỈNH SỬA: Responsive Modal */}
      <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-xl">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Update account information</DialogDescription>
        </DialogHeader>

        {/* CHỈNH SỬA: Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
          <div className="grid gap-2 sm:col-span-2">
            <Label>Username</Label>
            <Input value={formData.username} disabled className="bg-muted" />
          </div>

          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="fullname">Full Name</Label>
            <Input
              id="fullname"
              name="fullname"
              value={formData.fullname}
              onChange={onChange}
            />
          </div>

          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              value={formData.email}
              onChange={onChange}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={onChange}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={formData.gender}
              onValueChange={(v) => setFormData((p) => ({ ...p, gender: v }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button onClick={onSubmit} className="w-full sm:w-auto">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
