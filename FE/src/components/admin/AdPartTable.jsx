//  FE/src/components/admin/AdPartTable.jsx

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from "@/components/ui/card"

export default function PartsTable({ parts, onRowClick }) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Part Name</TableHead>
            <TableHead>Part Branch</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Vehicle Model</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parts.map((part) => (
            <TableRow
              key={part.id}
              onClick={() => onRowClick(part)}
              className="cursor-pointer hover:bg-muted/50"
            >
              <TableCell className="font-medium">{part.partName}</TableCell>
              <TableCell>{part.partBranch}</TableCell>
              <TableCell>{part.price.toLocaleString()} VND</TableCell>
              <TableCell>{part.vehicleModel}</TableCell>
              <TableCell className="text-muted-foreground">{part.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
