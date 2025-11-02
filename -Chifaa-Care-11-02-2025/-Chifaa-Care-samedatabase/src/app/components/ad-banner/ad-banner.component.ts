import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ad-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ad-banner-container">
      <!-- Left animated banner with CSS slideshow -->
      <div class="ad-banner ad-banner-left">
        <div class="ad-banner-content">
          <div class="pharmacy-slideshow">
            <img src="assets/ads/libya-pharm.png" alt="Libya Pharm Pharmacy" class="slide-image" />
            <img src="assets/ads/alqalaa.png" alt="Alqalaa Pharmacy" class="slide-image" />
            <img src="assets/ads/alafia.png" alt="ALAFIA Pharmaceutical" class="slide-image" />
            <img src="assets/ads/pharmalibya.png" alt="PharmaLibya Expo" class="slide-image" />
          </div>
        </div>
      </div>

      <!-- Right static banner -->
      <div class="ad-banner ad-banner-right">
        <div class="ad-banner-content">
          <img 
            src="assets/ads/insurance.png" 
            alt="Libya Insurance"
            class="ad-image"
          />
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./ad-banner.component.scss']
})
export class AdBannerComponent {}
