// FE/src/components/admin/AdServTable.jsx

import { useState, useMemo } from "react";
import { Search, Edit, MapPin } from "lucide-react"; 
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdServTable({
  centers,
  loading,
  onEdit,
  onRowClick,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = centers.filter((c) =>
    [c.centerName, c.location]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const sortedAndFilteredCenters = useMemo(() => {
    const sortableCenters = [...filtered]; 
    
    sortableCenters.sort((a, b) => a.centerId - b.centerId);
    
    return sortableCenters;
  }, [filtered]);

  const hasResults = sortedAndFilteredCenters.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>All Service Centers</CardTitle>
            <CardDescription>
              Click on a row to view details.
            </CardDescription>
          </div>
          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search centers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <p className="p-4 text-center text-lg text-primary">Loading service centers...</p>
        ) : hasResults ? (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead className="w-1/3">Center Name</TableHead>
                  <TableHead>Location Details</TableHead>
                  <TableHead className="text-right w-[150px]">Edit</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {sortedAndFilteredCenters.map((c) => (
                  <TableRow
                    key={c.centerId}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => onRowClick && onRowClick(c)}
                  >
                    {/* Center ID */}
                    <TableCell>
                      <div className="text-sm font-semibold text-gray-500">{c.centerId}</div>
                    </TableCell>
                    
                    {/* Center Name */}
                    <TableCell>
                      <div className="font-medium text-base text-foreground">{c.centerName}</div>
                    </TableCell>
                    
                    {/* Location */}
                    <TableCell className="text-sm text-muted-foreground flex items-center">
                      <MapPin className="mr-2 h-4 w-4 text-primary" />
                      {c.location}
                    </TableCell>

                    {/* Edit Button */}
                    <TableCell className="text-right">
                      <Button
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => {
                          e.stopPropagation(); 
                          onEdit(c);
                        }}
                        aria-label={`Edit center ${c.centerName}`}
                      >
                        <Edit className="h-4 w-4" /> 
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          // Empty State
          <div className="p-10 text-center">
            <h3 className="text-xl font-semibold text-muted-foreground">No Service Centers Found</h3>
            <p className="mt-2 text-sm text-gray-500">
              Your search term "{searchQuery}" did not match any centers.
            </p>
            {searchQuery && (
                <Button variant="link" onClick={() => setSearchQuery("")} className="mt-2">
                    Clear Search
                </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}