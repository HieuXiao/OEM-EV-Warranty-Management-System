import { useEffect, useState } from "react";
import axiosPrivate from "@/api/axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Loader2, MapPin } from "lucide-react";

export default function AdServDetail({ center, onBack }) {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStaff = async () => {
      if (!center?.centerId) return;
      try {
        setLoading(true);
        const res = await axiosPrivate.get("/api/accounts/");
        const data = res.data || [];

        const filtered = data.filter(
          (acc) => acc.serviceCenter?.centerId === center.centerId
        );
        setStaffList(filtered);
      } catch (error) {
        console.error("Failed to fetch staff", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, [center]);

  if (!center) return null;

  return (
    <Card className="shadow-sm border">
      <CardHeader className="flex flex-col sm:flex-row items-start justify-between gap-4 pb-4">
        <div>
          <CardTitle className="text-xl sm:text-2xl font-bold">
            {center.centerName}
          </CardTitle>
          <CardDescription className="flex items-center mt-1 text-sm sm:text-base">
            <MapPin className="mr-1 h-4 w-4 text-muted-foreground" />
            {center.location}
          </CardDescription>
        </div>
        <Button variant="outline" onClick={onBack} className="shrink-0">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </CardHeader>

      <CardContent>
        <Separator className="my-4" />

        <h3 className="text-lg font-semibold mb-4">
          Staff Members ({staffList.length})
        </h3>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500 mr-2" />
            <span className="text-gray-600">Loading staff...</span>
          </div>
        ) : staffList.length === 0 ? (
          <p className="text-muted-foreground italic">
            No staff assigned to this center.
          </p>
        ) : (
          // Responsive Table Wrapper
          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-[700px]">
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffList.map((s) => (
                  <TableRow key={s.accountId} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{s.fullName}</TableCell>
                    <TableCell>{s.email}</TableCell>
                    <TableCell>{s.phone}</TableCell>
                    <TableCell className="capitalize text-muted-foreground">
                      {s.roleName?.replace("_", " ")}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${
                          s.enabled
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {s.enabled ? "Active" : "Disabled"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
