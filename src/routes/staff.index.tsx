import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api, API_BASE } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit2, Mail, Phone, Briefcase, Trash2 } from "lucide-react";

export const Route = createFileRoute("/staff/")({
  component: StaffManagement,
});

type StaffProfile = {
  id: number;
  name: string;
  email: string;
  mobileNumber?: string;
  linkedInUrl?: string;
  department?: string;
  specialization?: string;
  profilePhotoUrl?: string;
  designation?: {
    id: number;
    name: string;
  };
};

type Designation = {
  id: number;
  name: string;
};

function StaffManagement() {
  const { isAdmin, isStaff, user } = useAuth();
  const navigate = useNavigate();
  const [staffList, setStaffList] = useState<StaffProfile[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<StaffProfile>>({});
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!isAdmin && !isStaff) {
      toast.error("Unauthorized access");
      navigate({ to: "/dashboard" });
      return;
    }
    fetchStaff();
    fetchDesignations();
  }, [isAdmin, isStaff]);

  const fetchStaff = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/staff`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      if (res.ok) {
        setStaffList(await res.json());
      } else {
        toast.error("Failed to load staff");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  const fetchDesignations = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/staff/designations`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      if (res.ok) {
        setDesignations(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditClick = (staff: StaffProfile) => {
    setEditingId(staff.id);
    setFormData({ ...staff });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingId) return;

    try {
      const res = await fetch(`${API_BASE}/api/staff/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Staff details updated successfully");
        setDialogOpen(false);
        setEditingId(null);
        setFormData({});
        fetchStaff();
      } else {
        toast.error("Failed to update staff details");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to update staff details");
    }
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingId(null);
    setFormData({});
  };

  const handleDelete = async (staff: StaffProfile) => {
    if (!window.confirm(`Are you sure you want to delete ${staff.name}? This will also remove their user account.`)) {
      return;
    }
    try {
      await api.deleteStaff(staff.id);
      toast.success("Staff deleted successfully");
      fetchStaff();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to delete staff");
    }
  };

  if (!isAdmin && !isStaff) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate({ to: "/dashboard" })}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            {isAdmin ? "Staff Management" : "Staff Directory"}
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">{staffList.length} staff members</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">All Staff</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading staff...</p>
            </div>
          ) : staffList.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">No staff members found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2 lg:grid-cols-3">
              {staffList.map((staff) => (
                <div
                  key={staff.id}
                  className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-base leading-tight">{staff.name}</h3>
                      {staff.designation && (
                        <div className="mt-1 flex items-center gap-2">
                          <Briefcase className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {staff.designation.name}
                          </span>
                        </div>
                      )}
                      {staff.specialization && (
                        <div className="mt-1 text-xs font-medium text-primary">
                          {staff.specialization}
                        </div>
                      )}
                    </div>
                    {isAdmin && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(staff)}
                          className="h-8 w-8 p-0"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(staff)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {staff.department && (
                    <Badge variant="secondary" className="mb-3">
                      {staff.department}
                    </Badge>
                  )}

                  <div className="space-y-2 text-sm">
                    {staff.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        <span className="truncate">{staff.email}</span>
                      </div>
                    )}
                    {staff.mobileNumber && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{staff.mobileNumber}</span>
                      </div>
                    )}
                    {staff.linkedInUrl && (
                      <a
                        href={staff.linkedInUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-primary hover:underline"
                      >
                        <span className="text-xs">LinkedIn Profile</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Staff Details</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                id="mobile"
                value={formData.mobileNumber || ""}
                onChange={(e) =>
                  setFormData({ ...formData, mobileNumber: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department || ""}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="designation">Designation</Label>
              <Select
                value={formData.designation?.id?.toString() || ""}
                onValueChange={(val) => {
                  const desig = designations.find((d) => d.id === Number(val));
                  setFormData({ ...formData, designation: desig });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent>
                  {designations.map((d) => (
                    <SelectItem key={d.id} value={d.id.toString()}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="specialization">Specialization</Label>
              <Input
                id="specialization"
                placeholder="e.g., Full Stack, Data Science, Networking, DevOps"
                value={formData.specialization || ""}
                onChange={(e) =>
                  setFormData({ ...formData, specialization: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="linkedin">LinkedIn URL</Label>
              <Input
                id="linkedin"
                type="url"
                value={formData.linkedInUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, linkedInUrl: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
