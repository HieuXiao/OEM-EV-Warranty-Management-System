import { useEffect, useState } from "react";
import axiosPrivate from "@/api/axios";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function AdSCAssign({ center, onAssigned, onCancel }) {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await axiosPrivate.get("/api/accounts/");
      const list = res.data || [];
      // filter only sc_staff or sc_technician
      const filtered = list.filter((a) => {
        const role = (a.roleName || "").toLowerCase();
        return role === "sc_staff" || role === "sc_technician";
      });
      setAccounts(filtered);
    } catch (err) {
      console.error("Failed to fetch accounts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleAssign = async () => {
    if (!selectedAccount) return;
    try {
      setSubmitting(true);
      await axiosPrivate.put(`/api/account-center/assign/${selectedAccount}/${center.centerId}`);
      onAssigned(selectedAccount, center.centerId);
    } catch (err) {
      console.error("Assign failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <DialogHeader>
        <DialogTitle>Assign Staff to {center.centerName}</DialogTitle>
        <DialogDescription>Select an account to assign to this center (only SC staff & technicians)</DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label>Choose Account</Label>
          <Select onValueChange={(v) => setSelectedAccount(v)}>
            <SelectTrigger>
              <SelectValue placeholder={loading ? "Loading..." : "Select account"} />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((a) => (
                <SelectItem key={a.accountId} value={a.accountId}>{`${a.accountId} — ${a.fullName || a.username}`}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleAssign} disabled={submitting || !selectedAccount}>{submitting ? "Assigning..." : "Assign"}</Button>
      </DialogFooter>
    </div>
  );
}