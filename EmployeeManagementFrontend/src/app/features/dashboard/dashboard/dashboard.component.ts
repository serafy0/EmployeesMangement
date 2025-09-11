import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface Tile {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  currentUser: User | null;
  tiles: Tile[] = [];
  primaryAction: Tile | null = null;

  constructor(private auth: AuthService, private router: Router) {
    this.currentUser = this.auth.currentUserValue;
    this.buildTiles();
    this.buildPrimaryAction();
  }

  buildTiles() {
    const t: Tile[] = [];

    if (this.currentUser?.roles.includes('Admin')) {
      t.push(
        { label: 'Employees', route: '/employees', icon: 'people' },
        { label: 'Add Employee', route: '/employees/new', icon: 'person_add' },
        {
          label: 'Daily Attendance',
          route: '/attendance/daily',
          icon: 'today',
        },
        {
          label: 'Weekly Attendance',
          route: '/attendance/weekly',
          icon: 'calendar_today',
        }
      );
    }

    if (this.currentUser?.roles.includes('Employee')) {
      t.push(
        { label: 'My Profile', route: '/me/profile', icon: 'person' },
        { label: 'Check-In', route: '/me/checkin', icon: 'check_circle' },
        { label: 'History', route: '/me/history', icon: 'history' },
        { label: 'Signature', route: '/me/signature', icon: 'edit' }
      );
    }

    this.tiles = t;
  }

  buildPrimaryAction() {
    if (this.currentUser?.roles.includes('Admin')) {
      this.primaryAction = {
        label: 'Daily Attendance',
        route: '/attendance/daily',
        icon: 'today',
      };
    } else if (this.currentUser?.roles.includes('Employee')) {
      this.primaryAction = {
        label: 'Check-In',
        route: '/me/checkin',
        icon: 'check_circle',
      };
    } else {
      this.primaryAction = null;
    }
  }

  navigate(route: string) {
    this.router.navigate([route]);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
