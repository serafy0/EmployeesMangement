import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

import { User } from '../models/user.model';
import { AuthResponse } from '../models/auth-response.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/Auth`;

  // BehaviorSubject to hold the current user state, allowing components to subscribe to changes.
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  login(phoneNumber: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, { phoneNumber, password })
      .pipe(
        tap((response) => {
          if (response.success && response.user && response.token) {
            this.handleAuthentication(response);
          }
        })
      );
  }

  setInitialPassword(
    phoneNumber: string,
    resetToken: string,
    newPassword: string,
    confirmPassword: string
  ): Observable<AuthResponse> {
    const payload = { phoneNumber, resetToken, newPassword, confirmPassword };
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/set-employee-password`, payload)
      .pipe(
        tap((response) => {
          if (response.success && response.user && response.token) {
            this.handleAuthentication(response);
          }
        })
      );
  }

  logout(): void {
    // Clear user data and token, then navigate to login
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  hasRole(role: 'Admin' | 'Employee'): boolean {
    return this.currentUserValue?.roles.includes(role) ?? false;
  }

  private handleAuthentication(response: AuthResponse): void {
    if (!response.token || !response.user) return;

    // Store token and user data
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('currentUser', JSON.stringify(response.user));

    this.currentUserSubject.next(response.user);
  }

  private loadUserFromStorage(): void {
    const token = this.getToken();
    const userJson = localStorage.getItem('currentUser');

    if (token && userJson) {
      const user: User = JSON.parse(userJson);
      this.currentUserSubject.next(user);
    }
  }
}
