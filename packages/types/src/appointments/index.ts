export type AppointmentStatus = "pending" | "done";
export type PaymentStatus = "pending" | "paid" | "unpaid";

export interface AppointmentParticipant {
  id: string;
  name: string;
  phone?: string;
}

export interface AppointmentProfile {
  id: string;
  date: string;
  time: string;
  amount: number;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  paymentAmount: number;
  client: AppointmentParticipant;
  therapist: AppointmentParticipant;
  createdAt: string;
  updatedAt: string;
}
