import type { Metadata } from "next";
import { ComingSoonCard } from "@/components/shared/coming-soon-card";

export const metadata: Metadata = { title: "Courses" };

export default function CoursesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
        <p className="text-sm text-[var(--foreground-muted)] mt-1">Structured piano learning paths</p>
      </div>
      <ComingSoonCard
        title="Courses Coming Soon"
        description="Structured lesson courses with progress tracking are in development. The backend service layer is currently mocked — real persistence and lesson data are next on the roadmap."
        reason="CourseService is fully in-memory/mocked. Real CourseRepository and Mongoose model exist but are unused. Route bug: /my-courses unreachable due to /:id ordering."
      />
    </div>
  );
}
