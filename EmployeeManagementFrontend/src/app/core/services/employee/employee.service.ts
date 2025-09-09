import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResult } from '../../models/ApiResult.model';
import { EmployeeDTOForAdmins } from '../../models/employee-dto-for-admins.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  // private baseUrl = '/api/employees'; // adjust if your API root differs
  private baseUrl = `${environment.apiUrl}/employees`;

  constructor(private http: HttpClient) {}

  getEmployees(options: {
    pageIndex?: number;
    pageSize?: number;
    sortColumn?: string | null;
    sortOrder?: string | null; // "ASC" or "DESC"
    filterColumn?: string | null;
    filterQuery?: string | null;
  }): Observable<ApiResult<EmployeeDTOForAdmins>> {
    let params = new HttpParams()
      .set('pageIndex', (options.pageIndex ?? 0).toString())
      .set('pageSize', (options.pageSize ?? 10).toString());

    if (options.sortColumn)
      params = params.set('sortColumn', options.sortColumn);
    if (options.sortOrder) params = params.set('sortOrder', options.sortOrder);
    if (options.filterColumn)
      params = params.set('filterColumn', options.filterColumn);
    if (options.filterQuery)
      params = params.set('filterQuery', options.filterQuery);

    return this.http.get<ApiResult<EmployeeDTOForAdmins>>(this.baseUrl, {
      params,
    });
  }

  deleteEmployee(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  updateEmployee(id: string, payload: Partial<EmployeeDTOForAdmins>) {
    return this.http.put(`${this.baseUrl}/${id}`, payload);
  }
  createEmployee(payload: any) {
    return this.http.post(`${this.baseUrl}`, payload);
  }

  getEmployeeById(id: string) {
    return this.http.get(`${this.baseUrl}/${id}`);
  }
}
