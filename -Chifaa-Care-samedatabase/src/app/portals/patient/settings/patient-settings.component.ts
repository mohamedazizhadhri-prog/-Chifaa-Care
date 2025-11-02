import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileService } from '../../../services/profile.service';

@Component({
  selector: 'app-patient-settings',
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
          <label>Date of Birth<br>
            <input type="date" formControlName="dateOfBirth" style="width:100%;padding:.7rem 1rem;border-radius:12px;border:1px solid #e5e7eb" />
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
          <label>Blood Type<br>
            <input formControlName="bloodType" style="width:100%;padding:.7rem 1rem;border-radius:12px;border:1px solid #e5e7eb" />
          </label>
          <label>Height (cm)<br>
            <input type="number" formControlName="height" style="width:100%;padding:.7rem 1rem;border-radius:12px;border:1px solid #e5e7eb" />
          </label>
          <label>Weight (kg)<br>
            <input type="number" formControlName="weight" style="width:100%;padding:.7rem 1rem;border-radius:12px;border:1px solid #e5e7eb" />
          </label>
          <label>Allergies (comma separated)<br>
            <input formControlName="allergies" placeholder="e.g. Penicillin, Nuts" style="width:100%;padding:.7rem 1rem;border-radius:12px;border:1px solid #e5e7eb" />
          </label>
          <label>Medications (comma separated)<br>
            <input formControlName="medications" placeholder="e.g. Ibuprofen" style="width:100%;padding:.7rem 1rem;border-radius:12px;border:1px solid #e5e7eb" />
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
export class PatientSettingsComponent {
  form: FormGroup;
  loading = false;
  previewImage: string | null = null;
  private selectedFile: File | null = null;

  constructor(private fb: FormBuilder, private profileService: ProfileService) {
    this.form = this.fb.group({
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      firstName: [''],
      lastName: [''],
      phone: [''],
      dateOfBirth: [''],
      gender: [''],
      profileImage: [''],
      // Patient profile fields
      bloodType: [''],
      height: [''],
      weight: [''],
      allergies: [''], // comma separated string for UI, will convert to JSON string
      medications: [''],
    });

    this.loadProfile();
  }

  private loadProfile() {
    this.profileService.getMyProfile().subscribe({
      next: (res: any) => {
        const data = res?.data || res; // API returns { status, data } per backend
        const user = data?.user || data; // getMyProfile returns data fields directly

        const patientProfile = user?.patientProfile || user?.data?.patientProfile || {};
        this.form.patchValue({
          email: user?.email || '',
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          phone: user?.phone || '',
          dateOfBirth: user?.dateOfBirth ? this.toDateInput(user.dateOfBirth) : '',
          gender: user?.gender || '',
          profileImage: user?.profileImage || '',
          bloodType: patientProfile?.bloodType || '',
          height: patientProfile?.height || '',
          weight: patientProfile?.weight || '',
          allergies: this.normalizeArrayField(patientProfile?.allergies),
          medications: this.normalizeArrayField(patientProfile?.medications),
        });
        this.previewImage = user?.profileImage || null;
      },
      error: (err) => console.error('Failed to load profile', err)
    });
  }

  private toDateInput(date: string): string {
    const d = new Date(date);
    const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
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
      this.selectedFile = file;

      // Optimistic preview
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result as string;
      };
      reader.readAsDataURL(file);

      // Upload to backend -> Cloudinary
      this.loading = true;
      this.profileService.uploadAvatar(file).subscribe({
        next: (res) => {
          const url = res?.data?.url || res?.url || null;
          if (url) {
            this.previewImage = url;
            // Store the final URL in the form (useful if backend profile also echoes it)
            this.form.get('profileImage')?.setValue(url);
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Avatar upload failed', err);
          this.loading = false;
        }
      });
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
      dateOfBirth: v.dateOfBirth || undefined,
      gender: v.gender || undefined,
      // profileImage is now handled by the dedicated upload endpoint,
      // but keep the URL if we already have it in the form (no base64 here)
      profileImage: v.profileImage || undefined,
      patientProfile: {
        bloodType: v.bloodType || undefined,
        height: v.height ? Number(v.height) : undefined,
        weight: v.weight ? Number(v.weight) : undefined,
        allergies: JSON.stringify(this.csvToArray(v.allergies)),
        medications: JSON.stringify(this.csvToArray(v.medications)),
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
