import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RealisticPaymentModalComponent } from './realistic-payment-modal.component';

@Component({
  selector: 'app-payment-demo',
  standalone: true,
  imports: [CommonModule, RealisticPaymentModalComponent],
  template: `
    <div class="demo-container">
      <div class="demo-header">
        <h1>💳 Realistic Payment Modal Demo</h1>
        <p>Beautiful payment form that works in development mode</p>
      </div>

      <div class="demo-content">
        <div class="info-card">
          <h2>✨ Features</h2>
          <ul>
            <li>🎨 Pixel-perfect Stripe-like design</li>
            <li>💳 Real-time card validation</li>
            <li>🔍 Automatic card brand detection</li>
            <li>✅ Luhn algorithm validation</li>
            <li>📱 Fully responsive</li>
            <li>♿ Accessible & keyboard-friendly</li>
            <li>🔧 Auto-fills in development mode</li>
            <li>⚡ Smooth animations</li>
          </ul>
        </div>

        <div class="action-card">
          <h2>Try It Out</h2>
          <p>Click the button below to see the payment modal in action:</p>
          
          <button class="demo-button" (click)="openPaymentModal()">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 4H16C17.1 4 18 4.9 18 6V14C18 15.1 17.1 16 16 16H4C2.9 16 2 15.1 2 14V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 8H18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Open Payment Modal
          </button>

          <div class="test-info">
            <h3>Test Details:</h3>
            <div class="test-item">
              <span class="label">Amount:</span>
              <span class="value">$50.00</span>
            </div>
            <div class="test-item">
              <span class="label">Appointment:</span>
              <span class="value">Dr. Smith - Cardiology</span>
            </div>
            <div class="test-item">
              <span class="label">Mode:</span>
              <span class="value dev-badge">Development</span>
            </div>
          </div>
        </div>

        <div class="usage-card">
          <h2>📝 How to Use</h2>
          
          <h3>1. Import the Component</h3>
          <pre><code>{{ usageExample1 }}</code></pre>

          <h3>2. Add to Template</h3>
          <pre><code>{{ usageExample2 }}</code></pre>

          <h3>3. Handle Events</h3>
          <pre><code>{{ usageExample3 }}</code></pre>
        </div>

        <div class="test-cards">
          <h2>🧪 Test Card Numbers</h2>
          <div class="cards-grid">
            <div class="card-item visa">
              <div class="card-logo">VISA</div>
              <div class="card-number">4242 4242 4242 4242</div>
              <div class="card-status success">✓ Success</div>
            </div>
            <div class="card-item mastercard">
              <div class="card-logo">Mastercard</div>
              <div class="card-number">5555 5555 5555 4444</div>
              <div class="card-status success">✓ Success</div>
            </div>
            <div class="card-item declined">
              <div class="card-logo">TEST</div>
              <div class="card-number">4000 0000 0000 0002</div>
              <div class="card-status error">✗ Declined</div>
            </div>
            <div class="card-item amex">
              <div class="card-logo">AMEX</div>
              <div class="card-number">3782 822463 10005</div>
              <div class="card-status success">✓ Success</div>
            </div>
          </div>
          <p class="test-note">All cards: Expiry: 12/34, CVC: 123, ZIP: 12345</p>
        </div>

        <div class="results-card" *ngIf="lastPaymentResult">
          <h2>
            <span *ngIf="lastPaymentResult.success">✅ Payment Successful!</span>
            <span *ngIf="!lastPaymentResult.success">❌ Payment Failed</span>
          </h2>
          <div class="result-details">
            <pre>{{ lastPaymentResult.data | json }}</pre>
          </div>
        </div>
      </div>
    </div>

    <app-realistic-payment-modal
      [isOpen]="showPaymentModal"
      [amount]="50"
      [appointmentDetails]="'Dr. Smith - Cardiology Consultation'"
      [isDevelopmentMode]="true"
      (close)="closePaymentModal()"
      (paymentSuccess)="onPaymentSuccess($event)"
      (paymentError)="onPaymentError($event)"
    ></app-realistic-payment-modal>
  `,
  styles: [`
    .demo-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
    }

    .demo-header {
      text-align: center;
      color: white;
      margin-bottom: 40px;
    }

    .demo-header h1 {
      font-size: 48px;
      margin: 0 0 12px 0;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
    }

    .demo-header p {
      font-size: 20px;
      margin: 0;
      opacity: 0.95;
    }

    .demo-content {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      gap: 24px;
    }

    .info-card, .action-card, .usage-card, .test-cards, .results-card {
      background: white;
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    h2 {
      margin: 0 0 20px 0;
      font-size: 24px;
      color: #1f2937;
    }

    h3 {
      margin: 24px 0 12px 0;
      font-size: 18px;
      color: #374151;
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    ul li {
      padding: 8px 0;
      font-size: 16px;
      color: #4b5563;
    }

    .action-card {
      text-align: center;
    }

    .action-card p {
      color: #6b7280;
      margin-bottom: 24px;
    }

    .demo-button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 16px 32px;
      font-size: 18px;
      font-weight: 600;
      border-radius: 12px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 12px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
    }

    .demo-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
    }

    .demo-button:active {
      transform: translateY(0);
    }

    .test-info {
      margin-top: 32px;
      padding: 24px;
      background: #f9fafb;
      border-radius: 12px;
      text-align: left;
    }

    .test-info h3 {
      margin: 0 0 16px 0;
    }

    .test-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }

    .test-item:last-child {
      border-bottom: none;
    }

    .test-item .label {
      color: #6b7280;
      font-weight: 500;
    }

    .test-item .value {
      color: #1f2937;
      font-weight: 600;
    }

    .dev-badge {
      background: #fef3c7;
      color: #92400e;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 14px;
    }

    pre {
      background: #1f2937;
      color: #10b981;
      padding: 20px;
      border-radius: 8px;
      overflow-x: auto;
      font-size: 14px;
      line-height: 1.6;
    }

    code {
      font-family: 'Courier New', monospace;
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }

    .card-item {
      background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
      padding: 20px;
      border-radius: 12px;
      color: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .card-item.visa {
      background: linear-gradient(135deg, #1434cb 0%, #2563eb 100%);
    }

    .card-item.mastercard {
      background: linear-gradient(135deg, #eb001b 0%, #f79e1b 100%);
    }

    .card-item.amex {
      background: linear-gradient(135deg, #006fcf 0%, #0099cc 100%);
    }

    .card-item.declined {
      background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%);
    }

    .card-logo {
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 12px;
      opacity: 0.9;
    }

    .card-number {
      font-family: 'Courier New', monospace;
      font-size: 16px;
      margin-bottom: 12px;
      letter-spacing: 1px;
    }

    .card-status {
      font-size: 14px;
      font-weight: 600;
    }

    .card-status.success {
      color: #86efac;
    }

    .card-status.error {
      color: #fca5a5;
    }

    .test-note {
      color: #6b7280;
      font-size: 14px;
      text-align: center;
      margin: 0;
      padding: 12px;
      background: #f9fafb;
      border-radius: 8px;
    }

    .results-card {
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .result-details {
      background: #f9fafb;
      padding: 16px;
      border-radius: 8px;
      margin-top: 16px;
    }

    .result-details pre {
      margin: 0;
      background: #1f2937;
      color: #10b981;
    }

    @media (max-width: 768px) {
      .demo-header h1 {
        font-size: 32px;
      }

      .demo-header p {
        font-size: 16px;
      }

      .info-card, .action-card, .usage-card, .test-cards, .results-card {
        padding: 20px;
      }

      .cards-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PaymentDemoComponent {
  showPaymentModal = false;
  lastPaymentResult: any = null;

  usageExample1 = `import { RealisticPaymentModalComponent } from './realistic-payment-modal.component';

@Component({
  imports: [RealisticPaymentModalComponent],
  // ...
})`;

  usageExample2 = `<app-realistic-payment-modal
  [isOpen]="showPaymentModal"
  [amount]="50"
  [appointmentDetails]="'Dr. Smith - Cardiology'"
  [isDevelopmentMode]="true"
  (close)="closePaymentModal()"
  (paymentSuccess)="onPaymentSuccess($event)"
  (paymentError)="onPaymentError($event)"
></app-realistic-payment-modal>`;

  usageExample3 = `openPaymentModal() {
  this.showPaymentModal = true;
}

closePaymentModal() {
  this.showPaymentModal = false;
}

onPaymentSuccess(result: any) {
  console.log('Payment successful!', result);
  // Handle success - confirm appointment, show success message, etc.
}

onPaymentError(error: string) {
  console.error('Payment failed:', error);
  // Handle error - show error message, retry, etc.
}`;

  openPaymentModal() {
    this.showPaymentModal = true;
    this.lastPaymentResult = null;
  }

  closePaymentModal() {
    this.showPaymentModal = false;
  }

  onPaymentSuccess(result: any) {
    console.log('Payment successful!', result);
    this.lastPaymentResult = {
      success: true,
      data: result
    };
    
    // Show success notification
    setTimeout(() => {
      alert('✅ Payment Successful!\n\n' + 
            'Amount: $' + result.amount + '\n' +
            'Card: ' + result.cardBrand + ' •••• ' + result.last4);
    }, 100);
  }

  onPaymentError(error: string) {
    console.error('Payment failed:', error);
    this.lastPaymentResult = {
      success: false,
      data: { error }
    };
    
    alert('❌ Payment Failed\n\n' + error);
  }
}
