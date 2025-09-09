import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendanceService } from '../../../core/services/attendance/attendance.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-employee-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: `./employee-history.component.html`,
})
export class EmployeeHistoryComponent implements OnInit {
  pageIndex = 0;
  pageSize = 10;
  data: any = null;

  constructor(private svc: AttendanceService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.svc.getHistory(this.pageIndex, this.pageSize).subscribe({
      next: (res) => (this.data = res),
      error: (err) => (this.data = err.error ?? err),
    });
  }

  next() {
    this.pageIndex++;
    this.load();
  }
  prev() {
    if (this.pageIndex > 0) this.pageIndex--;
    this.load();
  }
}
