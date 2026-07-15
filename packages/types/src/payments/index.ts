import type { PaymentStatus } from "../appointments/index";

export interface PaymentListItem {
  id: string;
  status: PaymentStatus;
  amount: number;
  appointmentId: string;
  appointmentDate: string;
  appointmentTime: string;
  client: { id: string; name: string; phone: string };
  therapist: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface PaymentProfile extends PaymentListItem {}

export interface InvoiceLineItem {
  appointmentId: string;
  date: string;
  time: string;
  amount: number;
  paymentStatus: PaymentStatus;
  therapistName: string;
}

export interface InvoiceProfile {
  id: string;
  clientId: string;
  clientName: string;
  adminId: string;
  fromDate: string;
  toDate: string;
  filePath: string;
  totalAmount: number;
  lineItems: InvoiceLineItem[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceListItem {
  id: string;
  clientId: string;
  clientName: string;
  fromDate: string;
  toDate: string;
  totalAmount: number;
  filePath: string;
  createdAt: string;
}
