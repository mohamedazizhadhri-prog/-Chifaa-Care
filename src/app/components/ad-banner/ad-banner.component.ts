import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocketService } from '../../services/socket.service';

interface AdBanner {
  id: string;
  imageUrl: string;
  altText: string;
  type: 'left' | 'right' | 'ticker';
  duration?: number;
}

@Component({
  selector: 'app-ad-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ad-banner-container">
      <!-- Loading state -->
      <div *ngIf="isLoading" class="loading-state">
        <div class="spinner"></div>
        <span>Loading ads...</span>
      </div>

      <!-- Error message -->
      <div *ngIf="error && !isLoading" class="error-message">
        {{ error }}
      </div>

      <!-- Top Left Rotating Banner (Pharmacy Ads) -->
      <div class="ad-banner ad-banner-left" *ngIf="!isLoading && pharmacyAds.length > 0">
        <div class="ad-banner-content">
          <img 
            [src]="currentPharmacyAd.imageUrl" 
            [alt]="currentPharmacyAd.altText"
            class="ad-image"
            (error)="handleImageError($event, currentPharmacyAd)"
            loading="lazy"
          />
        </div>
      </div>

      <!-- Top Right Rotating Banner (Insurance Ads) -->
      <div class="ad-banner ad-banner-right" *ngIf="!isLoading && insuranceAds.length > 0">
        <div class="ad-banner-content">
          <img 
            [src]="currentInsuranceAd.imageUrl" 
            [alt]="currentInsuranceAd.altText"
            class="ad-image"
            (error)="handleImageError($event, currentInsuranceAd)"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./ad-banner.component.scss']
})
export class AdBannerComponent implements OnInit, OnDestroy {
  insuranceAds: AdBanner[] = [];
  pharmacyAds: AdBanner[] = [];
  
  currentInsuranceAd: AdBanner = {
    id: 'default-insurance',
    imageUrl: 'assets/ads/ad.PNG',
    altText: 'Insurance Ad',
    type: 'right'
  };
  
  currentPharmacyAd: AdBanner = {
    id: 'default-pharmacy',
    imageUrl: 'assets/ads/libya-pharm.png',
    altText: 'Pharmacy Ad',
    type: 'left'
  };
  
  currentInsuranceIndex = 0;
  currentPharmacyIndex = 0;
  
  private insuranceIntervalId: any;
  private pharmacyIntervalId: any;

  constructor(private socketService: SocketService) {}

  isConnected = false;
  isLoading = true;
  error: string | null = null;

  // Handle image loading errors
  handleImageError(event: Event, banner: AdBanner) {
    const img = event.target as HTMLImageElement;
    console.error(`Failed to load image: ${banner.imageUrl}`);
    img.style.display = 'none';
  }

  ngOnInit() {
    // Load ads immediately without WebSocket
    this.loadDefaultAds();
  }



  private loadDefaultAds() {
    console.log('Loading ads');
    this.isLoading = false;
    this.error = null;
    
    this.setupInsuranceAds();
    this.setupPharmacyAds();
  }

  private setupInsuranceAds() {
    // Insurance ads for top RIGHT rotating banner
    this.insuranceAds = [
      {
        id: 'insurance-1',
        imageUrl: 'assets/ads/ad.PNG',
        altText: 'Insurance Company Ad',
        type: 'right',
        duration: 5000
      },
      {
        id: 'insurance-2',
        imageUrl: 'assets/ads/insurance.png',
        altText: 'Libya Insurance',
        type: 'right',
        duration: 5000
      }
    ];

    if (this.insuranceAds.length > 0) {
      this.currentInsuranceAd = this.insuranceAds[0];
      this.startInsuranceRotation();
    }
  }

  private setupPharmacyAds() {
    // Pharmacy ads for top LEFT rotating banner
    this.pharmacyAds = [
      {
        id: 'pharmacy-1',
        imageUrl: 'assets/ads/libya-pharm.png',
        altText: 'Libya Pharm Pharmacy',
        type: 'left',
        duration: 5000
      },
      {
        id: 'pharmacy-2',
        imageUrl: 'assets/ads/alqalaa.png',
        altText: 'Alqalaa Pharmacy',
        type: 'left',
        duration: 5000
      },
      {
        id: 'pharmacy-3',
        imageUrl: 'assets/ads/pharmalibya.png',
        altText: 'Pharma Libya',
        type: 'left',
        duration: 5000
      },
      {
        id: 'pharmacy-4',
        imageUrl: 'assets/ads/alafia.png',
        altText: 'Alafia Pharmacy',
        type: 'left',
        duration: 5000
      }
    ];

    if (this.pharmacyAds.length > 0) {
      this.currentPharmacyAd = this.pharmacyAds[0];
      this.startPharmacyRotation();
    }
  }

  private startInsuranceRotation() {
    // Rotate insurance ads every 5 seconds
    this.insuranceIntervalId = setInterval(() => {
      this.currentInsuranceIndex = (this.currentInsuranceIndex + 1) % this.insuranceAds.length;
      this.currentInsuranceAd = this.insuranceAds[this.currentInsuranceIndex];
    }, 5000);
  }

  private startPharmacyRotation() {
    // Rotate pharmacy ads every 5 seconds
    this.pharmacyIntervalId = setInterval(() => {
      this.currentPharmacyIndex = (this.currentPharmacyIndex + 1) % this.pharmacyAds.length;
      this.currentPharmacyAd = this.pharmacyAds[this.currentPharmacyIndex];
    }, 5000);
  }

  ngOnDestroy() {
    if (this.insuranceIntervalId) {
      clearInterval(this.insuranceIntervalId);
    }
    if (this.pharmacyIntervalId) {
      clearInterval(this.pharmacyIntervalId);
    }
  }
}
