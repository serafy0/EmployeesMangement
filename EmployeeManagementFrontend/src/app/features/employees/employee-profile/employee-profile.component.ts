import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AttendanceService } from '../../../core/services/attendance/attendance.service';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './employee-profile.component.html',
})
export class EmployeeProfileComponent implements OnInit {
  user: any = null;
  startDate: string | null = null;
  summary: any = null;

  constructor(private auth: AuthService, private svc: AttendanceService) {}

  ngOnInit() {
    this.user = this.auth.currentUserValue;
    this.loadSummary();
  }

  loadSummary() {
    // backend accepts optional startDate (DateTime string). We'll pass ISO date if present.
    const param = this.startDate ? this.startDate : undefined;
    this.svc.getWeeklySummary(param).subscribe({
      next: (res) => (this.summary = res),
      error: (err) => (this.summary = err.error ?? err),
    });
  }
}
