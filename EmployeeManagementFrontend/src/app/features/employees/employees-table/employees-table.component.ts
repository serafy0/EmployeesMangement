import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EmployeeService } from '../../../core/services/employee/employee.service';
import { ApiResult } from '../../../core/models/ApiResult.model';
import { EmployeeDTOForAdmins } from '../../../core/models/employee-dto-for-admins.model';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog.component';

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
    MatDialogModule,
    MatDividerModule,
  ],
  templateUrl: './employees-table.component.html',
  styleUrls: ['./employees-table.component.scss'],
})
export class EmployeesTableComponent implements OnInit {
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
  pageSizeOptions = [5, 10, 25, 50];
  sortColumn: string | null = null;
  sortOrder: 'ASC' | 'DESC' | null = null;

  isMobile = false;
  isTablet = false;

  constructor(
    private svc: EmployeeService,
    private router: Router,
    private snack: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.updateSize(window.innerWidth);
    this.load();
  }

  @HostListener('window:resize', ['$event'])
  onResize(e: any) {
    this.updateSize(e.target.innerWidth);
  }
  private updateSize(width: number) {
    this.isMobile = width < 720;
    this.isTablet = width >= 720 && width < 1024;
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
          this.data = res.data ?? [];
          this.pageIndex = res.pageIndex ?? this.pageIndex;
          this.pageSize = res.pageSize ?? this.pageSize;
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
    this.load();
  }

  clearFilter() {
    this.filterColumn = null;
    this.filterQuery = null;
    this.applyFilter();
  }

  onPage(e: PageEvent) {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.load();
  }

  onSort(s: Sort) {
    this.pageIndex = 0;
    this.sortColumn = s.active || null;
    this.sortOrder = s.direction
      ? (s.direction.toUpperCase() as 'ASC' | 'DESC')
      : null;
    this.load();
  }

  onCreate() {
    this.router.navigate(['/employees/new']);
  }

  onEdit(e: EmployeeDTOForAdmins | null) {
    if (!e) return;
    this.router.navigate([`/employees/${e.id}/edit`]);
  }

  onManageSignature(e: EmployeeDTOForAdmins | null) {
    if (!e) return;
    this.router.navigate([`/employees/${e.id}/signature`]);
  }

  onDelete(e: EmployeeDTOForAdmins | null) {
    if (!e) return;
    const ref = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '380px',
      data: { name: `${e.firstName} ${e.lastName}` },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.svc.deleteEmployee(e.id).subscribe({
        next: () => {
          this.snack.open('Deleted', 'Close', { duration: 2500 });
          this.load();
        },
        error: () =>
          this.snack.open('Failed to delete', 'Close', { duration: 3000 }),
      });
    });
  }
}
