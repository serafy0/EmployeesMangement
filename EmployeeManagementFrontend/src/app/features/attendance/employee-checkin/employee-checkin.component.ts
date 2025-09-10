import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendanceService } from '../../../core/services/attendance/attendance.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-employee-checkin',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './employee-checkin.component.html',
  styleUrls: ['./employee-checkin.component.scss'],
})
export class EmployeeCheckinComponent implements OnInit {
  loading = false;
  checkingStatus = true;
  isCheckedIn = false;
  checkInTimeCairo: string | null = null;

  constructor(
    private svc: AttendanceService,
    private snack: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStatus();
  }

  loadStatus() {
    this.checkingStatus = true;
    this.svc
      .isCheckedIn()
      .pipe(finalize(() => (this.checkingStatus = false)))
      .subscribe({
        next: (res) => {
          this.isCheckedIn = !!res?.isCheckedIn;
          this.checkInTimeCairo = res?.checkInTimeCairo ?? null;
        },
        error: (err) => {
          this.isCheckedIn = false;
          this.checkInTimeCairo = null;
          const msg = err?.error?.message ?? 'Failed to load status';
          this.snack.open(msg, 'Close', { duration: 3500 });
        },
      });
  }

  doCheckIn() {
    if (this.loading) return;
    this.loading = true;
    this.svc
      .checkIn()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          this.snack.open(res?.message ?? 'Checked in', 'Close', {
            duration: 3000,
          });
          this.isCheckedIn = true;
          this.checkInTimeCairo = res?.checkInTimeCairo ?? null;
        },
        error: (err) => {
          const msg = err?.error?.message ?? 'Check-in failed';
          this.snack.open(msg, 'Close', { duration: 4000 });
        },
      });
  }

  openHistory() {
    this.router.navigate(['/me/history']);
  }
}
