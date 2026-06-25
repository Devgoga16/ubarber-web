export interface Location {
  _id: string;
  name: string;
  address?: string;
  phone?: string;
  isActive: boolean;
}

export type DepositType = "percentage" | "fixed";

export interface Service {
  _id: string;
  name: string;
  durationMinutes: number;
  priceCents: number;
  locationIds: string[];
  photo?: string;
  depositType?: DepositType;
  depositValueCents?: number;
  depositValuePercent?: number;
  isActive: boolean;
}

export interface Client {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  isActive: boolean;
}

export interface Barber {
  _id: string;
  userId: { _id: string; name: string; email: string; isActive: boolean } | string;
  locationIds: string[];
  phone?: string;
  photo?: string;
  specialties: string[];
  commissionPercentage?: number;
  favoriteServiceIds: string[];
  isActive: boolean;
  ratingAverage?: number | null;
  ratingCount?: number;
}

export type AppointmentStatus = "pending" | "in_progress" | "completed" | "cancelled" | "no_show";

export type DepositStatus =
  | "not_required"
  | "awaiting_barber"
  | "awaiting_owner_review"
  | "confirmed"
  | "rejected";

export interface PaymentMethod {
  _id: string;
  name: string;
  isActive: boolean;
}

export interface Appointment {
  _id: string;
  locationId: string;
  barberId: string;
  clientId: { _id: string; name: string; phone: string } | string;
  serviceIds: { _id: string; name: string; durationMinutes: number; priceCents: number }[] | string[];
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  totalPriceCents: number;
  paid: boolean;
  paidAt?: string;
  paymentMethodId?: { _id: string; name: string } | string;
  finalPaymentAmountCents?: number;
  receiptPhoto?: string;
  notes?: string;
  source?: "staff" | "public";
  depositStatus: DepositStatus;
  depositAmountCents?: number;
  depositMethod?: "proof_photo" | "trust_code";
  depositProofPhoto?: string;
  depositPaymentMethodId?: { _id: string; name: string } | string;
  depositConfirmedAt?: string;
  rejectionReason?: string;
}

export interface Plan {
  _id: string;
  name: string;
  description?: string;
  priceCents: number;
  billingPeriod: "monthly" | "yearly";
  limits: { maxLocations: number; maxBarbers: number; maxAppointmentsPerMonth: number };
  features: string[];
  isActive: boolean;
  highlighted: boolean;
  sortOrder: number;
  whatsappEnabled: boolean;
}

export type SubscriptionStatus = "trial" | "active" | "past_due" | "suspended" | "cancelled";

export interface Subscription {
  _id: string;
  businessId: string;
  planId: Plan | string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
}

export interface DashboardStats {
  todayAppointmentsCount: number;
  todayAppointmentsDelta: number;
  activeClientsCount: number;
  todayRevenueCents: number;
  todayRevenueDeltaCents: number;
  pendingCount: number;
  pendingDelta: number;
  recentAppointments: Appointment[];
  popularServices: {
    serviceId: string;
    name: string;
    priceCents: number;
    count: number;
    percentage: number;
  }[];
}

export interface Business {
  _id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  phone?: string;
  subscription: Subscription | null;
}

export type InvoiceStatus = "pending" | "overdue" | "paid" | "cancelled";

export interface Invoice {
  _id: string;
  businessId: { _id: string; name: string; ownerName: string; ownerEmail: string } | string;
  subscriptionId: string;
  planId: { _id: string; name: string; priceCents: number; billingPeriod: "monthly" | "yearly" } | string;
  amountCents: number;
  issuedAt: string;
  dueDate: string;
  status: InvoiceStatus;
  paidAt?: string;
}
