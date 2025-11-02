import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { PaymentService, PaymentStatus } from '../../../services/payment.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    ProgressSpinnerModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <div class="payment-container">
      <p-toast></p-toast>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <p-progressSpinner></p-progressSpinner>
        <p>Loading payment...</p>
      </div>

      <!-- Payment Form -->
      <div *ngIf="!loading && !paymentCompleted" class="payment-form">
        <p-card>
          <ng-template pTemplate="header">
            <div class="card-header">
              <h2>Complete Your Payment</h2>
              <p class="text-muted">Secure payment powered by Stripe</p>
            </div>
          </ng-template>

          <!-- Appointment Details -->
          <div class="appointment-summary mb-4">
            <h4>Appointment Details</h4>
            <div class="detail-row">
              <span class="label">Doctor:</span>
              <span class="value">{{ appointmentDetails?.doctorName }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date:</span>
              <span class="value">{{ appointmentDetails?.date | date:'fullDate' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Time:</span>
              <span class="value">{{ appointmentDetails?.time }}</span>
            </div>
            <div class="detail-row total">
              <span class="label">Total Amount:</span>
              <span class="value">{{ formatAmount(amount) }}</span>
            </div>
          </div>

          <!-- Stripe Card Element -->
          <div class="payment-section">
            <h4>Payment Information</h4>
            <div id="card-element" class="stripe-card-element"></div>
            <div id="card-errors" role="alert" class="error-message"></div>
          </div>

          <ng-template pTemplate="footer">
            <div class="button-group">
              <button 
                pButton 
                label="Cancel" 
                class="p-button-secondary"
                (click)="onCancel()"
                [disabled]="processing">
              </button>
              <button 
                pButton 
                [label]="processing ? 'Processing...' : 'Pay ' + formatAmount(amount)"
                class="p-button-success"
                (click)="handlePayment()"
                [loading]="processing"
                [disabled]="processing || !cardElement">
              </button>
            </div>
          </ng-template>
        </p-card>
      </div>

      <!-- Payment Success -->
      <div *ngIf="paymentCompleted" class="payment-success">
        <p-card>
          <ng-template pTemplate="header">
            <div class="success-header">
              <i class="pi pi-check-circle"></i>
              <h2>Payment Successful!</h2>
            </div>
          </ng-template>

          <div class="success-content">
            <p>Your appointment has been confirmed.</p>
            <p>You will receive a confirmation email shortly.</p>
            
            <div class="payment-details">
              <div class="detail-row">
                <span class="label">Payment ID:</span>
                <span class="value">{{ paymentId }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Amount Paid:</span>
                <span class="value">{{ formatAmount(amount) }}</span>
              </div>
            </div>
          </div>

          <ng-template pTemplate="footer">
            <button 
              pButton 
              label="View Appointments" 
              class="p-button-primary"
              (click)="goToAppointments()">
            </button>
          </ng-template>
        </p-card>
      </div>
    </div>
  `,
  styles: [`
    .payment-container {
      max-width: 600px;
      margin: 2rem auto;
      padding: 1rem;
    }

    .loading-container {
      text-align: center;
      padding: 3rem;
    }

    .card-header {
      padding: 1.5rem;
      text-align: center;
    }

    .card-header h2 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    .card-header .text-muted {
      margin: 0;
      color: #666;
    }

    .appointment-summary {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
    }

    .appointment-summary h4 {
      margin: 0 0 1rem 0;
      color: #333;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid #e0e0e0;
    }

    .detail-row.total {
      border-bottom: none;
      font-weight: 600;
      font-size: 1.2rem;
      color: #2196F3;
      margin-top: 0.5rem;
    }

    .detail-row .label {
      color: #666;
    }

    .detail-row .value {
      color: #333;
      font-weight: 500;
    }

    .payment-section {
      margin-top: 2rem;
    }

    .payment-section h4 {
      margin: 0 0 1rem 0;
      color: #333;
    }

    .stripe-card-element {
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 12px;
      background: white;
    }

    .error-message {
      color: #ef4444;
      font-size: 0.875rem;
      margin-top: 0.5rem;
      min-height: 20px;
    }

    .button-group {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    .success-header {
      text-align: center;
      padding: 2rem;
    }

    .success-header i {
      font-size: 4rem;
      color: #22c55e;
      margin-bottom: 1rem;
    }

    .success-header h2 {
      margin: 0;
      color: #333;
    }

    .success-content {
      text-align: center;
      padding: 1rem;
    }

    .success-content p {
      margin: 0.5rem 0;
      color: #666;
    }

    .payment-details {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
      margin-top: 2rem;
      text-align: left;
    }
  `]
})
export class PaymentComponent implements OnInit {
  loading = true;
  processing = false;
  paymentCompleted = false;

  appointmentId: string = '';
  amount: number = 0;
  appointmentDetails: any = null;
  paymentId: string = '';

  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  cardElement: StripeCardElement | null = null;
  clientSecret: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private messageService: MessageService
  ) {}

  async ngOnInit() {
    // Get appointment ID and amount from route params
    this.appointmentId = this.route.snapshot.queryParams['appointmentId'] || '';
    this.amount = parseFloat(this.route.snapshot.queryParams['amount']) || 0;

    if (!this.appointmentId || !this.amount) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid payment parameters'
      });
      this.router.navigate(['/patient/appointments']);
      return;
    }

    await this.initializePayment();
  }

  async initializePayment() {
    try {
      // Get Stripe publishable key
      const config = await this.paymentService.getConfig().toPromise();
      
      // Initialize Stripe
      this.stripe = await loadStripe(config!.publishableKey);

      if (!this.stripe) {
        throw new Error('Failed to load Stripe');
      }

      // Create payment intent
      const paymentIntent = await this.paymentService.createPaymentIntent(
        this.appointmentId,
        this.amount
      ).toPromise();

      this.clientSecret = paymentIntent!.clientSecret;
      this.paymentId = paymentIntent!.paymentId;

      // Setup Stripe Elements
      this.setupStripeElements();

      this.loading = false;
    } catch (error: any) {
      console.error('Error initializing payment:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error.error?.message || 'Failed to initialize payment'
      });
      this.loading = false;
    }
  }

  setupStripeElements() {
    if (!this.stripe) return;

    // Create Elements instance
    this.elements = this.stripe.elements();

    // Create Card Element
    this.cardElement = this.elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#32325d',
          '::placeholder': {
            color: '#aab7c4',
          },
        },
        invalid: {
          color: '#fa755a',
        },
      },
    });

    // Mount Card Element
    this.cardElement.mount('#card-element');

    // Handle real-time validation errors
    this.cardElement.on('change', (event: any) => {
      const displayError = document.getElementById('card-errors');
      if (displayError) {
        displayError.textContent = event.error ? event.error.message : '';
      }
    });
  }

  async handlePayment() {
    if (!this.stripe || !this.cardElement || this.processing) return;

    this.processing = true;

    try {
      // Confirm payment with Stripe
      const { error, paymentIntent } = await this.stripe.confirmCardPayment(
        this.clientSecret,
        {
          payment_method: {
            card: this.cardElement,
          },
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      // Payment succeeded
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirm payment on backend
        await this.paymentService.confirmPayment(paymentIntent.id).toPromise();

        this.paymentCompleted = true;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Payment completed successfully!'
        });
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Payment Failed',
        detail: error.message || 'An error occurred during payment'
      });
    } finally {
      this.processing = false;
    }
  }

  onCancel() {
    if (confirm('Are you sure you want to cancel this payment?')) {
      this.router.navigate(['/patient/appointments']);
    }
  }

  goToAppointments() {
    this.router.navigate(['/patient/appointments']);
  }

  formatAmount(amount: number): string {
    return this.paymentService.formatAmount(amount);
  }
}
