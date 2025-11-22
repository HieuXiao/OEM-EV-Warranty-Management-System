import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export default function PoliciesTable({
  policies,
  parts,
  onToggle,
  onSelectPolicy,
}) {
  const getPartName = (partId) => {
    return parts.find((p) => p.id === partId)?.partName || "Unknown";
  };

  return (
    <Card className="w-full overflow-hidden">
      {/* CHỈNH SỬA: Wrapper cuộn ngang */}
      <div className="w-full overflow-x-auto">
        <Table className="min-w-[800px]">
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[100px]">Policy ID</TableHead>
              <TableHead className="w-[200px]">Policy Name</TableHead>
              <TableHead className="w-[150px]">Part</TableHead>
              <TableHead className="w-[120px]">Available Year</TableHead>
              <TableHead className="w-[120px]">Kilometer</TableHead>
              <TableHead className="w-[100px] text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {policies.length > 0 ? (
              policies.map((policy) => (
                <TableRow
                  key={policy.id}
                  onClick={() => onSelectPolicy(policy)}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="font-medium">
                    {policy.policyId}
                  </TableCell>
                  <TableCell>{policy.policyName}</TableCell>
                  <TableCell>{getPartName(policy.partId)}</TableCell>
                  <TableCell>{policy.availableYear} years</TableCell>
                  <TableCell>
                    {Number(policy.kilometer).toLocaleString()} km
                  </TableCell>
                  <TableCell
                    className="text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Switch
                      checked={policy.enabled}
                      onCheckedChange={() => onToggle(policy.id)}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center h-24 text-muted-foreground"
                >
                  No policies found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
