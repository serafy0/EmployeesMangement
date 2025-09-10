import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendanceService } from '../../../core/services/attendance/attendance.service';
import { FormsModule } from '@angular/forms';
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-daily-attendance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
  ],
  templateUrl: './daily-attendance.component.html',
  styleUrls: ['./daily-attendance.component.scss'],
})
export class DailyAttendanceComponent implements OnInit {
  dateModel: Date | null = new Date();
  attendance: any[] = [];
  pageIndex = 0;
  pageSize = 10;
  pageSizeOptions = [10, 25, 50];
  totalCount = 0;
  loading = false;
  isMobile = false;

  constructor(private svc: AttendanceService) {}

  ngOnInit(): void {
    this.updateSize(window.innerWidth);
    this.load(0, this.pageSize);
  }

  @HostListener('window:resize', ['$event'])
  onResize(ev: any) {
    this.updateSize(ev.target.innerWidth);
  }

  private updateSize(w: number) {
    this.isMobile = w < 720;
  }

  private toBackendDate(d?: Date | null): string | undefined {
    if (!d) return undefined;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  load(pageIndex = this.pageIndex, pageSize = this.pageSize): void {
    this.loading = true;
    const dateParam = this.toBackendDate(this.dateModel);
    this.svc.getDailyAttendance(dateParam, pageIndex, pageSize).subscribe({
      next: (res: any) => {
        this.attendance = res?.Data ?? res?.data ?? [];
        this.pageIndex = res?.PageIndex ?? res?.pageIndex ?? pageIndex;
        this.pageSize = res?.PageSize ?? res?.pageSize ?? pageSize;
        this.totalCount = res?.TotalCount ?? res?.totalCount ?? 0;
      },
      error: (err) => {
        console.error('Failed to load daily attendance', err);
        this.attendance = [];
        this.totalCount = 0;
      },
      complete: () => (this.loading = false),
    });
  }

  onPage(e: PageEvent): void {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.load(this.pageIndex, this.pageSize);
  }

  onDateChange(d: Date | null) {
    this.dateModel = d;
    this.pageIndex = 0;
    this.load(0, this.pageSize);
  }

  formatTimeIso(iso?: string | null): string {
    if (!iso) return '-';
    try {
      return new Date(iso).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Africa/Cairo',
      });
    } catch {
      const d = new Date(iso);
      return d.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  }

  displayTotalForRecord(r: any): string {
    const maybeServer =
      r.totalHours ??
      r.TotalHours ??
      r.totalHoursWorked ??
      r.TotalHoursWorked ??
      null;
    if (maybeServer != null && maybeServer !== '') {
      return this.formatTotalHours(maybeServer);
    }
    const inIso = r.checkInTime ?? r.CheckInTime ?? null;
    const outIso = r.checkOutTime ?? r.CheckOutTime ?? null;
    return this.computeDurationString(inIso, outIso);
  }

  private computeDurationString(
    inIso?: string | null,
    outIso?: string | null
  ): string {
    if (!inIso || !outIso) return '-';
    const tin = Date.parse(inIso);
    const tout = Date.parse(outIso);
    if (isNaN(tin) || isNaN(tout) || tout <= tin) return '-';
    const diffMs = tout - tin;
    const mins = Math.round(diffMs / 60000);
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hours === 0 && remMins === 0) return '0m';
    if (hours === 0) return `${remMins}m`;
    if (remMins === 0) return `${hours}h`;
    return `${hours}h ${remMins}m`;
  }

  private formatTotalHours(total: any): string {
    if (total == null) return '-';

    if (typeof total === 'number') {
      const hours = Math.floor(total);
      const mins = Math.round((total - hours) * 60);
      if (hours === 0 && mins === 0) return '0m';
      if (hours === 0) return `${mins}m`;
      if (mins === 0) return `${hours}h`;
      return `${hours}h ${mins}m`;
    }

    if (typeof total === 'string') {
      let days = 0;
      let hh = 0;
      let mm = 0;
      let ss = 0;

      // If format includes days as "d.hh:mm:ss"
      const daySplit = total.split('.');
      if (
        daySplit.length === 2 &&
        daySplit[0].match(/^\d+$/) &&
        daySplit[1].includes(':')
      ) {
        days = parseInt(daySplit[0], 10) || 0;
        total = daySplit[1];
      }

      const parts = total.split(':').map((p: string) => p.trim());
      if (parts.length === 3) {
        hh = parseInt(parts[0], 10) || 0;
        mm = parseInt(parts[1], 10) || 0;
        ss = parseFloat(parts[2]) || 0;
      } else if (parts.length === 2) {
        hh = 0;
        mm = parseInt(parts[0], 10) || 0;
        ss = parseFloat(parts[1]) || 0;
      } else {
        const asNum = parseFloat(total);
        if (!isNaN(asNum)) {
          ss = asNum;
        } else {
          return total;
        }
      }

      let totalSeconds = days * 86400 + hh * 3600 + mm * 60 + ss;
      let secs = Math.round(totalSeconds);
      const hours = Math.floor(secs / 3600);
      secs = secs % 3600;
      const mins = Math.floor(secs / 60);
      const seconds = secs % 60;

      if (hours > 0) {
        if (mins > 0) return `${hours}h ${mins}m`;
        return `${hours}h`;
      }
      if (mins > 0) {
        if (seconds > 0) return `${mins}m ${seconds}s`;
        return `${mins}m`;
      }
      return `${seconds}s`;
    }

    return String(total);
  }
}
