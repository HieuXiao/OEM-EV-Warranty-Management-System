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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Update account information</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          {[
            { id: "fullname", label: "Full Name" },
            { id: "email", label: "Email" },
            { id: "phone", label: "Phone Number" },
          ].map((field) => (
            <div className="grid gap-2" key={field.id}>
              <Label htmlFor={field.id}>{field.label}</Label>
              <Input
                id={field.id}
                name={field.id}
                value={formData[field.id]}
                onChange={onChange}
                placeholder={field.label}
              />
            </div>
          ))}

          <div className="grid gap-2">
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={formData.gender}
              onValueChange={(v) => setFormData((p) => ({ ...p, gender: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
