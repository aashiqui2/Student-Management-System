import { useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft, Upload, FileText, Trash2, Download } from "lucide-react";
import { toast } from "sonner";
import {
  useSMS,
  type Assessment,
  type AssessmentResource,
} from "@/lib/sms-data";
import { fileToDataUrl } from "@/lib/excel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormValues = {
  assessmentName: string;
  dateConducted: string;
  totalMarks: number;
};

const ACCEPTED = ".pdf,.doc,.docx,.xls,.xlsx,.csv,.sql,.txt";

export function AssessmentForm({ id }: { id?: string }) {
  const navigate = useNavigate();
  const { getAssessment, addAssessment, updateAssessment } = useSMS();
  const isEdit = Boolean(id);
  const existing = id ? getAssessment(id) : undefined;
  const fileInput = useRef<HTMLInputElement>(null);
  const [resources, setResources] = useState<AssessmentResource[]>(
    existing?.resources ?? [],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: existing
      ? {
          assessmentName: existing.assessmentName,
          dateConducted: existing.dateConducted,
          totalMarks: existing.totalMarks,
        }
      : { assessmentName: "", dateConducted: "", totalMarks: 100 },
  });

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    try {
      const added: AssessmentResource[] = [];
      for (const file of files) {
        const dataUrl = await fileToDataUrl(file);
        added.push({ name: file.name, type: file.type || "file", dataUrl });
      }
      setResources((prev) => [...prev, ...added]);
      toast.success(`Added ${added.length} resource file(s).`);
    } catch {
      toast.error("Could not read one of the files.");
    }
  };

  const removeResource = (idx: number) =>
    setResources((prev) => prev.filter((_, i) => i !== idx));


  const onSubmit = (data: FormValues) => {
    const payload: Omit<Assessment, "id"> = {
      assessmentName: data.assessmentName,
      dateConducted: data.dateConducted,
      totalMarks: Number(data.totalMarks),
      resources,
    };

    if (isEdit && id) {
      updateAssessment(id, payload);
      toast.success("Assessment updated");
    } else {
      addAssessment(payload);
      toast.success("Assessment created");
    }
    navigate({ to: "/assessments" });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate({ to: "/assessments" })}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {isEdit ? "Edit Assessment" : "New Assessment"}
        </h1>
      </div>

      <Card>
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label>Assessment Name</Label>
              <Input
                {...register("assessmentName", { required: "Name is required" })}
              />
              {errors.assessmentName && (
                <p className="text-xs text-destructive">
                  {errors.assessmentName.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Date Conducted</Label>
                <Input
                  type="date"
                  {...register("dateConducted", { required: "Date is required" })}
                />
                {errors.dateConducted && (
                  <p className="text-xs text-destructive">
                    {errors.dateConducted.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Total Marks</Label>
                <Input
                  type="number"
                  {...register("totalMarks", {
                    required: "Total marks required",
                    min: { value: 1, message: "Must be at least 1" },
                  })}
                />
                {errors.totalMarks && (
                  <p className="text-xs text-destructive">
                    {errors.totalMarks.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: "/assessments" })}
              >
                Cancel
              </Button>
              <Button type="submit">{isEdit ? "Save Changes" : "Create"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
