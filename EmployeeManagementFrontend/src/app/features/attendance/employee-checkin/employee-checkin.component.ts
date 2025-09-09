import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendanceService } from '../../../core/services/attendance/attendance.service';

@Component({
  selector: 'app-employee-checkin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: `./employee-checkin.component.html`,
})
export class EmployeeCheckinComponent {
  loading = false;
  message: any = null;
  lastResponse: any = null;

  constructor(private svc: AttendanceService) {}

  doCheckIn() {
    this.loading = true;
    this.message = null;
    this.svc.checkIn().subscribe({
      next: (res) => {
        this.lastResponse = res;
        this.message = res.message ?? res;
        this.loading = false;
      },
      error: (err) => {
        this.lastResponse = err.error ?? err;
        this.message = err.error?.message ?? err.message ?? err;
        this.loading = false;
      },
    });
  }

  doCheckOut() {
    this.loading = true;
    this.message = null;
    this.svc.checkOut().subscribe({
      next: (res) => {
        this.lastResponse = res;
        this.message = res.message ?? res;
        this.loading = false;
      },
      error: (err) => {
        this.lastResponse = err.error ?? err;
        this.message = err.error?.message ?? err.message ?? err;
        this.loading = false;
      },
    });
  }
}
