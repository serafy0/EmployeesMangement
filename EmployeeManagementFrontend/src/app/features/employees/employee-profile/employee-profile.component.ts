import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AttendanceService } from '../../../core/services/attendance/attendance.service';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatDividerModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.scss'],
  providers: [DatePipe],
})
export class EmployeeProfileComponent implements OnInit {
  user: any = null;
  startDate: Date | null = null;
  summary: any = null;
  loading = false;

  displayedColumns = ['date', 'checkIn', 'checkOut', 'hours'];
  dataSource: any[] = [];

  constructor(
    private auth: AuthService,
    private svc: AttendanceService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.user = this.auth.currentUserValue;
    this.startDate = new Date();
    this.loadSummary();
  }

  loadSummary() {
    this.loading = true;
    const param = this.startDate ? this.startDate.toISOString() : undefined;
    this.svc.getWeeklySummary(param).subscribe({
      next: (res) => {
        this.summary = res;
        const raw = res?.Details ?? res?.details ?? [];
        this.dataSource = raw.map((d: any) => ({
          date: d.date,
          checkIn: d.checkInTime ?? d.checkIn,
          checkOut: d.checkOutTime ?? d.checkOut,
          hours: d.hours ?? d.Hours ?? 0,
        }));
        this.loading = false;
      },
      error: () => {
        this.summary = null;
        this.dataSource = [];
        this.loading = false;
      },
    });
  }

  formatDate(value: string | Date | null) {
    if (!value) return '-';
    const d = new Date(value);
    return this.datePipe.transform(d, 'yyyy-MM-dd') ?? '-';
  }

  formatDateTime(value: string | Date | null) {
    if (!value) return '-';
    const d = new Date(value);
    return this.datePipe.transform(d, 'short') ?? '-';
  }
}
