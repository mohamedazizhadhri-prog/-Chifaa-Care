import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface PaymentIntent {
  clientSecret: string;
  paymentId: string;
  amount: number;
  currency: string;
}

export interface Payment {
  id: string;
  appointmentId: string;
  patientId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripePaymentIntentId?: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED'
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly API_URL = `${environment.apiUrl}/payment`;

  constructor(private http: HttpClient) {}

  /**
   * Get Stripe publishable key
   */
  getConfig(): Observable<{ publishableKey: string }> {
    return this.http.get<any>(`${this.API_URL}/config`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Create payment intent for appointment
   */
  createPaymentIntent(
    appointmentId: string,
    amount: number,
    currency: string = 'usd'
  ): Observable<PaymentIntent> {
    return this.http.post<any>(`${this.API_URL}/create-intent`, {
      appointmentId,
      amount,
      currency
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Confirm payment with payment intent ID
   */
  confirmPayment(paymentIntentId: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/confirm`, {
      paymentIntentId
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get payment details by appointment ID
   */
  getPaymentByAppointment(appointmentId: string): Observable<Payment> {
    return this.http.get<any>(`${this.API_URL}/${appointmentId}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get payment history for current patient
   */
  getPaymentHistory(limit: number = 50): Observable<Payment[]> {
    return this.http.get<any>(`${this.API_URL}/history`, {
      params: { limit: limit.toString() }
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Cancel payment intent
   */
  cancelPayment(paymentIntentId: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/${paymentIntentId}/cancel`, {}).pipe(
      map(response => response.data)
    );
  }

  /**
   * Format currency amount for display
   */
  formatAmount(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  /**
   * Get status badge class for UI
   */
  getStatusBadgeClass(status: PaymentStatus): string {
    const classMap: Record<PaymentStatus, string> = {
      [PaymentStatus.PENDING]: 'badge bg-warning',
      [PaymentStatus.PROCESSING]: 'badge bg-info',
      [PaymentStatus.SUCCEEDED]: 'badge bg-success',
      [PaymentStatus.FAILED]: 'badge bg-danger',
      [PaymentStatus.REFUNDED]: 'badge bg-secondary',
      [PaymentStatus.CANCELLED]: 'badge bg-dark'
    };
    return classMap[status] || 'badge bg-secondary';
  }
}
