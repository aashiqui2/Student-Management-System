import { createFileRoute } from "@tanstack/react-router";
import { StudentForm } from "@/components/sms/StudentForm";

export const Route = createFileRoute("/students/new")({
  head: () => ({
    meta: [{ title: "Register Student — EduTrack" }],
  }),
  component: () => <StudentForm />,
});
