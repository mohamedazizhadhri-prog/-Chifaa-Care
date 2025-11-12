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

      <!-- Right static banner -->
      <div class="ad-banner ad-banner-right" *ngIf="!isLoading && rightBanner">
        <div class="ad-banner-content">
          <img 
            [src]="rightBanner.imageUrl" 
            [alt]="rightBanner.altText"
            class="ad-image"
            (error)="handleImageError($event, rightBanner)"
            loading="lazy"
          />
        </div>
      </div>

      <!-- Bottom News Ticker Style Banner -->
      <div class="news-ticker-banner" *ngIf="!isLoading && leftBanners.length > 0">
        <div class="ticker-content">
          <!-- Duplicate the items for seamless loop -->
          <div class="ticker-track">
            <div class="ticker-item" *ngFor="let banner of tickerBanners">
              <div class="ticker-logo-wrapper">
                <img 
                  [src]="banner.imageUrl" 
                  [alt]="banner.altText"
                  class="ticker-logo"
                  (error)="handleImageError($event, banner)"
                  loading="lazy"
                />
              </div>
              <span class="ticker-separator">•</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./ad-banner.component.scss']
})
export class AdBannerComponent implements OnInit, OnDestroy {
  leftBanners: AdBanner[] = [];
  rightBanner: AdBanner | null = null;
  tickerBanners: AdBanner[] = [];
  currentLeftIndex = 0;
  private intervalId: any;

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
    try {
      // Connect to WebSocket
      this.socketService.connect('ad-banner-component');
      this.isConnected = true;
      
      // Listen for connection status
      this.socketService.on('connect', () => {
        this.isConnected = true;
        this.error = null;
        console.log('WebSocket connected');
        this.socketService.emit('ads:request');
      });

      // Listen for disconnection
      this.socketService.on('disconnect', () => {
        this.isConnected = false;
        this.error = 'Disconnected from ad server. Reconnecting...';
        console.warn('WebSocket disconnected');
      });

      // Listen for connection errors
      this.socketService.on('connect_error', (error) => {
        this.isConnected = false;
        this.error = 'Connection error. Will retry...';
        console.error('WebSocket connection error:', error);
      });

      // Listen for new ads
      this.socketService.on<AdBanner[]>('ads:update', (ads) => {
        if (Array.isArray(ads)) {
          this.processAds(ads);
          this.isLoading = false;
          this.error = null;
        } else {
          console.error('Received invalid ads data:', ads);
          this.error = 'Invalid ad data received';
        }
      });

      // Fallback in case connection is already established
      setTimeout(() => {
        if (this.isConnected && this.leftBanners.length === 0) {
          this.socketService.emit('ads:request');
        }
      }, 1000);

      // Load default ads if WebSocket fails
      setTimeout(() => {
        if (this.leftBanners.length === 0 && this.rightBanner === null) {
          this.loadDefaultAds();
        }
      }, 3000);

    } catch (error) {
      console.error('Error initializing WebSocket:', error);
      this.loadDefaultAds();
    }
  }

  private processAds(ads: AdBanner[]) {
    if (!ads || !ads.length) {
      console.warn('Received empty ads array');
      this.loadDefaultAds();
      return;
    }

    try {
      // Separate left and right banners
      const validAds = ads.filter(ad => 
        ad && 
        typeof ad.id === 'string' && 
        typeof ad.imageUrl === 'string' &&
        typeof ad.altText === 'string' &&
        (ad.type === 'left' || ad.type === 'right')
      );

      if (validAds.length === 0) {
        throw new Error('No valid ads found in the response');
      }

      this.leftBanners = validAds.filter(ad => ad.type === 'left');
      const rightBanner = validAds.find(ad => ad.type === 'right');
      
      if (rightBanner) {
        this.rightBanner = rightBanner;
      } else if (validAds.length > 0) {
        this.rightBanner = { ...validAds[0], type: 'right' };
      }

      // Create ticker banners (triple them for seamless loop)
      if (this.leftBanners.length > 0) {
        this.tickerBanners = [
          ...this.leftBanners,
          ...this.leftBanners,
          ...this.leftBanners
        ];
      }
    } catch (error) {
      console.error('Error processing ads:', error);
      this.loadDefaultAds();
    }
  }

  private loadDefaultAds() {
    console.log('Loading default ads');
    this.isLoading = false;
    this.error = null;
    
    // Default ads that will be shown if WebSocket fails
    const defaultAds: AdBanner[] = [
      {
        id: 'default-1',
        imageUrl: 'assets/ads/libya-pharm.png',
        altText: 'Libya Pharm Pharmacy',
        type: 'left',
        duration: 5000
      },
      {
        id: 'default-2',
        imageUrl: 'assets/ads/alqalaa.png',
        altText: 'Alqalaa Pharmacy',
        type: 'left',
        duration: 5000
      },
      {
        id: 'default-3',
        imageUrl: 'assets/ads/pharmalibya.png',
        altText: 'Pharma Libya',
        type: 'left',
        duration: 5000
      },
      {
        id: 'default-4',
        imageUrl: 'assets/ads/alafia.png',
        altText: 'Alafia Pharmacy',
        type: 'left',
        duration: 5000
      },
      {
        id: 'default-5',
        imageUrl: 'assets/ads/insurance.png',
        altText: 'Libya Insurance',
        type: 'right'
      }
    ];

    this.processAds(defaultAds);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.socketService.off('ads:update');
  }
}
