// FE/src/components/admin/AdWareTable.jsx

// ===============IMPORT================
// Import React Hooks
import { useState } from "react";

// Import Shadcn UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import Custom Components
import AdWareEdit from "@/components/admin/AdWareEdit";


export default function AdWareTable({
  warehouses,
  searchQuery,
  setSearchQuery,
  onEdit,
}) {


  // ===============State Management================
  // Stores the warehouse object currently being edited to open/close the dialog
  const [editingWarehouse, setEditingWarehouse] = useState(null); 
  const [formData, setFormData] = useState({
    whId: "",
    name: "",
    location: "",
  });
  

  // ===============LOGIC================ // 
  const filtered = warehouses.filter(
    (w) =>
      w.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  /**
   * Opens the edit dialog and sets the selected warehouse to state.
   * @param {object} w - The warehouse data selected for editing
   */
  const openEditDialog = (w) => {
    setEditingWarehouse(w); // Setting redundant formData for completeness, though AdWareEdit relies on its own fetch logic.
    setFormData({ whId: w.whId, name: w.name, location: w.location });
  };

  /**
   * Handles the successful save operation from the edit dialog.
   * @param {object} updatedData - The saved warehouse data returned from AdWareEdit
   */
  const handleSave = (updatedData) => {
    onEdit(updatedData); 
    setEditingWarehouse(null);
  };

  const handleCancel = () => setEditingWarehouse(null); 
  
  

  // ===============RENDER================
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Header Title */}
          <div>
            <CardTitle>All Warehouses</CardTitle>
            <CardDescription>Manage warehouse information</CardDescription>
          </div>
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search warehouses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Edit</TableHead>{" "}
                {/* Simplified column header */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((w, index) => (
                <TableRow key={w.whId}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{w.name}</TableCell>
                  <TableCell>{w.location}</TableCell>
                  {/* Edit Button */}
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(w)}
                      aria-label={`Edit warehouse ${w.name}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      {/* Edit Dialog Component */}
      <AdWareEdit
        open={!!editingWarehouse}
        formData={editingWarehouse}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </Card>
  );
}
