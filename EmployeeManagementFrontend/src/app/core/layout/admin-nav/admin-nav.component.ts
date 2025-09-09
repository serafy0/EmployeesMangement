import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-nav',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-nav.component.html',
})
export class AdminNavComponent {
  constructor(public auth: AuthService) {}
}
