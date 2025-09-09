import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminNavComponent } from './core/layout/admin-nav/admin-nav.component';
import { EmployeeNavComponent } from './core/layout/employee-nav/employee-nav.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AdminNavComponent, EmployeeNavComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'EmployeeManagementFrontend';
}
