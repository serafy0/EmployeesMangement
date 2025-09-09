import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private base = `${environment.apiUrl}/attendance`;

  constructor(private http: HttpClient) {}

  checkIn(): Observable<any> {
    return this.http.post(`${this.base}/checkin`, {});
  }

  checkOut(): Observable<any> {
    return this.http.post(`${this.base}/checkout`, {});
  }

  getHistory(pageIndex = 0, pageSize = 10): Observable<any> {
    const params = new HttpParams()
      .set('pageIndex', pageIndex)
      .set('pageSize', pageSize);
    return this.http.get(`${this.base}/history`, { params });
  }

  getWeeklySummary(startDate?: string): Observable<any> {
    const params = new HttpParams({
      fromObject: startDate ? { startDate } : {},
    });
    return this.http.get(`${this.base}/weekly-summary-for-employee`, {
      params,
    });
  }

  // Admin
  getDailyAttendance(
    date?: string,
    pageIndex = 0,
    pageSize = 50
  ): Observable<any> {
    const params = new HttpParams()
      .set('pageIndex', pageIndex)
      .set('pageSize', pageSize);
    if (date)
      return this.http.get(`${this.base}/daily`, {
        params: params.set('date', date),
      });
    return this.http.get(`${this.base}/daily`, { params });
  }

  getAllWeeklyHours(
    startDate?: string,
    pageIndex = 0,
    pageSize = 50
  ): Observable<any> {
    const params = new HttpParams()
      .set('pageIndex', pageIndex)
      .set('pageSize', pageSize);
    if (startDate)
      return this.http.get(`${this.base}/all-weekly-hours`, {
        params: params.set('startDate', startDate),
      });
    return this.http.get(`${this.base}/all-weekly-hours`, { params });
  }

  getAttendanceSummaries(): Observable<any> {
    return this.http.get(`${this.base}/attendance-summaries`);
  }
}
