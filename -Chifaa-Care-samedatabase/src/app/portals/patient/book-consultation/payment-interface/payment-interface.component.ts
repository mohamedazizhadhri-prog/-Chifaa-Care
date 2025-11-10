import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { loadStripe, Stripe, StripeElements, StripeCardElement, StripeCardNumberElement, StripeCardExpiryElement, StripeCardCvcElement } from '@stripe/stripe-js';

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  type: 'card' | 'bank' | 'upi' | 'paypal';
}

export interface CardData {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
}

@Component({
  selector: 'app-payment-interface',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-interface.component.html',
  styleUrls: ['./payment-interface.component.scss']
})
export class PaymentInterfaceComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() amount: number = 0;
  @Input() appointmentDetails: any = {};
  @Input() useMockPayment: boolean = false;
  @Input() clientSecret: string = '';
  @Input() stripe: Stripe | null = null;
  
  @Output() paymentComplete = new EventEmitter<{ success: boolean; error?: string }>();
  @Output() goBack = new EventEmitter<void>();

  selectedPaymentMethod: 'card' | 'bank' | 'upi' | 'paypal' = 'card';
  isProcessing = false;
  errorMessage = '';
  
  // Stripe Elements
  cardNumberElement: StripeCardNumberElement | null = null;
  cardExpiryElement: StripeCardExpiryElement | null = null;
  cardCvcElement: StripeCardCvcElement | null = null;
  elements: StripeElements | null = null;

  // Mock card data for development
  mockCardData: CardData = {
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  };

  // Payment methods
  paymentMethods: PaymentMethod[] = [
    { id: 'card', name: 'Credit/Debit Card', icon: 'fas fa-credit-card', type: 'card' },
    { id: 'bank', name: 'Bank Transfer', icon: 'fas fa-university', type: 'bank' },
    { id: 'upi', name: 'UPI', icon: 'fas fa-mobile-alt', type: 'upi' },
    { id: 'paypal', name: 'PayPal', icon: 'fab fa-paypal', type: 'paypal' }
  ];

  constructor() {}

  ngOnInit(): void {
    console.log('Payment Interface initialized', {
      amount: this.amount,
      useMockPayment: this.useMockPayment,
      hasStripe: !!this.stripe
    });
  }

  ngAfterViewInit(): void {
    if (!this.useMockPayment && this.stripe) {
      setTimeout(() => {
        this.setupStripeElements();
      }, 100);
    }
  }

  ngOnDestroy(): void {
    // Cleanup Stripe elements
    if (this.cardNumberElement) {
      this.cardNumberElement.destroy();
    }
    if (this.cardExpiryElement) {
      this.cardExpiryElement.destroy();
    }
    if (this.cardCvcElement) {
      this.cardCvcElement.destroy();
    }
  }

  private setupStripeElements(): void {
    if (!this.stripe) return;

    const elementStyles = {
      base: {
        fontSize: '16px',
        color: '#32325d',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        '::placeholder': {
          color: '#aab7c4',
        },
        padding: '12px',
      },
      invalid: {
        color: '#fa755a',
      },
    };

    this.elements = this.stripe.elements();

    // Create separate elements for better UX
    this.cardNumberElement = this.elements.create('cardNumber', { 
      style: elementStyles,
      placeholder: '1234 5678 9012 3456'
    });
    
    this.cardExpiryElement = this.elements.create('cardExpiry', { 
      style: elementStyles 
    });
    
    this.cardCvcElement = this.elements.create('cardCvc', { 
      style: elementStyles 
    });

    // Mount elements
    const cardNumberEl = document.getElementById('card-number-element');
    const cardExpiryEl = document.getElementById('card-expiry-element');
    const cardCvcEl = document.getElementById('card-cvc-element');

    if (cardNumberEl && this.cardNumberElement) {
      this.cardNumberElement.mount('#card-number-element');
      this.cardNumberElement.on('change', (event: any) => this.handleCardChange(event, 'number'));
    }

    if (cardExpiryEl && this.cardExpiryElement) {
      this.cardExpiryElement.mount('#card-expiry-element');
      this.cardExpiryElement.on('change', (event: any) => this.handleCardChange(event, 'expiry'));
    }

    if (cardCvcEl && this.cardCvcElement) {
      this.cardCvcElement.mount('#card-cvc-element');
      this.cardCvcElement.on('change', (event: any) => this.handleCardChange(event, 'cvc'));
    }
  }

  private handleCardChange(event: any, field: string): void {
    if (event.error) {
      this.errorMessage = event.error.message;
    } else {
      this.errorMessage = '';
    }
  }

  selectPaymentMethod(method: 'card' | 'bank' | 'upi' | 'paypal'): void {
    this.selectedPaymentMethod = method;
    this.errorMessage = '';
  }

  // Mock card input formatting
  formatCardNumber(value: string): string {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    return parts.length ? parts.join(' ') : value;
  }

  formatExpiry(value: string): string {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  }

  onMockCardInput(field: keyof CardData, value: string): void {
    let formattedValue = value;
    
    if (field === 'number') {
      formattedValue = this.formatCardNumber(value);
      if (formattedValue.replace(/\s/g, '').length > 16) return;
    } else if (field === 'expiry') {
      formattedValue = this.formatExpiry(value);
      if (formattedValue.length > 5) return;
    } else if (field === 'cvv') {
      formattedValue = value.replace(/[^0-9]/gi, '');
      if (formattedValue.length > 4) return;
    }
    
    this.mockCardData[field] = formattedValue;
  }

  validateMockCard(): boolean {
    if (!this.mockCardData.number || this.mockCardData.number.replace(/\s/g, '').length < 16) {
      this.errorMessage = 'Please enter a valid card number';
      return false;
    }
    if (!this.mockCardData.name || this.mockCardData.name.trim().length < 3) {
      this.errorMessage = 'Please enter cardholder name';
      return false;
    }
    if (!this.mockCardData.expiry || this.mockCardData.expiry.length < 5) {
      this.errorMessage = 'Please enter expiry date';
      return false;
    }
    if (!this.mockCardData.cvv || this.mockCardData.cvv.length < 3) {
      this.errorMessage = 'Please enter CVV';
      return false;
    }
    return true;
  }

  async handlePayment(): Promise<void> {
    if (this.isProcessing) return;

    this.errorMessage = '';
    this.isProcessing = true;

    try {
      if (this.useMockPayment) {
        await this.handleMockPayment();
      } else {
        await this.handleStripePayment();
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      this.errorMessage = error.message || 'Payment failed. Please try again.';
      this.paymentComplete.emit({ success: false, error: this.errorMessage });
    } finally {
      this.isProcessing = false;
    }
  }

  private async handleMockPayment(): Promise<void> {
    // Validate mock card data
    if (this.selectedPaymentMethod === 'card' && !this.validateMockCard()) {
      throw new Error(this.errorMessage);
    }

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate success
    this.paymentComplete.emit({ success: true });
  }

  private async handleStripePayment(): Promise<void> {
    if (!this.stripe || !this.cardNumberElement) {
      throw new Error('Stripe is not initialized');
    }

    // Validate cardholder name if using mock
    if (this.selectedPaymentMethod === 'card' && !this.mockCardData.name) {
      throw new Error('Please enter cardholder name');
    }

    // Confirm payment with Stripe
    const { error, paymentIntent } = await this.stripe.confirmCardPayment(
      this.clientSecret,
      {
        payment_method: {
          card: this.cardNumberElement,
          billing_details: {
            name: this.mockCardData.name,
          },
        },
      }
    );

    if (error) {
      throw new Error(error.message);
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      this.paymentComplete.emit({ success: true });
    } else {
      throw new Error('Payment not completed');
    }
  }

  onGoBack(): void {
    this.goBack.emit();
  }

  formatAmount(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }

  getCardBrand(): string {
    const number = this.mockCardData.number.replace(/\s/g, '');
    if (number.startsWith('4')) return 'visa';
    if (number.startsWith('5')) return 'mastercard';
    if (number.startsWith('3')) return 'amex';
    return 'generic';
  }
}
