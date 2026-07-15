export type AssessmentStatus = "pending" | "done";

export interface AssessmentParticipant {
  id: string;
  name: string;
  phone: string;
}

export interface AssessmentProfile {
  id: string;
  date: string | null;
  time: string | null;
  status: AssessmentStatus;
  filePath: string | null;
  client: AssessmentParticipant;
  therapist: AssessmentParticipant | null;
  createdAt: string;
  updatedAt: string;
}
