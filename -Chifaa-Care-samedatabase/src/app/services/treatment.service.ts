import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TreatmentPlan {
  id: string;
  patientId: string;
  doctorId: string;
  title: string;
  diagnosis?: string;
  goals?: string;
  carePlan?: string;
  status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TreatmentNote {
  id: string;
  planId: string;
  doctorId: string;
  content: string;
  isImportant: boolean;
  createdAt: string;
}

export interface Medication {
  id: string;
  planId: string;
  name: string;
  dose?: string;
  frequency?: string;
  route?: string;
  instructions?: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class TreatmentService {
  private baseUrl = `${environment.apiUrl}/treatments`;

  constructor(private http: HttpClient) {}

  // PLANS
  listPlans(options?: { patientId?: string; status?: string }): Observable<TreatmentPlan[]> {
    let params = new HttpParams();
    if (options?.patientId) params = params.set('patientId', options.patientId);
    if (options?.status) params = params.set('status', options.status);

    return this.http.get<any>(`${this.baseUrl}/plan`, { params }).pipe(
      map(resp => (resp?.data?.plans || resp || []) as TreatmentPlan[])
    );
  }

  getPlanById(id: string): Observable<TreatmentPlan & { notes: TreatmentNote[]; medications: Medication[] }> {
    return this.http.get<any>(`${this.baseUrl}/plan/${id}`).pipe(
      map(resp => (resp?.data?.plan || resp) as TreatmentPlan & { notes: TreatmentNote[]; medications: Medication[] })
    );
  }

  createPlan(input: Partial<TreatmentPlan> & { patientId: string; title: string }): Observable<TreatmentPlan> {
    return this.http.post<any>(`${this.baseUrl}/plan`, input).pipe(
      map(resp => (resp?.data?.plan || resp) as TreatmentPlan)
    );
  }

  updatePlan(id: string, input: Partial<TreatmentPlan>): Observable<TreatmentPlan> {
    return this.http.patch<any>(`${this.baseUrl}/plan/${id}`, input).pipe(
      map(resp => (resp?.data?.plan || resp) as TreatmentPlan)
    );
  }

  // NOTES
  listNotes(planId: string): Observable<TreatmentNote[]> {
    return this.http.get<any>(`${this.baseUrl}/plan/${planId}/notes`).pipe(
      map(resp => (resp?.data?.notes || resp || []) as TreatmentNote[])
    );
  }

  addNote(planId: string, input: { content: string; isImportant?: boolean }): Observable<TreatmentNote> {
    return this.http.post<any>(`${this.baseUrl}/plan/${planId}/notes`, input).pipe(
      map(resp => (resp?.data?.note || resp) as TreatmentNote)
    );
  }

  // MEDICATIONS
  listMedications(planId: string): Observable<Medication[]> {
    return this.http.get<any>(`${this.baseUrl}/plan/${planId}/medications`).pipe(
      map(resp => (resp?.data?.medications || resp || []) as Medication[])
    );
  }

  addMedication(
    planId: string,
    input: { name: string; dose?: string; frequency?: string; route?: string; instructions?: string; startDate?: string; endDate?: string; isActive?: boolean }
  ): Observable<Medication> {
    return this.http.post<any>(`${this.baseUrl}/plan/${planId}/medications`, input).pipe(
      map(resp => (resp?.data?.medication || resp) as Medication)
    );
  }
}
