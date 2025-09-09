import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-employee-nav',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './employee-nav.component.html',
})
export class EmployeeNavComponent {
  constructor(public auth: AuthService) {}
}
