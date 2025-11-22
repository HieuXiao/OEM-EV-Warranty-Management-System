import { useState, useMemo } from "react";
import { Search, Edit, MapPin, Loader2 } from "lucide-react";
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

export default function AdServTable({ centers, loading, onEdit, onRowClick }) {
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
    <Card className="pt-4 px-2 sm:px-4 pb-4 shadow-sm border">
      <CardHeader className="px-2 sm:px-6 pb-4">
        {/* Header Responsive: Stack on mobile */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg sm:text-xl">
              All Service Centers
            </CardTitle>
            <CardDescription>Manage service centers locations.</CardDescription>
          </div>

          {/* Search Bar Full Width on Mobile */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search centers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 px-0 sm:px-4">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500 mr-2" />
            <span className="text-gray-600">Loading service centers...</span>
          </div>
        ) : hasResults ? (
          // Table Wrapper with horizontal scroll
          <div className="w-full overflow-x-auto rounded-md border mx-4 sm:mx-0">
            <Table className="min-w-[600px]">
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead className="w-[200px]">Center Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right w-[100px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAndFilteredCenters.map((c) => (
                  <TableRow
                    key={c.centerId}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => onRowClick && onRowClick(c)}
                  >
                    <TableCell className="font-medium text-gray-600">
                      {c.centerId}
                    </TableCell>
                    <TableCell className="font-medium">
                      {c.centerName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center min-w-[200px]">
                        <MapPin className="mr-2 h-4 w-4 text-primary shrink-0" />
                        <span className="truncate">{c.location}</span>
                      </div>
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
                        className="h-8 w-8"
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
            <h3 className="text-xl font-semibold text-muted-foreground">
              No Centers Found
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Your search term "{searchQuery}" did not match any centers.
            </p>
            {searchQuery && (
              <Button
                variant="link"
                onClick={() => setSearchQuery("")}
                className="mt-2"
              >
                Clear Search
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
