import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendanceService } from '../../../core/services/attendance/attendance.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-daily-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './daily-attendance.component.html',
})
export class DailyAttendanceComponent implements OnInit {
  date: string | null = null;
  attendance: any = null;
  summaries: any = null;

  constructor(private svc: AttendanceService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.svc
      .getDailyAttendance(this.date ?? undefined)
      .subscribe((r) => (this.attendance = r));
  }

  loadSummaries() {
    this.svc.getAttendanceSummaries().subscribe((r) => (this.summaries = r));
  }
}
