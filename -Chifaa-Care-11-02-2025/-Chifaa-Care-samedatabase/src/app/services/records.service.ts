import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MedicalRecord {
  id: string;
  patientProfileId: string;
  condition: string;
  diagnosisDate: string;
  status: string;
  notes?: string;
  attachments: string; // JSON string array
}

@Injectable({ providedIn: 'root' })
export class RecordsService {
  private baseUrl = `${environment.apiUrl}/records`;

  constructor(private http: HttpClient) {}

  list(patientId: string): Observable<MedicalRecord[]> {
    const params = new HttpParams().set('patientId', patientId);
    return this.http.get<any>(`${this.baseUrl}`, { params }).pipe(
      map(resp => (resp?.data?.records || resp || []) as MedicalRecord[])
    );
  }

  create(input: { patientId: string; condition: string; diagnosisDate: string; status: string; notes?: string }): Observable<MedicalRecord> {
    return this.http.post<any>(`${this.baseUrl}`, input).pipe(
      map(resp => (resp?.data?.record || resp) as MedicalRecord)
    );
  }

  addAttachment(recordId: string, input: { url: string; name?: string }): Observable<MedicalRecord> {
    return this.http.post<any>(`${this.baseUrl}/${recordId}/attachments`, input).pipe(
      map(resp => (resp?.data?.record || resp) as MedicalRecord)
    );
  }

  parseAttachments(rec: MedicalRecord): { url: string; name?: string; addedAt?: string }[] {
    try {
      const a = JSON.parse(rec.attachments || '[]');
      return Array.isArray(a) ? a : [];
    } catch {
      return [];
    }
  }
}
