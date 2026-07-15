import type { Prisma } from "@ebraz/database";
import type { AssessmentProfile } from "@ebraz/types/assessments";
import { toISODate } from "@ebraz/utils/date";

type AssessmentRecord = Prisma.InitAssessmentGetPayload<{
  include: typeof assessmentInclude;
}>;

export const assessmentInclude = {
  assignment: {
    include: {
      client: { select: { id: true, name: true, phone: true } },
      therapist: { select: { id: true, name: true, phone: true } },
    },
  },
} as const;

export function toAssessmentProfile(assessment: AssessmentRecord): AssessmentProfile {
  const assignment = assessment.assignment;
  if (!assignment) {
    throw new Error("Assessment assignment is missing");
  }

  return {
    id: assessment.id,
    date: assessment.date ? toISODate(assessment.date) : null,
    time: assessment.time,
    status: assessment.status,
    filePath: assessment.filePath,
    client: {
      id: assignment.client.id,
      name: assignment.client.name,
      phone: assignment.client.phone,
    },
    therapist: assignment.therapist
      ? {
          id: assignment.therapist.id,
          name: assignment.therapist.name,
          phone: assignment.therapist.phone,
        }
      : null,
    createdAt: assessment.createdAt.toISOString(),
    updatedAt: assessment.updatedAt.toISOString(),
  };
}
