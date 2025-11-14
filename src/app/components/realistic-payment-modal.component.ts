import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-realistic-payment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="onOverlayClick($event)">
      <div class="modal-container" (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="modal-header">
          <div class="header-content">
            <div class="header-icon">💳</div>
            <div>
              <h2>Complete Payment</h2>
              <p class="subtitle">Secure payment processing</p>
            </div>
          </div>
          <button class="close-button" (click)="onClose()" [disabled]="processing">
            <span>×</span>
          </button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          
          <!-- Amount Display -->
          <div class="amount-section">
            <div class="amount-label">Total Amount</div>
            <div class="amount-value">{{ formatCurrency(amount) }}</div>
            <div class="amount-description">{{ appointmentDetails }}</div>
          </div>

          <!-- Development Mode Notice (Dismissible) -->
          <div class="dev-notice" *ngIf="isDevelopmentMode && !devNoticeHidden">
            <div class="dev-notice-content">
              <span class="dev-icon">🔧</span>
              <div class="dev-text">
                <strong>Development Mode</strong>
                <p>Using test payment - no real charges will be made</p>
              </div>
            </div>
            <button class="dev-dismiss" (click)="devNoticeHidden = true">×</button>
          </div>

          <!-- Payment Form -->
          <div class="payment-form">
            
            <!-- Card Number -->
            <div class="form-group">
              <label class="form-label">
                Card Number
                <span class="card-icons">
                  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='16' viewBox='0 0 24 16'%3E%3Crect fill='%231434CB' width='24' height='16' rx='2'/%3E%3Ccircle fill='%23EB001B' cx='9' cy='8' r='5'/%3E%3Ccircle fill='%23F79E1B' cx='15' cy='8' r='5'/%3E%3C/svg%3E" alt="Mastercard" />
                  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='16' viewBox='0 0 24 16'%3E%3Crect fill='%231A1F71' width='24' height='16' rx='2'/%3E%3Cpath fill='%23FFF' d='M8 5h8v6H8z'/%3E%3Cpath fill='%23F7B600' d='M8 5l4 3-4 3z'/%3E%3C/svg%3E" alt="Visa" />
                </span>
              </label>
              <div class="input-wrapper" [class.focused]="focusedField === 'cardNumber'" [class.filled]="cardNumber">
                <input
                  type="text"
                  class="form-input"
                  [(ngModel)]="cardNumber"
                  (input)="formatCardNumber($event)"
                  (focus)="focusedField = 'cardNumber'"
                  (blur)="focusedField = null"
                  placeholder="1234 5678 9012 3456"
                  maxlength="19"
                  [disabled]="processing"
                  autocomplete="cc-number"
                />
                <div class="card-brand" *ngIf="cardBrand">
                  <span class="brand-name">{{ cardBrand }}</span>
                </div>
              </div>
              <div class="field-error" *ngIf="errors.cardNumber">{{ errors.cardNumber }}</div>
            </div>

            <!-- Expiry and CVC -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Expiry Date</label>
                <div class="input-wrapper" [class.focused]="focusedField === 'expiry'" [class.filled]="expiry">
                  <input
                    type="text"
                    class="form-input"
                    [(ngModel)]="expiry"
                    (input)="formatExpiry($event)"
                    (focus)="focusedField = 'expiry'"
                    (blur)="focusedField = null"
                    placeholder="MM / YY"
                    maxlength="7"
                    [disabled]="processing"
                    autocomplete="cc-exp"
                  />
                </div>
                <div class="field-error" *ngIf="errors.expiry">{{ errors.expiry }}</div>
              </div>

              <div class="form-group">
                <label class="form-label">
                  CVC
                  <span class="cvc-icon" title="3-digit security code on the back of your card">?</span>
                </label>
                <div class="input-wrapper" [class.focused]="focusedField === 'cvc'" [class.filled]="cvc">
                  <input
                    type="text"
                    class="form-input"
                    [(ngModel)]="cvc"
                    (input)="formatCVC($event)"
                    (focus)="focusedField = 'cvc'"
                    (blur)="focusedField = null"
                    placeholder="123"
                    maxlength="4"
                    [disabled]="processing"
                    autocomplete="cc-csc"
                  />
                </div>
                <div class="field-error" *ngIf="errors.cvc">{{ errors.cvc }}</div>
              </div>
            </div>

            <!-- Billing ZIP -->
            <div class="form-group">
              <label class="form-label">Billing ZIP Code</label>
              <div class="input-wrapper" [class.focused]="focusedField === 'zip'" [class.filled]="zip">
                <input
                  type="text"
                  class="form-input"
                  [(ngModel)]="zip"
                  (input)="formatZIP($event)"
                  (focus)="focusedField = 'zip'"
                  (blur)="focusedField = null"
                  placeholder="12345"
                  maxlength="5"
                  [disabled]="processing"
                  autocomplete="postal-code"
                />
              </div>
              <div class="field-error" *ngIf="errors.zip">{{ errors.zip }}</div>
            </div>

          </div>

          <!-- Security Note -->
          <div class="security-badge">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L3 3V7C3 10.5 5.5 13.5 8 14.5C10.5 13.5 13 10.5 13 7V3L8 1Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 8V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <circle cx="8" cy="6" r="0.5" fill="currentColor"/>
            </svg>
            <span>Your payment information is encrypted and secure</span>
          </div>

        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button 
            class="btn btn-cancel" 
            (click)="onClose()"
            [disabled]="processing">
            Cancel
          </button>
          <button 
            class="btn btn-pay" 
            (click)="onPay()"
            [disabled]="processing || !isFormValid()">
            <span *ngIf="!processing" class="btn-content">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 6H14M4 1V3M12 1V3M3 1H13C13.5523 1 14 1.44772 14 2V14C14 14.5523 13.5523 15 13 15H3C2.44772 15 2 14.5523 2 14V2C2 1.44772 2.44772 1 3 1Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Pay {{ formatCurrency(amount) }}
            </span>
            <span *ngIf="processing" class="btn-content">
              <span class="spinner"></span>
              Processing...
            </span>
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 20px;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .modal-container {
      background: white;
      border-radius: 16px;
      width: 100%;
      max-width: 480px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-header {
      padding: 24px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-icon {
      font-size: 32px;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #1f2937;
    }

    .subtitle {
      margin: 2px 0 0 0;
      font-size: 13px;
      color: #6b7280;
    }

    .close-button {
      background: none;
      border: none;
      font-size: 32px;
      color: #9ca3af;
      cursor: pointer;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .close-button:hover {
      background: #f3f4f6;
      color: #4b5563;
    }

    .close-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .modal-body {
      padding: 24px;
    }

    .amount-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 24px;
      border-radius: 12px;
      text-align: center;
      margin-bottom: 24px;
      color: white;
    }

    .amount-label {
      font-size: 13px;
      opacity: 0.9;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .amount-value {
      font-size: 36px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .amount-description {
      font-size: 14px;
      opacity: 0.9;
    }

    .dev-notice {
      background: #fef3c7;
      border: 1px solid #fbbf24;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 24px;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
    }

    .dev-notice-content {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      flex: 1;
    }

    .dev-icon {
      font-size: 20px;
      flex-shrink: 0;
    }

    .dev-text strong {
      display: block;
      color: #92400e;
      font-size: 14px;
      margin-bottom: 2px;
    }

    .dev-text p {
      margin: 0;
      color: #78350f;
      font-size: 13px;
      line-height: 1.4;
    }

    .dev-dismiss {
      background: none;
      border: none;
      font-size: 20px;
      color: #92400e;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      flex-shrink: 0;
    }

    .dev-dismiss:hover {
      background: rgba(146, 64, 14, 0.1);
    }

    .payment-form {
      margin-bottom: 20px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-label {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      margin-bottom: 8px;
    }

    .card-icons {
      display: flex;
      gap: 4px;
      opacity: 0.7;
    }

    .card-icons img {
      width: 24px;
      height: 16px;
      border-radius: 2px;
    }

    .cvc-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      background: #e5e7eb;
      color: #6b7280;
      border-radius: 50%;
      font-size: 11px;
      font-weight: 600;
      cursor: help;
      margin-left: 4px;
    }

    .input-wrapper {
      position: relative;
      transition: all 0.2s;
    }

    .input-wrapper.focused {
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      border-radius: 8px;
    }

    .form-input {
      width: 100%;
      padding: 12px 14px;
      border: 1.5px solid #d1d5db;
      border-radius: 8px;
      font-size: 15px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      transition: all 0.2s;
      background: white;
    }

    .form-input:focus {
      outline: none;
      border-color: #667eea;
    }

    .form-input:disabled {
      background: #f9fafb;
      cursor: not-allowed;
      opacity: 0.6;
    }

    .form-input::placeholder {
      color: #9ca3af;
    }

    .card-brand {
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 11px;
      font-weight: 600;
      color: #667eea;
      background: #ede9fe;
      padding: 2px 8px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .field-error {
      margin-top: 6px;
      font-size: 13px;
      color: #ef4444;
    }

    .security-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px;
      background: #f0fdf4;
      border: 1px solid #86efac;
      border-radius: 8px;
      font-size: 13px;
      color: #166534;
    }

    .security-badge svg {
      color: #22c55e;
      flex-shrink: 0;
    }

    .modal-footer {
      padding: 20px 24px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .btn {
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-cancel {
      background: white;
      color: #6b7280;
      border: 1.5px solid #d1d5db;
    }

    .btn-cancel:hover:not(:disabled) {
      background: #f9fafb;
      border-color: #9ca3af;
    }

    .btn-pay {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      min-width: 180px;
    }

    .btn-pay:hover:not(:disabled) {
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
      transform: translateY(-1px);
    }

    .btn-pay:active:not(:disabled) {
      transform: translateY(0);
    }

    .btn-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    @media (max-width: 640px) {
      .modal-container {
        max-width: 100%;
        border-radius: 16px 16px 0 0;
        margin-top: auto;
      }

      .amount-value {
        font-size: 28px;
      }

      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class RealisticPaymentModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() amount = 0;
  @Input() appointmentDetails = '';
  @Input() isDevelopmentMode = true;
  
  @Output() close = new EventEmitter<void>();
  @Output() paymentSuccess = new EventEmitter<any>();
  @Output() paymentError = new EventEmitter<string>();

  cardNumber = '';
  expiry = '';
  cvc = '';
  zip = '';
  
  focusedField: string | null = null;
  processing = false;
  cardBrand = '';
  devNoticeHidden = false;

  errors: any = {
    cardNumber: '',
    expiry: '',
    cvc: '',
    zip: ''
  };

  ngOnInit() {
    // Pre-fill in development mode
    if (this.isDevelopmentMode) {
      setTimeout(() => {
        this.cardNumber = '4242 4242 4242 4242';
        this.expiry = '12 / 34';
        this.cvc = '123';
        this.zip = '12345';
        this.detectCardBrand();
      }, 500);
    }
  }

  formatCardNumber(event: any) {
    let value = event.target.value.replace(/\s/g, '');
    value = value.replace(/\D/g, '');
    
    const parts = [];
    for (let i = 0; i < value.length; i += 4) {
      parts.push(value.substring(i, i + 4));
    }
    
    this.cardNumber = parts.join(' ');
    this.detectCardBrand();
    this.validateCardNumber();
  }

  formatExpiry(event: any) {
    let value = event.target.value.replace(/\s/g, '').replace(/\//g, '');
    value = value.replace(/\D/g, '');
    
    if (value.length >= 2) {
      this.expiry = value.substring(0, 2) + ' / ' + value.substring(2, 4);
    } else {
      this.expiry = value;
    }
    
    this.validateExpiry();
  }

  formatCVC(event: any) {
    this.cvc = event.target.value.replace(/\D/g, '');
    this.validateCVC();
  }

  formatZIP(event: any) {
    this.zip = event.target.value.replace(/\D/g, '');
    this.validateZIP();
  }

  detectCardBrand() {
    const number = this.cardNumber.replace(/\s/g, '');
    
    if (number.startsWith('4')) {
      this.cardBrand = 'Visa';
    } else if (/^5[1-5]/.test(number) || /^2[2-7]/.test(number)) {
      this.cardBrand = 'Mastercard';
    } else if (/^3[47]/.test(number)) {
      this.cardBrand = 'Amex';
    } else if (/^6(?:011|5)/.test(number)) {
      this.cardBrand = 'Discover';
    } else {
      this.cardBrand = '';
    }
  }

  validateCardNumber() {
    const number = this.cardNumber.replace(/\s/g, '');
    if (!number) {
      this.errors.cardNumber = '';
    } else if (number.length < 13) {
      this.errors.cardNumber = 'Card number is too short';
    } else if (!this.luhnCheck(number)) {
      this.errors.cardNumber = 'Invalid card number';
    } else {
      this.errors.cardNumber = '';
    }
  }

  validateExpiry() {
    const parts = this.expiry.split(' / ');
    if (parts.length !== 2) {
      this.errors.expiry = '';
      return;
    }
    
    const month = parseInt(parts[0]);
    const year = parseInt('20' + parts[1]);
    
    if (month < 1 || month > 12) {
      this.errors.expiry = 'Invalid month';
    } else {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      
      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        this.errors.expiry = 'Card has expired';
      } else {
        this.errors.expiry = '';
      }
    }
  }

  validateCVC() {
    if (!this.cvc) {
      this.errors.cvc = '';
    } else if (this.cvc.length < 3) {
      this.errors.cvc = 'CVC must be 3-4 digits';
    } else {
      this.errors.cvc = '';
    }
  }

  validateZIP() {
    if (!this.zip) {
      this.errors.zip = '';
    } else if (this.zip.length !== 5) {
      this.errors.zip = 'ZIP must be 5 digits';
    } else {
      this.errors.zip = '';
    }
  }

  luhnCheck(cardNumber: string): boolean {
    let sum = 0;
    let isEven = false;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber.charAt(i));
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }

  isFormValid(): boolean {
    return (
      this.cardNumber.replace(/\s/g, '').length >= 13 &&
      this.expiry.length === 7 &&
      this.cvc.length >= 3 &&
      this.zip.length === 5 &&
      !this.errors.cardNumber &&
      !this.errors.expiry &&
      !this.errors.cvc &&
      !this.errors.zip
    );
  }

  async onPay() {
    if (!this.isFormValid() || this.processing) {
      return;
    }

    this.processing = true;

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In development mode, always succeed
      if (this.isDevelopmentMode) {
        this.paymentSuccess.emit({
          status: 'succeeded',
          amount: this.amount,
          cardBrand: this.cardBrand,
          last4: this.cardNumber.slice(-4),
          timestamp: new Date().toISOString()
        });
        this.onClose();
      } else {
        // Real Stripe payment would go here
        this.paymentError.emit('Real Stripe integration not configured');
      }
    } catch (error: any) {
      this.paymentError.emit(error.message || 'Payment failed');
    } finally {
      this.processing = false;
    }
  }

  onClose() {
    if (!this.processing) {
      this.close.emit();
    }
  }

  onOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget && !this.processing) {
      this.onClose();
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}
