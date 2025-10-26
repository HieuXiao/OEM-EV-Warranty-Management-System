import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { mockParts } from "@/lib/Mock-data";

export default function EVMStaffDetailCampaign({
  open,
  onOpenChange,
  campaign,
}) {
  if (!campaign) return null;

  // compute collected percent: prefer completed/affected, fallback to collected/total
  let percent = 0;
  if (campaign.completedVehicles && campaign.affectedVehicles) {
    percent = Math.round(
      (campaign.completedVehicles / campaign.affectedVehicles) * 100
    );
  } else if (campaign.collected && campaign.total) {
    percent = Math.round((campaign.collected / campaign.total) * 100);
  } else if (campaign.collectedPercent) {
    percent = Math.round(campaign.collectedPercent);
  }

  const modelDisplay =
    Array.isArray(campaign.model) && campaign.model.length > 0
      ? campaign.model.join(", ")
      : campaign.model || "-";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Campaign Detail
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Campaign ID</Label>
            <div className="mt-1 font-medium">{campaign.campaignId || "-"}</div>
          </div>

          <div>
            <Label>Campaign Name</Label>
            <div className="mt-1">{campaign.campaignName || "-"}</div>
          </div>

          <div>
            <Label>Vehicle Models</Label>
            <div className="mt-1">{modelDisplay}</div>
          </div>

          <div>
            <Label>Description</Label>
            <div className="mt-1 whitespace-pre-wrap">
              {campaign.serviceDescription}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <div className="mt-1">{campaign.startDate}</div>
            </div>
            <div>
              <Label>Due Date</Label>
              <div className="mt-1">{campaign.endDate}</div>
            </div>
          </div>

          <div>
            <Label>Collected</Label>
            <div className="mt-2 w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="h-3 bg-primary"
                style={{ width: `${Math.min(Math.max(percent, 0), 100)}%` }}
              />
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {percent}% collected
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
