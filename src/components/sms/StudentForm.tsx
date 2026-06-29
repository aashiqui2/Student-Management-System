import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  PURSUING_YEARS,
  useSMS,
  type Student,
} from "@/lib/sms-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FormValues = Omit<Student, "id">;

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function StudentForm({ id }: { id?: string }) {
  const navigate = useNavigate();
  const { getStudent, addStudent, updateStudent } = useSMS();
  const [profilePic, setProfilePic] = useState<File | undefined>(undefined);
  const isEdit = Boolean(id);
  const existing = id ? getStudent(id) : undefined;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: existing ?? { pursuingYear: "" },
  });

  const pursuingYear = watch("pursuingYear");

  const onSubmit = async (data: FormValues) => {
    try {
      if (isEdit && id) {
        await updateStudent(id, data, profilePic);
        toast.success("Student updated");
      } else {
        await addStudent(data, profilePic);
        toast.success("Student registered");
      }
      navigate({ to: "/students" });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save student. Please try again.",
      );
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate({ to: "/students" })}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {isEdit ? "Edit Student Profile" : "Register New Student"}
        </h1>
      </div>

      <Card>
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <section>
              <h2 className="mb-1 text-lg font-bold text-primary">Basic Information</h2>
              <Separator className="mb-5" />
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Full Name" error={errors.name?.message}>
                  <Input {...register("name", { required: "Name is required" })} />
                </Field>
                <Field label="Registration Number" error={errors.regNo?.message}>
                  <Input
                    {...register("regNo", { required: "Registration number is required" })}
                  />
                </Field>
                <Field label="Email Address" error={errors.email?.message}>
                  <Input
                    type="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" },
                    })}
                  />
                </Field>
                <Field label="Mobile Number (Optional)" error={errors.mobileNumber?.message}>
                  <Input
                    {...register("mobileNumber", {
                      pattern: {
                        value: /^([0-9]{10})?$/,
                        message: "Must be exactly 10 digits if provided",
                      },
                    })}
                  />
                </Field>
              </div>
            </section>

            <section>
              <h2 className="mb-1 text-lg font-bold text-primary">Academic Details</h2>
              <Separator className="mb-5" />
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Department (e.g., CSE, IT, ECE)">
                  <Input {...register("department")} />
                </Field>
                <Field label="Pursuing Year">
                  <Select
                    value={pursuingYear || ""}
                    onValueChange={(v) =>
                      setValue("pursuingYear", v as FormValues["pursuingYear"])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {PURSUING_YEARS.map((y) => (
                        <SelectItem key={y.value} value={y.value}>
                          {y.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Start Year">
                  <Input type="number" {...register("startYear")} />
                </Field>
                <Field label="End Year (Graduation)">
                  <Input type="number" {...register("endYear")} />
                </Field>
              </div>
            </section>

            <section>
              <h2 className="mb-1 text-lg font-bold text-primary">Online Profiles</h2>
              <Separator className="mb-5" />
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="HackerRank Username">
                  <Input {...register("hackerRankUsername")} />
                </Field>
                <Field label="LinkedIn URL">
                  <Input {...register("linkedInUrl")} />
                </Field>
                <Field label="GitHub URL">
                  <Input {...register("githubUrl")} />
                </Field>
                <Field label="Instagram URL">
                  <Input {...register("instagramUrl")} />
                </Field>
              </div>
            </section>

            <section>
              <h2 className="mb-1 text-lg font-bold text-primary">Profile Photo</h2>
              <Separator className="mb-5" />
              <div className="space-y-3">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    setProfilePic(file ?? undefined);
                  }}
                />
                {profilePic && (
                  <p className="text-sm text-muted-foreground">Selected: {profilePic.name}</p>
                )}
              </div>
            </section>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: "/students" })}
              >
                Cancel
              </Button>
              <Button type="submit">
                {isEdit ? "Save Changes" : "Register Student"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
