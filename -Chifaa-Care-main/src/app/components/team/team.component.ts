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
              <div class="image-placeholder">
                <i class="fas fa-user-md"></i>
              </div>
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
                <div class="image-placeholder">
                  <i class="fas fa-user-md"></i>
                </div>
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
      name: "Dr. Ahmed Ben Salem",
      role: "Chief Oncologist",
      image: "assets/images/team/dr-ahmed.jpg",
      bio: "Dr. Ben Salem is a board-certified oncologist with over 15 years of experience in treating various types of cancer. He specializes in breast and lung oncology, having trained at prestigious institutions in Tunisia and France. Dr. Ben Salem is passionate about making quality oncology care accessible to all patients, regardless of their location.",
      specialties: ["Breast Cancer", "Lung Cancer", "Chemotherapy", "Targeted Therapy"]
    },
    {
      id: 2,
      name: "Dr. Fatima Al-Zahra",
      role: "Senior Oncologist",
      image: "assets/images/team/dr-fatima.jpg",
      bio: "Dr. Al-Zahra is a highly skilled oncologist specializing in gastrointestinal and colorectal cancers. With 12 years of clinical experience, she has developed innovative treatment protocols that combine traditional oncology with cutting-edge immunotherapy approaches. She believes in personalized care plans that address both the physical and emotional needs of patients.",
      specialties: ["Gastrointestinal Cancer", "Colorectal Cancer", "Immunotherapy", "Clinical Trials"]
    },
    {
      id: 3,
      name: "Dr. Omar Mansouri",
      role: "Radiation Oncologist",
      image: "assets/images/team/dr-omar.jpg",
      bio: "Dr. Mansouri is a radiation oncologist with expertise in advanced radiation therapy techniques including IMRT, SBRT, and proton therapy. He has treated over 2000 patients and is known for his precision and attention to detail. Dr. Mansouri is committed to minimizing side effects while maximizing treatment effectiveness.",
      specialties: ["Radiation Therapy", "IMRT", "SBRT", "Proton Therapy"]
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