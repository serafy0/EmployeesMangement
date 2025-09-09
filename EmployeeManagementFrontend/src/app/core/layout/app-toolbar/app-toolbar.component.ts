import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

// Material modules (import from specific entry points)
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService } from '../../services/auth.service';
import { MatDivider } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
    MatDivider,
    MatTableModule,
  ],
  templateUrl: './app-toolbar.component.html',
  styleUrls: ['./app-toolbar.component.scss'],
})
export class AppToolbarComponent {
  isSmall = false;

  constructor(public auth: AuthService, private router: Router) {
    this.updateSize(window.innerWidth);
  }

  @HostListener('window:resize', ['$event'])
  onResize(e: any) {
    this.updateSize(e.target.innerWidth);
  }
  private updateSize(width: number) {
    this.isSmall = width < 900;
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
