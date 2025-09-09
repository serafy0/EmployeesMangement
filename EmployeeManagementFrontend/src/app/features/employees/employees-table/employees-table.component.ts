import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EmployeeService } from '../../../core/services/employee/employee.service';
import { ApiResult } from '../../../core/models/ApiResult.model';
import { EmployeeDTOForAdmins } from '../../../core/models/employee-dto-for-admins.model';
import { MatTableModule } from '@angular/material/table';
import {
  MatPaginatorModule,
  MatPaginator,
  PageEvent,
} from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-employees-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './employees-table.component.html',
  styleUrls: ['./employees-table.component.scss'],
})
export class EmployeesTableComponent implements OnInit, AfterViewInit {
  displayedColumns = [
    'firstName',
    'lastName',
    'nationalId',
    'phoneNumber',
    'age',
    'isPasswordSet',
    'actions',
  ];
  data: EmployeeDTOForAdmins[] = [];
  result: ApiResult<EmployeeDTOForAdmins> | null = null;
  columns = [
    'firstName',
    'lastName',
    'nationalId',
    'phoneNumber',
    'age',
    'isPasswordSet',
  ];
  filterColumn: string | null = null;
  filterQuery: string | null = null;
  loading = false;

  pageIndex = 0;
  pageSize = 10;

  sortColumn: string | null = null;
  sortOrder: 'ASC' | 'DESC' | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private svc: EmployeeService,
    private router: Router,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.load();
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.paginator.page.subscribe((pe: PageEvent) => {
        this.pageIndex = pe.pageIndex;
        this.pageSize = pe.pageSize;
        this.load();
      });
    }
    if (this.sort) {
      this.sort.sortChange.subscribe((s: Sort) => {
        this.pageIndex = 0;
        this.paginator && (this.paginator.pageIndex = 0);
        this.sortColumn = s.active || null;
        this.sortOrder = s.direction
          ? (s.direction.toUpperCase() as 'ASC' | 'DESC')
          : null;
        this.load();
      });
    }
  }

  load() {
    this.loading = true;
    this.svc
      .getEmployees({
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
        sortColumn: this.sortColumn,
        sortOrder: this.sortOrder,
        filterColumn: this.filterColumn,
        filterQuery: this.filterQuery,
      })
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.result = res;
          this.data = res.data;
        },
        error: (err) => {
          this.loading = false;
          this.snack.open('Failed to load employees', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  applyFilter() {
    this.pageIndex = 0;
    this.paginator && (this.paginator.pageIndex = 0);
    this.load();
  }

  clearFilter() {
    this.filterColumn = null;
    this.filterQuery = null;
    this.applyFilter();
  }

  onCreate() {
    this.router.navigate(['/employees/new']);
  }

  onEdit(e: EmployeeDTOForAdmins) {
    this.router.navigate([`/employees/${e.id}/edit`]);
  }

  onManageSignature(e: EmployeeDTOForAdmins) {
    this.router.navigate([`/employees/${e.id}/signature`]);
  }

  onDelete(e: EmployeeDTOForAdmins) {
    if (!confirm(`Delete ${e.firstName} ${e.lastName}?`)) return;
    this.svc.deleteEmployee(e.id).subscribe({
      next: () => this.load(),
      error: () =>
        this.snack.open('Failed to delete', 'Close', { duration: 3000 }),
    });
  }
}
