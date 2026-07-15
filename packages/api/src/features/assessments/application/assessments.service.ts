import type {
  CreatePublicAssessmentInput,
  ListAssessmentsQuery,
  UpdateAssessmentInput,
} from "@ebraz/validation/assessments";
import { AssessmentError } from "../domain/assessments.errors";
import { toAssessmentProfile } from "../domain/assessment.mapper";
import {
  createPublicAssessmentRecord,
  findAssessmentById,
  listAssessments,
  softDeleteAssessmentRecord,
  updateAssessmentRecord,
} from "../infrastructure/assessments.repository";
import { notifyAssessmentRegistered } from "./assessment-sms";

export async function getAssessments(query: ListAssessmentsQuery) {
  return listAssessments(query);
}

export async function getAssessmentById(id: string) {
  const assessment = await findAssessmentById(id);
  if (!assessment) throw new AssessmentError("Assessment not found", "NOT_FOUND");
  return toAssessmentProfile(assessment);
}

export async function registerPublicAssessment(input: CreatePublicAssessmentInput) {
  const assessment = await createPublicAssessmentRecord(input);
  if (!assessment) {
    throw new AssessmentError("Therapist not found", "THERAPIST_NOT_FOUND");
  }
  void notifyAssessmentRegistered(assessment);
  return assessment;
}

export async function updateAssessment(
  id: string,
  input: UpdateAssessmentInput,
  actorId: string,
) {
  const result = await updateAssessmentRecord(id, input, actorId);
  if (result === null) {
    throw new AssessmentError("Assessment not found", "NOT_FOUND");
  }
  if (result === "THERAPIST_NOT_FOUND") {
    throw new AssessmentError("Therapist not found", "THERAPIST_NOT_FOUND");
  }
  return result;
}

export async function deleteAssessment(id: string, actorId: string) {
  const existing = await findAssessmentById(id);
  if (!existing) throw new AssessmentError("Assessment not found", "NOT_FOUND");
  await softDeleteAssessmentRecord(id, actorId);
}
