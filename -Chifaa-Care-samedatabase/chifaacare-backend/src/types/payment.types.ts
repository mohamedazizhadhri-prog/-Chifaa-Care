export interface PaymentIntent {
  appointmentId: string;
  patientId: string;
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
}

export interface CreatePaymentIntentRequest {
  appointmentId: string;
  amount: number;
  currency?: string;
}

export interface ConfirmPaymentRequest {
  paymentIntentId: string;
}

export interface CreateRefundRequest {
  amount?: number;
  reason?: string;
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

export interface PaymentResponse {
  id: string;
  appointmentId: string;
  patientId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripePaymentIntentId?: string;
  stripeClientSecret?: string;
  paymentMethod?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface StripeWebhookEvent {
  type: string;
  data: {
    object: any;
  };
}
