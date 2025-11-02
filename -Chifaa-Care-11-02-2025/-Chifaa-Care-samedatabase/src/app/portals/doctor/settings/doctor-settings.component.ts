import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileService } from '../../../services/profile.service';

@Component({
  selector: 'app-doctor-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="card lift" style="padding:16px;">
      <div class="card-header">Profile & Settings</div>

      <form [formGroup]="form" class="grid" style="gap:12px;" (ngSubmit)="onSave()">
        <div style="display:flex; gap:16px; align-items:center;">
          <img [src]="previewImage || 'https://via.placeholder.com/96'" alt="avatar" width="96" height="96" style="border-radius:50%; object-fit:cover; border:1px solid #e5e7eb;" />
          <div>
            <input type="file" accept="image/*" (change)="onFileSelected($event)" />
            <div style="font-size:12px;color:#64748b;">Upload a profile picture (JPG/PNG)</div>
          </div>
        </div>

        <div class="grid" style="gap:12px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
          <label>First name<br>
            <input formControlName="firstName" style="width:100%;padding:.7rem 1rem;border-radius:12px;border:1px solid #e5e7eb" />
          </label>
          <label>Last name<br>
            <input formControlName="lastName" style="width:100%;padding:.7rem 1rem;border-radius:12px;border:1px solid #e5e7eb" />
          </label>
          <label>Email<br>
            <input formControlName="email" [disabled]="true" style="width:100%;padding:.7rem 1rem;border-radius:12px;border:1px solid #e5e7eb;background:#f9fafb" />
          </label>
          <label>Phone<br>
            <input formControlName="phone" style="width:100%;padding:.7rem 1rem;border-radius:12px;border:1px solid #e5e7eb" />
          </label>
          <label>Gender<br>
            <select formControlName="gender" style="width:100%;padding:.7rem 1rem;border-radius:12px;border:1px solid #e5e7eb">
              <option value="">Select</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
              <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
            </select>
          </label>
          <label>Specialization<br>
            <input formControlName="specialization" style="width:100%;padding:.7rem 1rem;border-radius:12px;border:1px solid #e5e7eb" />
          </label>
          <label>Bio<br>
            <textarea formControlName="bio" rows="3" style="width:100%;padding:.7rem 1rem;border-radius:12px;border:1px solid #e5e7eb"></textarea>
          </label>
          <label>License Number<br>
            <input formControlName="licenseNumber" style="width:100%;padding:.7rem 1rem;border-radius:12px;border:1px solid #e5e7eb" />
          </label>
          <label>Experience (years)<br>
            <input type="number" formControlName="experience" style="width:100%;padding:.7rem 1rem;border-radius:12px;border:1px solid #e5e7eb" />
          </label>
          <label>Consultation Fee<br>
            <input type="number" formControlName="consultationFee" step="0.01" style="width:100%;padding:.7rem 1rem;border-radius:12px;border:1px solid #e5e7eb" />
          </label>
          <label>Available Days (comma separated)<br>
            <input formControlName="availableDays" placeholder="Mon, Tue, Wed" style="width:100%;padding:.7rem 1rem;border-radius:12px;border:1px solid #e5e7eb" />
          </label>
          <label>Available Hours (comma separated ranges)<br>
            <input formControlName="availableHours" placeholder="09:00-12:00, 13:00-17:00" style="width:100%;padding:.7rem 1rem;border-radius:12px;border:1px solid #e5e7eb" />
          </label>
          <label>Languages (comma separated)<br>
            <input formControlName="languages" placeholder="English, French" style="width:100%;padding:.7rem 1rem;border-radius:12px;border:1px solid #e5e7eb" />
          </label>
        </div>

        <div style="display:flex; gap:8px; justify-content:flex-end; margin-top:8px;">
          <button class="btn btn-green" type="submit" [disabled]="form.invalid || loading">{{ loading ? 'Saving...' : 'Save' }}</button>
        </div>
      </form>
    </div>
  `,
  styles: [`:host{display:block}`]
})
export class DoctorSettingsComponent {
  form: FormGroup;
  loading = false;
  previewImage: string | null = null;

  constructor(private fb: FormBuilder, private profileService: ProfileService) {
    this.form = this.fb.group({
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      firstName: [''],
      lastName: [''],
      phone: [''],
      gender: [''],
      profileImage: [''],
      // Doctor profile fields
      specialization: [''],
      bio: [''],
      licenseNumber: [''],
      experience: [''],
      consultationFee: [''],
      availableDays: [''],
      availableHours: [''],
      languages: [''],
    });

    this.loadProfile();
  }

  private loadProfile() {
    this.profileService.getMyProfile().subscribe({
      next: (res: any) => {
        const data = res?.data || res;
        const user = data?.user || data;
        const doctorProfile = user?.doctorProfile || user?.data?.doctorProfile || {};
        this.form.patchValue({
          email: user?.email || '',
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          phone: user?.phone || '',
          gender: user?.gender || '',
          profileImage: user?.profileImage || '',
          specialization: doctorProfile?.specialization || '',
          bio: doctorProfile?.bio || '',
          licenseNumber: doctorProfile?.licenseNumber || '',
          experience: doctorProfile?.experience || '',
          consultationFee: doctorProfile?.consultationFee || '',
          availableDays: this.normalizeArrayField(doctorProfile?.availableDays),
          availableHours: this.normalizeArrayField(doctorProfile?.availableHours),
          languages: this.normalizeArrayField(doctorProfile?.languages),
        });
        this.previewImage = user?.profileImage || null;
      },
      error: (err) => console.error('Failed to load profile', err)
    });
  }

  private normalizeArrayField(value: any): string {
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'string') {
      try {
        const arr = JSON.parse(value);
        return Array.isArray(arr) ? arr.join(', ') : value;
      } catch {
        return value;
      }
    }
    return '';
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        this.previewImage = base64;
        this.form.get('profileImage')?.setValue(base64);
      };
      reader.readAsDataURL(file);
    }
  }

  onSave() {
    if (this.form.invalid) return;
    this.loading = true;

    const v = this.form.getRawValue();
    const payload: any = {
      firstName: v.firstName,
      lastName: v.lastName,
      phone: v.phone,
      gender: v.gender || undefined,
      profileImage: v.profileImage || undefined,
      doctorProfile: {
        specialization: v.specialization || undefined,
        bio: v.bio || undefined,
        licenseNumber: v.licenseNumber || undefined,
        experience: v.experience ? Number(v.experience) : undefined,
        consultationFee: v.consultationFee ? Number(v.consultationFee) : undefined,
        availableDays: JSON.stringify(this.csvToArray(v.availableDays)),
        availableHours: JSON.stringify(this.csvToArray(v.availableHours)),
        languages: JSON.stringify(this.csvToArray(v.languages)),
      },
    };

    this.profileService.updateMyProfile(payload).subscribe({
      next: () => {
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to save profile', err);
        this.loading = false;
      }
    });
  }

  private csvToArray(val: string): string[] {
    if (!val) return [];
    return val
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }
}
