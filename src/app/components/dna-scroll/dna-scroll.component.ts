import { Component, HostListener, ElementRef, Renderer2, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dna-scroll',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dna-scroll" 
         (click)="scrollToPosition()"
         [class.hover]="isHovered"
         [class.top-half]="isTopHalf"
         (mouseenter)="isHovered = true"
         (mouseleave)="isHovered = false"
         #dnaButton>
      <img src="assets/images/dna.gif" alt="DNA Scroll" class="dna-gif">
      <div class="tooltip" [class.visible]="isHovered">
        {{ isTopHalf ? 'Scroll Down' : 'Scroll Up' }}
      </div>
    </div>
  `,
  styles: [`
    @keyframes rotate {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes glow {
      0%, 100% { 
        filter: drop-shadow(0 0 5px rgba(59, 130, 246, 0.5)) 
                drop-shadow(0 0 10px rgba(16, 185, 129, 0.5));
      }
      50% { 
        filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.8)) 
                drop-shadow(0 0 20px rgba(16, 185, 129, 0.8));
      }
    }
    
    @keyframes connectorPulse {
      0%, 100% { 
        opacity: 0.6;
        transform: scaleY(1);
      }
      50% { 
        opacity: 1;
        transform: scaleY(1.2);
      }
    }
    
    @keyframes trail {
      0% { 
        transform: scale(0.8);
        opacity: 0;
      }
      20% {
        opacity: 0.8;
      }
      100% { 
        transform: scale(1.5);
        opacity: 0;
      }
    }
    .dna-scroll {
      position: fixed;
      left: 5px;
      bottom: 20px;
      width: 60px;
      height: 60px;
      cursor: pointer;
      z-index: 1000;
      transition: all 0.3s ease;
      opacity: 0.8;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .dna-scroll:hover {
      transform: scale(1.1);
      opacity: 1;
    }
    
    .dna-gif {
      width: 100%;
      height: 100%;
      object-fit: contain;
      transition: transform 0.3s ease;
      transform: rotate(90deg);
    }
    
    .dna-scroll:hover .dna-gif {
      transform: rotate(90deg) scale(1.1);
    }



    .tooltip {
      position: absolute;
      bottom: 70px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(255, 255, 255, 0.95);
      color: #1e40af;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      pointer-events: none;
    }

    .tooltip.visible {
      opacity: 1;
      visibility: visible;
      transform: translateX(-50%) translateY(-5px);
    }

    @keyframes float {
      0%, 100% { transform: translateZ(0) translateY(0); }
      50% { transform: translateZ(10px) translateY(-5px); }
    }

    @media (max-width: 768px) {
      .dna-scroll {
        width: 40px;
        height: 40px;
        left: 10px;
        bottom: 10px;
      }
    }
  `]
})
export class DnaScrollComponent implements OnInit {
  isTopHalf = true;
  isHovered = false;
  private animationId: number | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.animate = this.animate.bind(this);
  }

  ngOnInit() {
    // Initial check
    this.checkScrollPosition();
    
    // Check again after a small delay to ensure correct initial state
    setTimeout(() => {
      this.checkScrollPosition();
    }, 100);
    
    this.animate();
  }

  ngOnDestroy() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private animate() {
    // Animation is now handled by the GIF
    this.animationId = requestAnimationFrame(this.animate);
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    this.checkScrollPosition();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScrollPosition();
  }

  checkScrollPosition() {
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // If we're at the very top or in the top quarter of the page, show 'Scroll Down'
    // Otherwise show 'Scroll Up'
    this.isTopHalf = scrollPosition < (windowHeight * 0.25);
  }

  scrollToPosition() {
    const scrollOptions: ScrollToOptions = {
      behavior: 'smooth'
    };

    // Add click animation
    const dnaButton = this.el.nativeElement;
    const dnaGif = dnaButton.querySelector('.dna-gif');
    
    // Add pulse effect on click
    dnaGif.style.transform = 'rotate(90deg) scale(1.2)';
    setTimeout(() => {
      dnaGif.style.transform = 'rotate(90deg) scale(1.1)';
    }, 300);

    // Scroll to position immediately
    if (this.isTopHalf) {
      // Scroll to bottom
      window.scrollTo({
        ...scrollOptions,
        top: document.documentElement.scrollHeight
      });
    } else {
      // Scroll to top
      window.scrollTo({
        ...scrollOptions,
        top: 0
      });
    }
  }
}
