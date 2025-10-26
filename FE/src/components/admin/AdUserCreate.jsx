//FE/src/components/admin/AdUserCreate.jsx

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

export default function AdUserCreate({
  open,
  onClose,
  onReset,
  formData,
  onChange,
  onSubmit,
}) {
  const fields = [
    { id: "id", label: "Account ID", placeholder: "e.g. ad000001" },
    { id: "username", label: "Username", placeholder: "e.g. john_doe" },
    { id: "password", label: "Password", placeholder: "Enter password" },
    { id: "fullname", label: "Full Name", placeholder: "e.g. John Doe" },
    { id: "email", label: "Email", placeholder: "e.g. john@example.com" },
    { id: "phone", label: "Phone", placeholder: "e.g. 0987654321" },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>Create a new user account</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          {fields.map((f) => (
            <div className="grid gap-2" key={f.id}>
              <Label htmlFor={f.id}>{f.label}</Label>
              <Input
                id={f.id}
                name={f.id}
                value={formData[f.id]}
                onChange={onChange}
                placeholder={f.placeholder}
              />
            </div>
          ))}

          <div className="grid gap-2">
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={formData.gender}
              onValueChange={(v) =>
                onChange({ target: { name: "gender", value: v } })
              }
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
          <Button
            variant="outline"
            onClick={() => {
              onClose();
              onReset && onReset();
            }}
          >
            Cancel
          </Button>

          <Button className="gap-2" onClick={onSubmit}>
            Create
          </Button>

        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
