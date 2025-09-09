import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SignatureService {
  private base = `${environment.apiUrl}/signature`;

  constructor(private http: HttpClient) {}

  getMySignature(): Observable<any> {
    return this.http.get(`${this.base}/me`);
  }

  getUserSignature(userId: string): Observable<any> {
    return this.http.get(`${this.base}/${userId}`);
  }

  uploadFile(file: File, userId?: string): Observable<any> {
    const fd = new FormData();
    fd.append('file', file);
    const params = userId ? new HttpParams().set('userId', userId) : undefined;
    return this.http.post(`${this.base}`, fd, { params });
  }

  uploadBase64(base64: string, userId?: string): Observable<any> {
    return this.http.post(`${this.base}/base64`, { userId, base64 });
  }

  delete(userId?: string): Observable<any> {
    const params = userId ? new HttpParams().set('userId', userId) : undefined;
    return this.http.delete(`${this.base}`, { params });
  }
}
