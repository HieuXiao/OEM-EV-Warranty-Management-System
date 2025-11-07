"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

/**
 * Modal để chỉnh sửa chi tiết chính sách và trạng thái kích hoạt (Enabled).
 * @param {object} policy - Dữ liệu chính sách hiện tại.
 * @param {boolean} open - Trạng thái hiển thị modal.
 * @param {function} onOpenChange - Callback khi modal thay đổi trạng thái.
 * @param {function} onSave - Callback khi lưu chính sách.
 * @param {number} activePoliciesCount - Số lượng chính sách đang được kích hoạt cho part tương ứng (KHÔNG bao gồm chính sách hiện tại).
 */
export default function PolicyEditModal({ policy, open, onOpenChange, onSave, activePoliciesCount }) {
  const [formData, setFormData] = useState(null)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (policy) {
      setFormData({
        policyId: policy.policyId,
        policyName: policy.policyName,
        availableYear: policy.availableYear,
        kilometer: policy.kilometer,
        enabled: policy.enabled, // Trạng thái cần theo dõi thay đổi
      })
    }
    setHasChanges(false)
  }, [policy, open])

  if (!formData) return null

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)

    // Kiểm tra xem có bất kỳ trường nào khác với dữ liệu gốc không
    const isChanged =
      updated.policyName !== policy.policyName ||
      Number(updated.availableYear) !== policy.availableYear ||
      Number(updated.kilometer) !== policy.kilometer ||
      updated.enabled !== policy.enabled

    setHasChanges(isChanged)
  }

  const handleSave = () => {
    // ⚠️ BUSINESS RULE CHECK: Ngăn kích hoạt nếu đã có 1 chính sách khác đang enabled
    if (formData.enabled && !policy.enabled) {
      // Nếu đang cố gắng bật (enable) chính sách
      if (activePoliciesCount > 0) {
        alert(
          `Lỗi Nghiệp vụ: Phụ tùng ${policy.partId} đã có 1 chính sách khác đang kích hoạt (${activePoliciesCount} chính sách). Vui lòng tắt chính sách hiện tại trước khi kích hoạt chính sách này.`,
        )
        // Ngăn lưu, reset lại trạng thái enabled về ban đầu
        setFormData((prev) => ({ ...prev, enabled: false }))
        setHasChanges(true) // Vẫn có thay đổi ở các trường khác (nếu có)
        return
      }
    }

    // Gọi hàm lưu từ component cha
    onSave({
      ...policy, // Giữ lại các thuộc tính không hiển thị trên form
      policyName: formData.policyName,
      availableYear: Number(formData.availableYear),
      kilometer: Number(formData.kilometer),
      enabled: formData.enabled,
    })

    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Policy: {formData.policyId}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Policy Name</Label>
              <Input value={formData.policyName} onChange={(e) => handleChange("policyName", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Available Year</Label>
              <Input
                type="number"
                value={formData.availableYear}
                onChange={(e) => handleChange("availableYear", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Kilometer</Label>
              <Input
                type="number"
                value={formData.kilometer}
                onChange={(e) => handleChange("kilometer", e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-md">
            <Label htmlFor="policy-enabled-switch">Status: {formData.enabled ? "Kích hoạt" : "Vô hiệu hóa"}</Label>
            <Switch
              id="policy-enabled-switch"
              checked={formData.enabled}
              onCheckedChange={(checked) => handleChange("enabled", checked)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            Save Policy
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
