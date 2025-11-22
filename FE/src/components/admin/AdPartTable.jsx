import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

const ROWS_PER_PAGE = 6;

export default function PartsTable({ parts, onRowClick, loading }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = ROWS_PER_PAGE;

  const filteredParts = useMemo(() => {
    return parts.filter(
      (part) =>
        part.partName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.partId?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [parts, searchTerm]);

  const totalPages = Math.ceil(filteredParts.length / rowsPerPage);
  const paginatedParts = filteredParts.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const formatCurrency = (val) => {
    if (!val) return "0 VND";
    return Number(val).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  return (
    <Card className="w-full shadow-sm border">
      <CardHeader className="p-4 md:p-6 pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg sm:text-xl">
              Parts Inventory
            </CardTitle>
            <CardDescription>List of all registered parts.</CardDescription>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search parts..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 w-full"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <>
            <div className="w-full overflow-x-auto">
              <Table className="min-w-[800px] w-full">
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="pl-4 w-[120px]">Part ID</TableHead>
                    <TableHead className="w-[200px]">Name</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Models</TableHead>
                    <TableHead className="text-right pr-4">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedParts.length > 0 ? (
                    paginatedParts.map((part) => (
                      <TableRow
                        key={part.id || part.partId}
                        onClick={() => onRowClick(part)}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-medium pl-4">
                          {part.partId}
                        </TableCell>
                        <TableCell className="font-medium">
                          {part.partName}
                        </TableCell>
                        <TableCell>{part.partBrand}</TableCell>
                        <TableCell>{formatCurrency(part.price)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(part.vehicleModel) ? (
                              part.vehicleModel.slice(0, 2).map((m, i) => (
                                <Badge
                                  key={i}
                                  variant="secondary"
                                  className="text-[10px]"
                                >
                                  {m}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                {part.vehicleModel}
                              </span>
                            )}
                            {Array.isArray(part.vehicleModel) &&
                              part.vehicleModel.length > 2 && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px]"
                                >
                                  +{part.vehicleModel.length - 2}
                                </Badge>
                              )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-4">
                          <Badge
                            className={
                              part.isPartEnable ? "bg-green-500" : "bg-gray-500"
                            }
                          >
                            {part.isPartEnable ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-10 text-muted-foreground"
                      >
                        No parts found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 py-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <span className="text-sm font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
