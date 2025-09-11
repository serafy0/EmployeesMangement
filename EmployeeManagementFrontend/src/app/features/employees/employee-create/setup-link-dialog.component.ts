import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-setup-link-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatTooltipModule,
  ],
  template: `
    <h2 mat-dialog-title>Setup link</h2>
    <mat-dialog-content>
      <div style="display:flex;gap:8px;align-items:center;">
        <input
          readonly
          [value]="data.setupUrl"
          style="flex:1;padding:8px;border-radius:4px;border:1px solid #ddd"
        />
        <button mat-icon-button matTooltip="Copy link" (click)="copy()">
          <mat-icon>content_copy</mat-icon>
        </button>
      </div>
      <div style="margin-top:12px;color:rgba(0,0,0,0.7)">
        This link is valid for {{ data.validForHours ?? 24 }} hours (expires at
        {{ expiresAtLocal }}).
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button (click)="close()">Close</button>
    </mat-dialog-actions>
  `,
})
export class SetupLinkDialogComponent {
  expiresAtLocal = '';
  constructor(
    public dialogRef: MatDialogRef<SetupLinkDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      setupUrl: string;
      validForHours?: number;
      tokenExpiresAtUtc?: string;
    }
  ) {
    if (data?.tokenExpiresAtUtc) {
      try {
        const d = new Date(data.tokenExpiresAtUtc);
        this.expiresAtLocal = d.toLocaleString();
      } catch {
        this.expiresAtLocal = data.tokenExpiresAtUtc;
      }
    } else {
      this.expiresAtLocal = '';
    }
  }

  copy() {
    if (navigator && (navigator as any).clipboard) {
      navigator.clipboard.writeText(this.data.setupUrl);
    } else {
      const ta = document.createElement('textarea');
      ta.value = this.data.setupUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  }

  close() {
    this.dialogRef.close();
  }
}
