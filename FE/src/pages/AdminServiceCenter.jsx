// FE/src/pages/AdminServiceCenter.jsx
import { useEffect, useState } from "react";
import Sidebar from "@/components/admin/AdminSidebar";
import Header from "@/components/Header";
import axiosPrivate from "@/api/axios";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

//Import Components
import AdServTable from "@/components/admin/AdServTable.jsx";
import AdServCreate from "@/components/admin/AdServCreate.jsx";
import AdServEdit from "@/components/admin/AdServEdit.jsx";

const CENTER_URL = "/api/service-centers";

export default function AdminServiceCenter() {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(false);

  // dialogs state
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const fetchCenters = async () => {
    try {
      setLoading(true);
      const res = await axiosPrivate.get(CENTER_URL);
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

  // Callbacks
  const onCreatedSuccess = () => {
    fetchCenters();
    setOpenCreate(false);
  };

  const onEditSaved = (updated) => {
    setCenters((prev) =>
      prev.map((p) => (p.centerId === updated.centerId ? updated : p))
    );
    setOpenEdit(false);
    setSelectedCenter(null);
  };

  const handleEdit = (center) => {
    setSelectedCenter(center);
    setOpenEdit(true);
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
                <h1 className="text-3xl font-bold text-foreground">
                  Service Centers
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage service centers
                </p>
              </div>
              <Button onClick={() => setOpenCreate(true)}>
                + Create New Center
              </Button>
            </div>

            {/* Table */}
            <AdServTable
              centers={centers}
              loading={loading}
              onEdit={handleEdit}
              // Nếu chưa có Assign/Remove thì tạm thời để trống
              onAssign={() => alert("Assign feature coming soon")}
              onRemove={() => alert("Remove feature coming soon")}
            />

            {/* Create Dialog */}
            <Dialog open={openCreate} onOpenChange={setOpenCreate}>
              <DialogContent className="sm:max-w-[500px]">
                <AdServCreate
                  onCreateSuccess={onCreatedSuccess}
                  onCancel={() => setOpenCreate(false)}
                />
              </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog
              open={openEdit}
              onOpenChange={(open) => {
                if (!open) {
                  setOpenEdit(false);
                  setSelectedCenter(null);
                }
              }}
            >
              <DialogContent className="sm:max-w-[600px]">
                {selectedCenter ? (
                  <AdServEdit
                    center={selectedCenter}
                    onSaved={onEditSaved}
                    onCancel={() => {
                      setOpenEdit(false);
                      setSelectedCenter(null);
                    }}
                  />
                ) : (
                  <p>Loading center data...</p>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
