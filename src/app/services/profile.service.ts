import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly API_URL = (environment as any).apiUrl || 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) {}

  // GET /api/v1/profile/me
  getMyProfile(): Observable<any> {
    return this.http.get(`${this.API_URL}/profile/me`);
  }

  // PATCH /api/v1/profile/me
  updateMyProfile(body: any): Observable<any> {
    return this.http.patch(`${this.API_URL}/profile/me`, body);
  }

  // POST /api/v1/profile/me/avatar (multipart/form-data)
  uploadAvatar(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http.post(`${this.API_URL}/profile/me/avatar`, formData);
  }
}
