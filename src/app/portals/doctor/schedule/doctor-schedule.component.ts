import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarOptions } from '@fullcalendar/core';

// Note: In this setup we pass plugins via calendarOptions rather than registerPlugins

@Component({
  selector: 'app-doctor-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule, FullCalendarModule],
  template: `
  <div class="sched-wrap">
    <div class="sched-toolbar">
      <div class="left">
        <button (click)="view='timeGridWeek'" [class.active]="view==='timeGridWeek'">Week</button>
        <button (click)="view='timeGridDay'" [class.active]="view==='timeGridDay'">Day</button>
      </div>
      <div class="center">
        <button (click)="api?.prev()">◀</button>
        <button (click)="api?.today()">Today</button>
        <button (click)="api?.next()">▶</button>
      </div>
      <div class="right">{{ title }}</div>
    </div>

    <full-calendar
      [options]="calendarOptions"
    ></full-calendar>
  </div>

  <div class="modal-backdrop" *ngIf="modalOpen" (click)="closeModal()"></div>
  <div class="modal" *ngIf="modalOpen" (click)="$event.stopPropagation()">
    <h3>Reschedule</h3>
    <div class="form-grid">
      <label>New Date<input type="date" [(ngModel)]="newDate" /></label>
      <label>New Time<input type="time" [(ngModel)]="newTime" /></label>
      <label>Note<input type="text" [(ngModel)]="newNote" placeholder="Optional" /></label>
    </div>
    <div class="actions">
      <button class="muted" (click)="closeModal()">Cancel</button>
      <button class="primary" (click)="saveReschedule()">Save</button>
    </div>
    <div class="msg" *ngIf="msg">{{msg}}</div>
  </div>
  `,
  styles: [`
    .sched-wrap{ background:#fff; border:1px solid #e2e8f0; border-radius:12px; box-shadow:0 12px 28px rgba(2,132,199,0.08); overflow:hidden; }
    .sched-toolbar{ display:flex; align-items:center; justify-content:space-between; padding:8px 10px; background:linear-gradient(90deg,#0ea5a6 0%,#22c55e 100%); color:#fff; }
    .sched-toolbar .left button, .sched-toolbar .center button{ background:rgba(255,255,255,0.15); color:#fff; border:none; padding:6px 10px; border-radius:8px; margin-right:6px; }
    .sched-toolbar .left button.active{ background:#fff; color:#065f46; }
    .right{ font-weight:700; text-shadow:0 1px 2px rgba(0,0,0,0.2); }
    ::ng-deep .fc .fc-timegrid-slot{ height: 32px; }
    ::ng-deep .fc .fc-scrollgrid, ::ng-deep .fc-theme-standard td, ::ng-deep .fc-theme-standard th{ border-color:#e2e8f0; }
    ::ng-deep .fc .fc-day-today{ background: rgba(14,165,166,0.08); }
    ::ng-deep .fc .fc-event{ border-radius:10px; border:none; padding:2px 6px; box-shadow:0 10px 24px rgba(2,132,199,0.18); }
    ::ng-deep .fc .fc-event .fc-event-main{ color:#0b2530; font-weight:600; font-size:12px; }
    .modal-backdrop{ position:fixed; inset:0; background:rgba(2,6,23,0.55); }
    .modal{ position:fixed; left:50%; top:50%; transform:translate(-50%,-50%); background:#fff; width:min(420px, 92vw); border-radius:12px; border:1px solid #e2e8f0; box-shadow:0 20px 60px rgba(15,118,110,0.3); padding:16px; }
    .form-grid{ display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:8px; }
    .actions{ display:flex; justify-content:flex-end; gap:8px; }
    .primary{ background:#16a34a; color:#fff; border:none; padding:8px 12px; border-radius:8px; }
    .muted{ background:#e2e8f0; color:#0f172a; border:none; padding:8px 12px; border-radius:8px; }
    .msg{ margin-top:6px; color:#0f766e; }
  `]
})
export class DoctorScheduleComponent {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  view: 'timeGridWeek'|'timeGridDay' = 'timeGridWeek';
  title = '';
  api: any;
  events: any[] = [];
  calendarOptions: CalendarOptions = {
    plugins: [timeGridPlugin, dayGridPlugin, interactionPlugin],
    initialView: this.view,
    headerToolbar: false as any,
    slotMinTime: '08:00:00',
    slotMaxTime: '18:00:00',
    slotDuration: '00:30:00',
    allDaySlot: false,
    editable: true,
    selectable: true,
    expandRows: true,
    height: 'calc(100vh - 180px)',
    contentHeight: 'calc(100vh - 220px)',
    stickyHeaderDates: true,
    dayMaxEventRows: 3,
    events: (info, success, failure) => {
      const doctor = this.auth.getCurrentUser();
      if (!doctor) { success([]); return; }
      const params: any = {
        doctorId: (doctor as any).id,
        startDate: info.start.toISOString(),
        endDate: info.end.toISOString()
      };
      this.http.get<any>('http://localhost:3000/api/v1/appointments', { params }).subscribe({
        next: (res) => {
          const items = res?.data?.appointments || res?.data || [];
          const mapped = items.map((a: any) => {
            const start = a.appointmentDate || a.startTime || a.start;
            const durationMin = a.durationMinutes || 30;
            const computedEnd = a.endTime || (start ? new Date(new Date(start).getTime() + durationMin*60000).toISOString() : undefined);
            return {
              id: a.id,
              title: `${(a.patient?.firstName||'').trim()} ${(a.patient?.lastName||'').trim()}`.trim() || 'Patient',
              start,
              end: computedEnd,
              color: this.statusSolidColor(a.status),
              display: 'block',
              extendedProps: { notes: a.notes || a.reason || '', raw: a }
            };
          });
          success(mapped);
        },
        error: (err) => { console.error('Failed to load appointments', err); failure && failure(err); }
      })
    },
    datesSet: (arg) => this.onDatesSet(arg),
    eventDrop: (arg) => this.onEventDrop(arg),
    eventResize: (arg) => this.onEventResize(arg),
    eventClick: (arg) => this.onEventClick(arg),
    select: (arg) => this.onSelect(arg)
  };

  modalOpen = false;
  selectedEvent: any = null;
  newDate = '';
  newTime = '';
  newNote = '';
  msg = '';

  onDatesSet(arg: any){
    this.title = arg.view.title;
    this.api = arg.view.calendar;
  }

  onEventDrop(arg: any){ this.applyMoveResize(arg); }
  onEventResize(arg: any){ this.applyMoveResize(arg); }
  onEventClick(arg: any){
    this.selectedEvent = arg.event;
    const d = new Date(this.selectedEvent.start);
    this.newDate = d.toISOString().slice(0,10);
    this.newTime = d.toTimeString().slice(0,5);
    this.newNote = this.selectedEvent.extendedProps?.notes || '';
    this.msg = '';
    this.modalOpen = true;
  }
  onSelect(arg: any){
    // Quick create or reschedule modal for selected slot
    this.selectedEvent = { id: null, start: arg.start, end: arg.end };
    this.newDate = arg.startStr.slice(0,10);
    this.newTime = arg.startStr.slice(11,16);
    this.newNote = '';
    this.msg = '';
    this.modalOpen = true;
    this.api.unselect();
  }

  // fetching handled by events callback above

  private statusSolidColor(status?: string){
    switch ((status||'').toUpperCase()) {
      case 'COMPLETED': return '#22c55e';
      case 'CHECKED_IN': return '#06b6d4';
      case 'CANCELLED': return '#f97316';
      case 'NO_SHOW': return '#ef4444';
      default: return '#a78bfa';
    }
  }

  closeModal(){ this.modalOpen = false; this.selectedEvent = null; }

  private applyMoveResize(arg: any){
    const id = arg.event.id;
    const start = arg.event.start?.toISOString();
    if (!id || !start) return;
    this.http.patch<any>(`http://localhost:3000/api/v1/appointments/${id}`, { appointmentDate: start }).subscribe({
      next: () => {},
      error: () => arg.revert()
    });
  }

  saveReschedule(){
    if (!this.newDate || !this.newTime) return;
    const id = this.selectedEvent?.id;
    const start = new Date(`${this.newDate}T${this.newTime}:00`).toISOString();
    const body: any = { appointmentDate: start };
    if (this.newNote) body.notes = this.newNote;
    if (id) {
      this.http.patch<any>(`http://localhost:3000/api/v1/appointments/${id}`, body).subscribe({
        next: () => { this.msg = 'Saved'; setTimeout(()=>{ this.closeModal(); this.api?.refetchEvents?.() || this.api?.render(); }, 600); },
        error: () => { this.msg = 'Failed'; }
      });
    } else {
      // Optional: create a new slot if creating from selection (needs API support)
      this.msg = 'Creation not supported yet';
    }
  }
}
