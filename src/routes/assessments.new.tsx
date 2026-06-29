import { createFileRoute } from "@tanstack/react-router";
import { AssessmentForm } from "@/components/sms/AssessmentForm";

export const Route = createFileRoute("/assessments/new")({
  head: () => ({
    meta: [{ title: "New Assessment — EduTrack" }],
  }),
  component: () => <AssessmentForm />,
});
