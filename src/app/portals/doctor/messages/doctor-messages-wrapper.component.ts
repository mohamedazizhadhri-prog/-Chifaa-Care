import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DoctorMessagesComponent } from './doctor-messages.component';
// Import the component directly from its location
import { DoctorDoctorMessagesComponent } from '../../doctor/doctor-messages/doctor-doctor-messages.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-doctor-messages-wrapper',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    DoctorMessagesComponent,
    DoctorDoctorMessagesComponent
  ],
  template: `
    <div class="messages-wrapper">
      <div class="tabs">
        <div class="tab-buttons">
          <button 
            class="tab-button" 
            [class.active]="activeTab === 'patients'"
            (click)="switchTab('patients')"
          >
            <i class="fa-solid fa-user-injured"></i> Messages with Patients
          </button>
          <button 
            class="tab-button" 
            [class.active]="activeTab === 'doctors'"
            (click)="switchTab('doctors')"
          >
            <i class="fa-solid fa-user-doctor"></i> Messages with Doctors
          </button>
        </div>
      </div>
      
      <div class="tab-content">
        @if (activeTab === 'patients') {
          <app-doctor-messages *ngIf="activeTab === 'patients'"></app-doctor-messages>
        } @else {
          <app-doctor-doctor-messages *ngIf="activeTab === 'doctors'"></app-doctor-doctor-messages>
        }
      </div>
    </div>
  `,
  styles: [`
    .messages-wrapper {
      height: 100%;
      display: flex;
      flex-direction: column;
      background: #f5f7fa;
    }
    
    .tabs {
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      padding: 15px 20px;
      border-bottom: 1px solid #eaeef2;
    }
    
    .tab-buttons {
      display: flex;
      gap: 10px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .tab-button {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      background: #f0f2f5;
      color: #4a5568;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
    }
    
    .tab-button:hover {
      background: #e2e8f0;
    }
    
    .tab-button.active {
      background: #3182ce;
      color: white;
    }
    
    .tab-button i {
      font-size: 16px;
    }
    
    .tab-content {
      flex: 1;
      overflow: hidden;
      background: white;
      border-radius: 8px;
      margin: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .tabs {
      display: flex;
      border-bottom: 1px solid #e2e8f0;
      padding: 0 1rem;
      gap: 1rem;
    }
    
    .tab-button {
      padding: 0.75rem 1.5rem;
      background: none;
      border: none;
      border-bottom: 3px solid transparent;
      font-size: 0.9rem;
      font-weight: 500;
      color: #64748b;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
      
      &:hover {
        color: #3b82f6;
      }
      
      &.active {
        color: #3b82f6;
        border-bottom-color: #3b82f6;
      }
      
      i {
        font-size: 1rem;
      }
    }
    
    .tab-content {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
  `]
})
export class DoctorMessagesWrapperComponent implements OnInit {
  activeTab: 'patients' | 'doctors' = 'patients';
  
  constructor(private authService: AuthService) {}
  
  ngOnInit() {
    // You can add any initialization logic here
  }
  
  switchTab(tab: 'patients' | 'doctors') {
    this.activeTab = tab;
    // You can add any additional logic when switching tabs
  }
}
