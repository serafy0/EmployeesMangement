import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../../../core/services/attendance/attendance.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-employee-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatPaginatorModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  templateUrl: './employee-history.component.html',
  styleUrls: ['./employee-history.component.scss'],
})
export class EmployeeHistoryComponent implements OnInit {
  pageIndex = 0;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25];
  totalCount = 0;
  data: any[] = [];
  loading = false;

  isMobile = false;
  cols = 3;

  private datePipe = new DatePipe('en-US');

  constructor(private svc: AttendanceService) {}

  ngOnInit(): void {
    this.updateSize(window.innerWidth);
    this.load(0, this.pageSize);
  }

  @HostListener('window:resize', ['$event'])
  onResize(e: any) {
    this.updateSize(e.target.innerWidth);
  }

  private updateSize(width: number) {
    this.isMobile = width < 720;
    if (width < 420) this.cols = 1;
    else if (width < 900) this.cols = 2;
    else this.cols = 3;
  }

  load(pageIndex = 0, pageSize = 10) {
    this.loading = true;
    this.svc.getHistory(pageIndex, pageSize).subscribe({
      next: (res: any) => {
        this.data = res?.Data ?? res?.data ?? [];
        this.pageIndex = res?.PageIndex ?? res?.pageIndex ?? pageIndex;
        this.pageSize = res?.PageSize ?? res?.pageSize ?? pageSize;
        this.totalCount = res?.TotalCount ?? res?.totalCount ?? 0;
      },
      error: () => {
        this.data = [];
        this.totalCount = 0;
      },
      complete: () => (this.loading = false),
    });
  }

  onPage(e: PageEvent) {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.load(this.pageIndex, this.pageSize);
  }

  formatDate(dateStr?: string | null) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return this.datePipe.transform(d, 'EEE, MMM d, y') ?? '-';
  }

  formatTime(dateStr?: string | null) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return this.datePipe.transform(d, 'shortTime') ?? '-';
  }

  formatHours(totalHours: any) {
    if (totalHours === null || totalHours === undefined || totalHours === '')
      return '-';

    if (typeof totalHours === 'number' && !isNaN(totalHours)) {
      const hrs = Math.floor(totalHours);
      const mins = Math.round((totalHours - hrs) * 60);
      if (hrs > 0) return `${hrs}h ${mins}m`;
      if (mins > 0) return `${mins}m`;
      return '0m';
    }

    if (typeof totalHours === 'string') {
      const ts = totalHours.trim();
      const match = ts.match(/^(\d{1,2}):(\d{2}):(\d{2})(\.\d+)?$/);
      if (match) {
        const h = parseInt(match[1], 10);
        const m = parseInt(match[2], 10);
        const s = parseInt(match[3], 10);
        if (h > 0) return `${h}h ${m}m`;
        if (m > 0) return `${m}m ${s}s`;
        return `${s}s`;
      }

      const asNum = parseFloat(ts);
      if (!isNaN(asNum)) {
        const hrs = Math.floor(asNum);
        const mins = Math.round((asNum - hrs) * 60);
        if (hrs > 0) return `${hrs}h ${mins}m`;
        if (mins > 0) return `${mins}m`;
        return '0m';
      }
    }

    return String(totalHours);
  }
}
