import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  constructor() { }

  /**
   * Submit contact form data
   * In a real application, this would send data to a backend API
   */
  submitContactForm(formData: ContactFormData): Observable<ContactResponse> {
    // Simulate API call with delay
    return of({
      success: true,
      message: 'Thank you for your message! We\'ll get back to you within 24 hours.',
      timestamp: new Date()
    }).pipe(delay(1000));
  }

  /**
   * Get contact information for different offices
   */
  getContactInfo() {
    return {
      libya: {
        address: '123 Healthcare Street, Tripoli, Libya',
        phone: '+218 21 123 4567',
        email: 'libya@chifaacare.com',
        hours: 'Sunday - Thursday: 8:00 AM - 6:00 PM'
      },
      tunisia: {
        address: '456 Medical Center Blvd, Tunis, Tunisia',
        phone: '+216 71 987 6543',
        email: 'tunisia@chifaacare.com',
        hours: 'Sunday - Thursday: 8:00 AM - 6:00 PM'
      }
    };
  }

  /**
   * Get business hours
   */
  getBusinessHours() {
    return {
      libya: {
        weekdays: '8:00 AM - 6:00 PM',
        weekend: '9:00 AM - 2:00 PM',
        timezone: 'GMT+2'
      },
      tunisia: {
        weekdays: '8:00 AM - 6:00 PM',
        weekend: '9:00 AM - 2:00 PM',
        timezone: 'GMT+1'
      }
    };
  }

  /**
   * Get emergency contact information
   */
  getEmergencyContacts() {
    return {
      libya: '+218 21 123 4567',
      tunisia: '+216 71 987 6543',
      international: '+1 555 123 4567'
    };
  }
} 