// FE/src/components/admin/AdPoliTable.jsx

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

export default function PoliciesTable({ policies, parts, onToggle, onSelectPolicy }) {
  const getPartName = (partId) => {
    return parts.find((p) => p.id === partId)?.partName || "Unknown"
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Policy ID</TableHead>
            <TableHead>Policy Name</TableHead>
            <TableHead>Part</TableHead>
            <TableHead>Available Year</TableHead>
            <TableHead>Kilometer</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {policies.map((policy) => (
            <TableRow
              key={policy.id}
              onClick={() => onSelectPolicy(policy)}
              className="cursor-pointer hover:bg-muted/50"
            >
              <TableCell className="font-medium">{policy.policyId}</TableCell>
              <TableCell>{policy.policyName}</TableCell>
              <TableCell>{getPartName(policy.partId)}</TableCell>
              <TableCell>{policy.availableYear} years</TableCell>
              <TableCell>{policy.kilometer.toLocaleString()} km</TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Switch checked={policy.enabled} onCheckedChange={() => onToggle(policy.id)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
