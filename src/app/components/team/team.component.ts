import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  image: string;
  bio: string;
  specialties: string[];
}

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="team-section" id="team">
      <div class="team-container">
        <div class="section-header">
          <h2 class="section-title">Meet Our Expert Team</h2>
          <p class="section-subtitle">Dedicated professionals committed to transforming oncology care in Libya</p>
        </div>
        
        <div class="team-grid">
          <div class="team-card" *ngFor="let member of teamMembers" (click)="openMemberModal(member)">
            <div class="member-image">
              <img [src]="member.image" [alt]="member.name" class="team-member-img">
            </div>
            <div class="member-info">
              <h3 class="member-name">{{ member.name }}</h3>
              <p class="member-role">{{ member.role }}</p>
            </div>
            <div class="card-overlay">
              <i class="fas fa-info-circle"></i>
              <span>Click for details</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Team Member Modal -->
      <div class="member-modal" [class.active]="selectedMember" (click)="closeMemberModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <button class="modal-close" (click)="closeMemberModal()">
            <i class="fas fa-times"></i>
          </button>
          
          <div class="member-details" *ngIf="selectedMember">
            <div class="member-header">
              <div class="member-image-large">
                <img [src]="selectedMember.image" [alt]="selectedMember.name" class="team-member-img-large">
              </div>
              <div class="member-info-large">
                <h2 class="member-name-large">{{ selectedMember.name }}</h2>
                <p class="member-role-large">{{ selectedMember.role }}</p>
              </div>
            </div>
            
            <div class="member-bio">
              <p>{{ selectedMember.bio }}</p>
            </div>
            
            <div class="member-specialties">
              <h3>Specialties</h3>
              <div class="specialty-tags">
                <span class="specialty-tag" *ngFor="let specialty of selectedMember.specialties">
                  {{ specialty }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./team.component.scss']
})
export class TeamComponent implements OnInit {
  selectedMember: TeamMember | null = null;
  
  teamMembers: TeamMember[] = [
    {
      id: 1,
      name: "SEIFEDDINE GHEDAMSI",
      role: "CEO",
      image: "assets/images/seif.png",
      bio: "Seifeddine Ghedamsi is the visionary CEO of ChifaaCare, leading the company's mission to revolutionize healthcare in Libya. With a strong background in business strategy and healthcare innovation, he is committed to making quality medical care accessible to all. His leadership has been instrumental in establishing ChifaaCare as a trusted platform connecting patients with healthcare providers.",
      specialties: ["Healthcare Strategy", "Business Development", "Digital Health Innovation", "Team Leadership"]
    },
    {
      id: 2,
      name: "ASMA HEMRIT",
      role: "Financial Manager & Business Development",
      image: "assets/images/asma.png",
      bio: "Asma Hemrit brings extensive expertise in financial management and business development to ChifaaCare. She oversees the company's financial strategy and identifies growth opportunities to expand our reach and impact. Her analytical skills and strategic vision ensure ChifaaCare's sustainable growth while maintaining our commitment to accessible healthcare.",
      specialties: ["Financial Planning", "Business Strategy", "Investment Management", "Strategic Partnerships"]
    },
    {
      id: 3,
      name: "SONIA BOUZID",
      role: "Chief Technology Officer",
      image: "assets/images/sonia.png",
      bio: "Sonia Bouzid is our Chief Technology Officer, driving the technological innovation behind ChifaaCare's platform. With deep expertise in software development and healthcare technology, she leads our engineering team in building secure, scalable, and user-friendly solutions. Her technical leadership ensures that ChifaaCare delivers a seamless experience for both patients and healthcare providers.",
      specialties: ["Healthcare Technology", "Software Architecture", "Data Security", "Platform Development"]
    },
    {
      id: 4,
      name: "SARA BEN SALEM",
      role: "Operations & Talent Development Manager",
      image: "assets/images/sarra.png",
      bio: "Sara Ben Salem manages ChifaaCare's operations and talent development initiatives. She ensures smooth day-to-day operations while fostering a culture of continuous learning and professional growth. Her dedication to team development and operational excellence helps ChifaaCare maintain high standards of service delivery and employee satisfaction.",
      specialties: ["Operations Management", "HR Strategy", "Team Development", "Process Optimization"]
    }
  ];

  ngOnInit() {
    this.setupScrollAnimation();
  }

  openMemberModal(member: TeamMember) {
    this.selectedMember = member;
    document.body.style.overflow = 'hidden';
  }

  closeMemberModal() {
    this.selectedMember = null;
    document.body.style.overflow = 'auto';
  }

  private setupScrollAnimation() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const teamCards = entry.target.querySelectorAll('.team-card');
          teamCards.forEach((card, index) => {
            setTimeout(() => {
              card.classList.add('animate-in');
            }, index * 200);
          });
        }
      });
    }, { threshold: 0.3 });

    const section = document.querySelector('.team-section');
    if (section) {
      observer.observe(section);
    }
  }
} 