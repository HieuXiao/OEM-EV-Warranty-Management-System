// File: src/pages/AdminServiceCenter.jsx
import { useEffect, useState } from "react";
import Sidebar from "@/components/admin/AdminSidebar";
import Header from "@/components/Header";
import axiosPrivate from "@/api/axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, MoreVertical, Edit } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import AdSCEdit from "@/components/admin/AdSCEdit";
import AdSCAssign from "@/components/admin/AdSCAssign";
import AdSCRemove from "@/components/admin/AdSCRemove";

export default function AdminServiceCenter() {
  const [centers, setCenters] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // dialogs state
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [openAssign, setOpenAssign] = useState(false);
  const [openRemove, setOpenRemove] = useState(false);

  const fetchCenters = async () => {
    try {
      setLoading(true);
      const res = await axiosPrivate.get("/api/service_centers/");
      setCenters(res.data || []);
    } catch (err) {
      console.error("Failed to load centers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCenters();
  }, []);

  const filtered = centers.filter((c) =>
    [c.centerName, c.location].join(" ").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onEditSaved = (updated) => {
    // update local list
    setCenters((prev) => prev.map((p) => (p.centerId === updated.centerId ? updated : p)));
    setOpenEdit(false);
    setSelectedCenter(null);
  };

  const onAssignSuccess = (accountId, centerId) => {
    // optionally refresh centers or just fetch again
    fetchCenters();
    setOpenAssign(false);
    setSelectedCenter(null);
  };

  const onRemoveSuccess = (accountId) => {
    fetchCenters();
    setOpenRemove(false);
    setSelectedCenter(null);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <div className="p-4 md:p-6 lg:p-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Service Centers</h1>
                <p className="text-muted-foreground mt-1">Manage service centers and staff assignments</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search centers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8" />
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Service Centers</CardTitle>
                <CardDescription>List of centers retrieved from server</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Loading...</p>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Center ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.map((c) => (
                          <TableRow key={c.centerId}>
                            <TableCell>
                              <div className="font-medium">{c.centerId}</div>
                            </TableCell>
                            <TableCell>{c.centerName}</TableCell>
                            <TableCell className="text-muted-foreground">{c.location}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => { setSelectedCenter(c); setOpenEdit(true); }}>
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => { setSelectedCenter(c); setOpenAssign(true); }}>
                                    Assign Staff
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => { setSelectedCenter(c); setOpenRemove(true); }}>
                                    Remove Staff
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={openEdit} onOpenChange={(open) => { if (!open) { setOpenEdit(false); setSelectedCenter(null); } }}>
              <DialogContent className="sm:max-w-[600px]">
                {selectedCenter && (
                  <AdSCEdit center={selectedCenter} onSaved={onEditSaved} onCancel={() => { setOpenEdit(false); setSelectedCenter(null); }} />
                )}
              </DialogContent>
            </Dialog>

            {/* Assign Dialog */}
            <Dialog open={openAssign} onOpenChange={(open) => { if (!open) { setOpenAssign(false); setSelectedCenter(null); } }}>
              <DialogContent className="sm:max-w-[600px]">
                {selectedCenter && (
                  <AdSCAssign center={selectedCenter} onAssigned={onAssignSuccess} onCancel={() => { setOpenAssign(false); setSelectedCenter(null); }} />
                )}
              </DialogContent>
            </Dialog>

            {/* Remove Dialog */}
            <Dialog open={openRemove} onOpenChange={(open) => { if (!open) { setOpenRemove(false); setSelectedCenter(null); } }}>
              <DialogContent className="sm:max-w-[600px]">
                {selectedCenter && (
                  <AdSCRemove center={selectedCenter} onRemoved={onRemoveSuccess} onCancel={() => { setOpenRemove(false); setSelectedCenter(null); }} />
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}