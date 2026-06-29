import { createFileRoute, useParams } from "@tanstack/react-router";
import { StudentForm } from "@/components/sms/StudentForm";

export const Route = createFileRoute("/students/edit/$id")({
  head: () => ({
    meta: [{ title: "Edit Student — EduTrack" }],
  }),
  component: EditStudent,
});

function EditStudent() {
  const { id } = useParams({ from: "/students/edit/$id" });
  return <StudentForm id={id} />;
}
