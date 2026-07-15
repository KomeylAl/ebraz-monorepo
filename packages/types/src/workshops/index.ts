export type Gender = "male" | "female";

export interface WorkshopSessionProfile {
  id: string;
  workshopId: string;
  title: string;
  description: string;
  sessionDate?: string;
  startTime: string;
  endTime: string;
  location?: string;
  link?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkshopListItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  organizers?: string;
  startDate?: string;
  endDate?: string;
  weekDay?: string;
  time?: string;
  imgPath?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkshopProfile extends WorkshopListItem {
  content: string;
  sessions: WorkshopSessionProfile[];
  participants: WorkshopParticipantProfile[];
}

export interface WorkshopPublicProfile extends WorkshopListItem {
  content: string;
  sessions: WorkshopSessionProfile[];
}

export interface WorkshopParticipantProfile {
  participantId: string;
  workshopId: string;
  name: string;
  nameEn?: string;
  nationalCode?: string;
  phone: string;
  gender: Gender;
  approved: boolean;
  joinedAt?: string;
  registeredAt: string;
}

export interface ParticipantProfile {
  id: string;
  name: string;
  nameEn?: string;
  nationalCode?: string;
  phone: string;
  gender: Gender;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
}
