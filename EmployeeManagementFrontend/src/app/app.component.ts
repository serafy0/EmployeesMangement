import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppToolbarComponent } from './core/layout/app-toolbar/app-toolbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppToolbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'EmployeeManagementFrontend';
}
