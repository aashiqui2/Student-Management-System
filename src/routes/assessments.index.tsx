import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, ClipboardList } from "lucide-react";
import { useSMS } from "@/lib/sms-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/sms/EmptyState";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/assessments/")({
  head: () => ({
    meta: [
      { title: "Assessments — EduTrack" },
      { name: "description", content: "Create and manage assessments." },
    ],
  }),
  component: AssessmentList,
});

function AssessmentList() {
  const { assessments, deleteAssessment } = useSMS();
  const navigate = useNavigate();
  const [toDelete, setToDelete] = useState<string | null>(null);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-primary">
            <ClipboardList className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Assessments</h1>
        </div>
        <Button onClick={() => navigate({ to: "/assessments/new" })}>
          <Plus className="mr-2 h-4 w-4" />
          Add Assessment
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {assessments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left text-muted-foreground">
                    <th className="px-5 py-3 font-semibold">Assessment Name</th>
                    <th className="px-5 py-3 font-semibold">Date Conducted</th>
                    <th className="px-5 py-3 font-semibold">Total Marks</th>
                    <th className="px-5 py-3 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map((a) => (
                    <tr key={a.id} className="border-b transition-colors last:border-0 hover:bg-muted/40">
                      <td className="px-5 py-3 font-semibold">{a.assessmentName}</td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {new Date(a.dateConducted).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant="secondary">{a.totalMarks}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              navigate({
                                to: "/assessments/edit/$id",
                                params: { id: a.id },
                              })
                            }
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setToDelete(a.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              message="No assessments yet. Create one to start entering marks."
              actionLabel="Add Assessment"
              onAction={() => navigate({ to: "/assessments/new" })}
            />
          )}
        </CardContent>
      </Card>

      <AlertDialog open={toDelete !== null} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this assessment?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the assessment and all marks recorded against it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (toDelete) {
                  deleteAssessment(toDelete);
                  toast.success("Assessment deleted");
                }
                setToDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
