import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { InitialSetupComponent } from './features/auth/initial-setup/initial-setup.component';
import { authGuard } from './core/guards/auth.guard';
import { DashboardComponent } from './features/dashboard/dashboard/dashboard.component';
import { EmployeesTableComponent } from './features/employees/employees-table/employees-table.component';
import { DailyAttendanceComponent } from './features/attendance/daily-attendance/daily-attendance.component';
import { EmployeeCreateComponent } from './features/employees/employee-create/employee-create.component';
import { EmployeeEditComponent } from './features/employees/employee-edit/employee-edit.component';
import { SignatureManagerComponent } from './features/signature/signature-manager/signature-manager.component';
import { EmployeeCheckinComponent } from './features/attendance/employee-checkin/employee-checkin.component';
import { EmployeeHistoryComponent } from './features/attendance/employee-history/employee-history.component';
import { EmployeeProfileComponent } from './features/employees/employee-profile/employee-profile.component';
import { EmployeeSignatureComponent } from './features/signature/employee-signature/employee-signature.component';
import { WeeklyAttendanceComponent } from './features/attendance/weekly-attendance/weekly-attendance.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'initial-setup', component: InitialSetupComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },

  // Default and wildcard routes
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'employees-table',
    component: EmployeesTableComponent,
    canActivate: [authGuard],
    data: { roles: ['Admin'] },
  },
  {
    path: 'employees',
    component: EmployeesTableComponent,
    canActivate: [authGuard],
    data: { roles: ['Admin'] },
  },
  {
    path: 'employees/new',
    component: EmployeeCreateComponent,
    canActivate: [authGuard],
    data: { roles: ['Admin'] },
  },
  {
    path: 'employees/:id/edit',
    component: EmployeeEditComponent,
    canActivate: [authGuard],
    data: { roles: ['Admin'] },
  },
  {
    path: 'employees/:id/signature',
    component: SignatureManagerComponent,
    canActivate: [authGuard],
    data: { roles: ['Admin'] },
  },
  {
    path: 'signature',
    component: SignatureManagerComponent,
    canActivate: [authGuard],
  },
  {
    path: 'attendance/daily',
    component: DailyAttendanceComponent,
    canActivate: [authGuard],
    data: { roles: ['Admin'] },
  },
  {
    path: 'attendance/weekly',
    component: WeeklyAttendanceComponent,
    canActivate: [authGuard],
    data: { roles: ['Admin'] },
  },
  {
    path: 'me/profile',
    component: EmployeeProfileComponent,
    canActivate: [authGuard],
    data: { roles: ['Employee'] },
  },
  {
    path: 'me/checkin',
    component: EmployeeCheckinComponent,
    canActivate: [authGuard],
    data: { roles: ['Employee'] },
  },
  {
    path: 'me/history',
    component: EmployeeHistoryComponent,
    canActivate: [authGuard],
    data: { roles: ['Employee'] },
  },
  {
    path: 'me/signature',
    component: EmployeeSignatureComponent,
    canActivate: [authGuard],
    data: { roles: ['Employee'] },
  },
  { path: '**', redirectTo: '/dashboard' },
];
