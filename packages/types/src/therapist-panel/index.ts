export interface ResumeEducation {
  degree: string;
  institution: string;
  year: string;
}

export interface ResumeExperience {
  role: string;
  organization: string;
  from: string;
  to: string;
}

export interface ResumeSocialLinks {
  linkedin?: string;
  instagram?: string;
  website?: string;
  twitter?: string;
}

export interface TherapistResumeProfile {
  id: string;
  therapistId: string;
  title: string | null;
  bio: string | null;
  specialization: string | null;
  educations: ResumeEducation[];
  experiences: ResumeExperience[];
  skills: string[];
  certifications: string[];
  content: string | null;
  socialLinks: ResumeSocialLinks | null;
  filePath: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TherapistResourceType = "link" | "file";

export interface TherapistResourceProfile {
  id: string;
  therapistId: string;
  title: string;
  type: TherapistResourceType;
  description: string | null;
  link: string | null;
  filePath: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TherapistDashboardStats {
  appointmentsToday: number;
  appointmentsTomorrow: number;
  appointmentsNext7Days: number;
  appointmentsNext30Days: number;
  unreadNotifications: number;
  pendingAssessments: number;
  totalClients: number;
  recentAppointments: Array<{
    id: string;
    date: string;
    time: string;
    status: string;
    client: { id: string; name: string; phone: string };
  }>;
}
