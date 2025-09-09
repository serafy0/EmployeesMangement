import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../../../core/services/employee/employee.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiResult } from '../../../core/models/ApiResult.model';
import { EmployeeDTOForAdmins } from '../../../core/models/employee-dto-for-admins.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employees-table',
  templateUrl: './employees-table.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class EmployeesTableComponent implements OnInit {
  employees: EmployeeDTOForAdmins[] = [];
  result: ApiResult<EmployeeDTOForAdmins> | null = null;

  // paging & sorting state
  pageIndex = 0;
  pageSize = 10;
  sortColumn: string | null = null;
  sortOrder: 'ASC' | 'DESC' | null = null;

  // filtering
  filterColumn: string | null = null;
  filterQuery: string | null = null;

  // columns available for sorting/filtering
  columns = [
    'firstName',
    'lastName',
    'nationalId',
    'phoneNumber',
    'age',
    'isPasswordSet',
  ];

  constructor(private svc: EmployeeService, private router: Router) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.svc
      .getEmployees({
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
        sortColumn: this.sortColumn,
        sortOrder: this.sortOrder,
        filterColumn: this.filterColumn,
        filterQuery: this.filterQuery,
      })
      .subscribe((res) => {
        this.result = res;
        this.employees = res.data;
      });
  }

  // header click toggles sorting
  toggleSort(column: string) {
    if (this.sortColumn !== column) {
      this.sortColumn = column;
      this.sortOrder = 'ASC';
    } else if (this.sortOrder === 'ASC') {
      this.sortOrder = 'DESC';
    } else {
      this.sortColumn = null;
      this.sortOrder = null;
    }
    this.pageIndex = 0;
    this.load();
  }

  // pagination
  next() {
    if (this.result && this.result.hasNextPage) {
      this.pageIndex++;
      this.load();
    }
  }

  prev() {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.load();
    }
  }

  setPageSize(size: number) {
    this.pageSize = size;
    this.pageIndex = 0;
    this.load();
  }

  applyFilter() {
    this.pageIndex = 0;
    this.load();
  }

  clearFilter() {
    this.filterColumn = null;
    this.filterQuery = null;
    this.pageIndex = 0;
    this.load();
  }

  onDelete(employee: EmployeeDTOForAdmins) {
    if (!confirm(`Delete ${employee.firstName} ${employee.lastName}?`)) return;
    this.svc.deleteEmployee(employee.id).subscribe(() => this.load());
  }

  onCreate() {
    this.router.navigate(['/employees/new']);
  }

  onEdit(employee: EmployeeDTOForAdmins) {
    this.router.navigate([`/employees/${employee.id}/edit`]);
  }

  onManageSignature(employee: EmployeeDTOForAdmins) {
    this.router.navigate([`/employees/${employee.id}/signature`]);
  }
}
