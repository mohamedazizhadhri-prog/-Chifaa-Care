import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Slide {
  icon: string;
  title: string;
  text: string;
  offer: string;
  buttonText: string;
  gradient: string;
}

@Component({
  selector: 'app-pharmacy-overlay-ad',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pharmacy-overlay-ad.component.html',
  styleUrls: ['./pharmacy-overlay-ad.component.scss']
})
export class PharmacyOverlayAdComponent implements OnInit, OnDestroy {
  // Configuration
  private readonly SHOW_ON_LOAD = true;
  private readonly SHOW_ON_SCROLL = true;
  private readonly PERIODIC_SHOW = true;
  private readonly SCROLL_THRESHOLD = 0.5; // Show after 50% scroll
  private readonly PERIODIC_INTERVAL = 180000; // 3 minutes
  private readonly CAROUSEL_INTERVAL = 4000; // 4 seconds

  isVisible = false;
  currentSlideIndex = 0;
  private hasShownOnScroll = false;
  private carouselTimer: any;
  private periodicTimer: any;

  slides: Slide[] = [
    {
      icon: '💊',
      title: 'Welcome to ChifaaCare!',
      text: 'Your trusted partner in health and wellness',
      offer: '30% OFF First Order',
      buttonText: 'Claim Offer',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      icon: '🎁',
      title: 'Exclusive Deals',
      text: 'Limited time offers on premium health products',
      offer: 'Buy 2 Get 1 Free',
      buttonText: 'Shop Deals',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      icon: '🚚',
      title: 'Free Delivery',
      text: 'On all orders above $50 - Fast & Secure',
      offer: 'Express Shipping',
      buttonText: 'Order Now',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    }
  ];

  ngOnInit() {
    // Show on page load
    if (this.SHOW_ON_LOAD) {
      setTimeout(() => this.showOverlay(), 1000);
    }

    // Setup periodic show
    if (this.PERIODIC_SHOW) {
      this.periodicTimer = setInterval(() => {
        if (!this.isVisible) {
          this.showOverlay();
        }
      }, this.PERIODIC_INTERVAL);
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (!this.SHOW_ON_SCROLL || this.hasShownOnScroll) return;

    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = window.scrollY;

    if (scrolled / scrollHeight >= this.SCROLL_THRESHOLD) {
      this.hasShownOnScroll = true;
      this.showOverlay();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent) {
    if (this.isVisible) {
      this.hideOverlay();
    }
  }

  showOverlay() {
    this.isVisible = true;
    document.body.style.overflow = 'hidden';
    this.startCarousel();
  }

  hideOverlay() {
    this.isVisible = false;
    document.body.style.overflow = 'auto';
    this.stopCarousel();
  }

  startCarousel() {
    this.carouselTimer = setInterval(() => {
      this.nextSlide();
    }, this.CAROUSEL_INTERVAL);
  }

  stopCarousel() {
    if (this.carouselTimer) {
      clearInterval(this.carouselTimer);
    }
  }

  nextSlide() {
    this.currentSlideIndex = (this.currentSlideIndex + 1) % this.slides.length;
  }

  goToSlide(index: number) {
    this.currentSlideIndex = index;
    this.stopCarousel();
    this.startCarousel();
  }

  onCtaClick(slide: Slide) {
    console.log(`CTA clicked: ${slide.buttonText}`);
    // Add your navigation logic here
    alert(`Redirecting to ${slide.buttonText}...`);
    this.hideOverlay();
  }

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('overlay')) {
      this.hideOverlay();
    }
  }

  ngOnDestroy() {
    this.stopCarousel();
    if (this.periodicTimer) {
      clearInterval(this.periodicTimer);
    }
    document.body.style.overflow = 'auto';
  }
}
