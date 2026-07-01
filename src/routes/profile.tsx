import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSMS } from "@/lib/sms-data";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/profile")({
  component: ProfileRedirect,
});

function ProfileRedirect() {
  const { summaries, isLoading } = useSMS();
  const { isStudent } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (isStudent && summaries.length > 0) {
        navigate({ to: "/students/$id", params: { id: summaries[0].id } });
      } else {
        navigate({ to: "/dashboard" });
      }
    }
  }, [isLoading, summaries, isStudent, navigate]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <p className="text-muted-foreground">Loading profile...</p>
    </div>
  );
}
